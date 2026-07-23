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
    { cache: 'force-cache', next: { revalidate: 60 } }
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
      cache: 'force-cache',
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    // A variação de 24h reaproveita o mesmo cache de "avg" usado nos
    // candles (fetchMetalDailySeries), em vez de fazer uma chamada
    // separada à gold-api — assim não soma mais uma URL ao limite de
    // 10 requisições/hora. Sem chave configurada, mostra 0 (sem
    // variação) em vez de quebrar o site.
    let change = 0;
    if (process.env.GOLD_API_KEY) {
      try {
        const avgMap = await fetchMetalDailySeries(symbol, 'avg');
        if (avgMap) {
          const daysSorted = Object.keys(avgMap).sort();
          if (daysSorted.length >= 2) {
            const first = avgMap[daysSorted[daysSorted.length - 2]];
            const last = avgMap[daysSorted[daysSorted.length - 1]];
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

// Início fixo e amplo da janela de histórico dos metais, usado só quando
// é preciso buscar dado novo na gold-api.com (não depende do "days"
// pedido por cada análise, pra sempre pedir a mesma janela ampla).
const METAL_HISTORY_FIXED_START = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);

// Quanto tempo um dado guardado no banco ainda é considerado "fresco"
// o bastante pra não precisar buscar de novo na gold-api.com.
const METAL_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

// Busca uma série diária de um único tipo de agregação (max, min ou avg)
// para um metal. Usa um cache no Postgres (tabela metal_history_cache)
// como fonte principal: só chama a gold-api.com de fato quando o dado
// salvo tem mais de 1 hora. Isso é o que garante que o limite de 10
// chamadas/hora da API nunca estoura, mesmo com muitas análises e
// visitantes diferentes — o cache de `fetch` do Next.js sozinho não
// segurava isso de forma confiável em produção na Vercel.
async function fetchMetalDailySeries(
  symbol: string,
  aggregation: 'max' | 'min' | 'avg'
): Promise<Record<string, number> | null> {
  const { getMetalHistoryCache, setMetalHistoryCache } = await import('./db');

  let cached: { data: Record<string, number>; updatedAt: string } | null = null;
  try {
    cached = await getMetalHistoryCache(symbol, aggregation);
  } catch (err) {
    console.error(`[fetchMetalDailySeries] erro ao ler cache do banco (${aggregation}) para ${symbol}:`, err);
  }

  const isFresh = cached && Date.now() - new Date(cached.updatedAt).getTime() < METAL_CACHE_TTL_MS;
  if (isFresh) return cached!.data;

  if (!process.env.GOLD_API_KEY) return cached?.data ?? null;

  const now = Math.floor(Date.now() / 1000 / 3600) * 3600;

  try {
    const res = await fetch(
      `https://api.gold-api.com/history?symbol=${symbol}&startTimestamp=${METAL_HISTORY_FIXED_START}&endTimestamp=${now}&groupBy=day&aggregation=${aggregation}&orderBy=asc`,
      { headers: { 'x-api-key': process.env.GOLD_API_KEY }, cache: 'no-store' }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`[fetchMetalDailySeries] gold-api falhou (${aggregation}) para ${symbol}: status ${res.status} — ${body.slice(0, 300)}`);
      // Se a chamada falhar (ex: rate limit) mas já tivermos um dado
      // salvo, mesmo que velho, é melhor usar esse do que nada.
      return cached?.data ?? null;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error(`[fetchMetalDailySeries] formato inesperado (${aggregation}) para ${symbol}:`, JSON.stringify(data).slice(0, 300));
      return cached?.data ?? null;
    }
    const field = `${aggregation}_price`;
    const map: Record<string, number> = {};
    for (const d of data as Record<string, number | string>[]) {
      const day = d.day as string;
      map[day] = d[field] as number;
    }

    try {
      await setMetalHistoryCache(symbol, aggregation, map);
    } catch (err) {
      console.error(`[fetchMetalDailySeries] erro ao salvar cache do banco (${aggregation}) para ${symbol}:`, err);
    }

    return map;
  } catch (err) {
    console.error(`[fetchMetalDailySeries] erro de rede (${aggregation}) para ${symbol}:`, err);
    return cached?.data ?? null;
  }
}

// Monta candles diários reais para metais, usando a máxima e a mínima
// REAIS de cada dia (não uma aproximação via open/close). É isso que
// garante que, se o alvo projetado numa análise foi tocado durante o
// dia, o replay mostra corretamente que ele foi atingido.
async function fetchMetalCandles(slug: string, days: number): Promise<Candle[] | null> {
  const symbol = METAL_SYMBOLS[slug];
  if (!process.env.GOLD_API_KEY) {
    console.error('[fetchMetalCandles] GOLD_API_KEY não configurada.');
    return null;
  }

  const [maxMap, minMap, avgMap] = await Promise.all([
    fetchMetalDailySeries(symbol, 'max'),
    fetchMetalDailySeries(symbol, 'min'),
    fetchMetalDailySeries(symbol, 'avg'),
  ]);

  if (!maxMap || !minMap || !avgMap) return null;

  const allDaysSorted = Object.keys(avgMap).sort();
  if (allDaysSorted.length < 2) return null;

  // Recorte LOCAL (sem chamada nova à API): fica só com os últimos
  // "days" dias, que é o período que essa análise específica pediu.
  const now = Math.floor(Date.now() / 1000 / 3600) * 3600;
  const cutoff = new Date((now - days * 24 * 60 * 60) * 1000).toISOString().slice(0, 10);
  const daysSorted = allDaysSorted.filter((d) => d >= cutoff);
  if (daysSorted.length < 2) return null;

  const candles: Candle[] = [];
  for (let i = 1; i < daysSorted.length; i++) {
    const day = daysSorted[i];
    const prevDay = daysSorted[i - 1];
    if (maxMap[day] === undefined || minMap[day] === undefined) continue;

    const open = avgMap[prevDay];
    const close = avgMap[day];
    // A máxima/mínima real do dia pode ser mais extrema que open/close —
    // um candle correto sempre engloba os dois.
    const high = Math.max(maxMap[day], open, close);
    const low = Math.min(minMap[day], open, close);

    candles.push({ date: day, open, close, high, low });
  }
  return candles;
}

export async function fetchCandles(slug: string, days: number): Promise<Candle[] | null> {
  if (isCrypto(slug)) {
    const id = COINGECKO_IDS[slug];
    const res = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
      { cache: 'force-cache', next: { revalidate: 3600 } }
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

  // Metais: agora usamos máxima e mínima REAIS de cada dia (via
  // aggregation=max / aggregation=min da gold-api.com), em vez de
  // aproximar high/low a partir de open/close. Isso corrige o replay
  // não detectar níveis que foram tocados durante o dia mas não
  // apareciam na média diária.
  return fetchMetalCandles(slug, days);
}

export async function fetchHistory(slug: string, days: number): Promise<PricePoint[] | null> {
  if (isCrypto(slug)) {
    const id = COINGECKO_IDS[slug];
    const res = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { cache: 'force-cache', next: { revalidate: 3600 } }
    );
    if (!res || !res.ok) return null;
    const data = await res.json();
    return (data.prices as [number, number][]).map(([ts, price]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      price,
    }));
  }

  // metais precisam da chave para histórico
  if (!process.env.GOLD_API_KEY) {
    console.error('[fetchHistory] GOLD_API_KEY não configurada.');
    return null;
  }

  const symbol = METAL_SYMBOLS[slug];
  // Mesmo motivo de cima: arredondar pra hora cheia permite reaproveitar
  // o cache em vez de gastar uma chamada nova a cada visitante.
  const now = Math.floor(Date.now() / 1000 / 3600) * 3600;
  const start = now - days * 24 * 60 * 60;

  try {
    const res = await fetch(
      `https://api.gold-api.com/history?symbol=${symbol}&startTimestamp=${start}&endTimestamp=${now}&groupBy=day&aggregation=avg&orderBy=asc`,
      { headers: { 'x-api-key': process.env.GOLD_API_KEY }, cache: 'force-cache', next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`[fetchHistory] gold-api falhou para ${symbol}: status ${res.status} — ${body.slice(0, 300)}`);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error(`[fetchHistory] gold-api retornou formato inesperado para ${symbol}:`, JSON.stringify(data).slice(0, 300));
      return null;
    }
    return (data as { day: string; avg_price: number }[]).map((d) => ({
      date: d.day,
      price: d.avg_price,
    }));
  } catch (err) {
    console.error(`[fetchHistory] erro de rede para ${symbol}:`, err);
    return null;
  }
}
