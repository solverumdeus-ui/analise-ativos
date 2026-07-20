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
      const twoDaysAgo = now - 2 * 24 * 60 * 60;
      try {
        const histRes = await fetch(
          `https://api.gold-api.com/history?symbol=${symbol}&startTimestamp=${twoDaysAgo}&endTimestamp=${now}&groupBy=day&aggregation=avg&orderBy=asc`,
          { headers: { 'x-api-key': process.env.GOLD_API_KEY }, next: { revalidate: 300 } }
        );
        if (histRes.ok) {
          const hist = await histRes.json();
          if (hist.length >= 2) {
            const first = hist[hist.length - 2].avg_price;
            const last = hist[hist.length - 1].avg_price;
            change = ((last - first) / first) * 100;
          }
        }
      } catch {
        // mantém change = 0 se o histórico falhar
      }
    }

    return { price: data.price, change };
  } catch {
    return null;
  }
}

export async function fetchLivePrice(slug: string): Promise<LivePrice | null> {
  return isCrypto(slug) ? fetchCryptoPrice(slug) : fetchMetalPrice(slug);
}

// --- candles (OHLC) para o replay com gráfico de velas ---

export async function fetchCandles(slug: string, days: number): Promise<Candle[] | null> {
  if (isCrypto(slug)) {
    const id = COINGECKO_IDS[slug];
    const res = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
      { next: { revalidate: 3600 } }
    );
    if (!res || !res.ok) {
      console.error(`[fetchCandles] CoinGecko OHLC falhou para ${id}: status ${res?.status ?? 'sem resposta'}`);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error(`[fetchCandles] CoinGecko OHLC retornou formato inesperado para ${id}:`, JSON.stringify(data).slice(0, 300));
      return null;
    }
    return (data as number[][]).map(([ts, open, high, low, close]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
    }));
  }

  // Metais: a API gratuita não oferece OHLC intradiário por dia,
  // então montamos "candles" a partir da média diária (open = média
  // do dia anterior, close = média do dia). É uma aproximação, não
  // um candle real intradiário — mas mantém a lógica de "atingiu o
  // nível" funcionando corretamente.
  const history = await fetchHistory(slug, days);
  if (!history || history.length < 2) return null;

  const candles: Candle[] = [];
  for (let i = 1; i < history.length; i++) {
    const open = history[i - 1].price;
    const close = history[i].price;
    candles.push({
      date: history[i].date,
      open,
      close,
      high: Math.max(open, close),
      low: Math.min(open, close),
    });
  }
  return candles;
}

export async function fetchHistory(slug: string, days: number): Promise<PricePoint[] | null> {
  if (isCrypto(slug)) {
    const id = COINGECKO_IDS[slug];
    const res = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { next: { revalidate: 3600 } }
    );
    if (!res || !res.ok) return null;
    const data = await res.json();
    return (data.prices as [number, number][]).map(([ts, price]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      price,
    }));
  }

  // metais precisam da chave para histórico
  if (!process.env.GOLD_API_KEY) return null;

  const symbol = METAL_SYMBOLS[slug];
  const now = Math.floor(Date.now() / 1000);
  const start = now - days * 24 * 60 * 60;

  try {
    const res = await fetch(
      `https://api.gold-api.com/history?symbol=${symbol}&startTimestamp=${start}&endTimestamp=${now}&groupBy=day&aggregation=avg&orderBy=asc`,
      { headers: { 'x-api-key': process.env.GOLD_API_KEY }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data as { day: string; avg_price: number }[]).map((d) => ({
      date: d.day,
      price: d.avg_price,
    }));
  } catch {
    return null;
  }
}
