// Integração com APIs de preços reais.
// Cripto (BTC, XRP): CoinGecko — gratuita, sem necessidade de chave.
// Metais (XAU, XAG): gold-api.com — preço atual é gratuito sem chave;
// o histórico (usado no replay) precisa de uma chave gratuita.
// Veja o README para instruções de como conseguir e configurar essa chave.

export type PricePoint = {
  date: string; // formato YYYY-MM-DD
  price: number;
};

export type Candle = {
  date: string; // formato YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
};

export type LivePrice = {
  price: number;
  change: number; // variação percentual em 24h
};

const COINGECKO_IDS: Record<string, string> = {
  btc: 'bitcoin',
  xrp: 'ripple',
};

const METAL_SYMBOLS: Record<string, string> = {
  xau: 'XAU',
  xag: 'XAG',
};

function isCrypto(slug: string) {
  return slug in COINGECKO_IDS;
}

// Tenta de novo uma vez, com uma pequena espera, se a API responder
// "429 Too Many Requests" — evita falhas só por causa de rajadas de chamadas.
async function fetchWithRetry(url: string, options: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return res;
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return null;
    }
  }
  return null;
}

// --- preço atual ---

// Busca BTC e XRP numa única chamada (em vez de uma pra cada),
// pra gastar menos do limite gratuito da CoinGecko.
let cryptoPricesCache: Record<string, LivePrice> | null = null;

async function fetchAllCryptoPrices(): Promise<Record<string, LivePrice>> {
  if (cryptoPricesCache) return cryptoPricesCache;

  const ids = Object.values(COINGECKO_IDS).join(',');
  const result: Record<string, LivePrice> = {};

  const res = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { next: { revalidate: 60 } }
  );

  if (res && res.ok) {
    const data = await res.json();
    for (const [slug, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]) {
        result[slug] = { price: data[id].usd, change: data[id].usd_24h_change ?? 0 };
      }
    }
  } else {
    console.error(`[fetchAllCryptoPrices] falhou: status ${res?.status ?? 'sem resposta'}`);
  }

  cryptoPricesCache = result;
  return result;
}

async function fetchCryptoPrice(slug: string): Promise<LivePrice | null> {
  const prices = await fetchAllCryptoPrices();
  return prices[slug] ?? null;
}

async function fetchMetalPrice(slug: string): Promise<LivePrice | null> {
  const symbol = METAL_SYMBOLS[slug];
  try {
    const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    let change = 0;
    if (process.env.GOLD_API_KEY) {
      const now = Math.floor(Date.now() / 1000);
      const twoDaysAgo = now - 2
