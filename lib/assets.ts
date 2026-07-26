import { fetchLivePrice, fetchCandles } from './prices';

export type Asset = {
  slug: string;
  symbol: string;
  name: string;
  price: string;
  change: number;
  marketOpen: boolean;
  sparkline: number[];
};

// Valores de reserva — usados só se a API estiver fora do ar,
// para o site nunca ficar quebrado.
const FALLBACK: Record<string, { price: number; change: number }> = {
  btc: { price: 109420, change: 2.3 },
  xau: { price: 2487, change: -0.4 },
  xag: { price: 31.2, change: 1.1 },
  xrp: { price: 2.71, change: 4.8 },
};

const DEFS = [
  { slug: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', crypto: true },
  { slug: 'xau', symbol: 'XAU/USD', name: 'Ouro', crypto: false },
  { slug: 'xag', symbol: 'XAG/USD', name: 'Prata', crypto: false },
  { slug: 'xrp', symbol: 'XRP/USD', name: 'XRP', crypto: true },
];

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: price >= 100 ? 0 : 2,
    maximumFractionDigits: price >= 100 ? 0 : 2,
  });
}

// Mercado de metais (forex, via FOREXCOM) fecha no fim de semana: de
// sexta ~22:00 UTC até domingo ~22:00 UTC. Cripto opera 24/7, sempre
// aberto. É uma aproximação (não considera feriados), mas cobre o caso
// mais comum — fechamento de fim de semana.
function isForexMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = domingo, 6 = sábado
  const hour = now.getUTCHours();

  if (day === 6) return false; // sábado inteiro fechado
  if (day === 0 && hour < 22) return false; // domingo antes das 22h UTC
  if (day === 5 && hour >= 22) return false; // sexta depois das 22h UTC
  return true;
}

// Busca os fechamentos diários dos últimos 7 dias, usados pra desenhar
// o sparkline (mini-gráfico) ao lado do preço. Se falhar, retorna lista
// vazia — o componente simplesmente não desenha o gráfico nesse caso.
async function fetchSparkline(slug: string): Promise<number[]> {
  try {
    const candles = await fetchCandles(slug, 7);
    if (!candles) return [];
    return candles.map((c) => c.close);
  } catch {
    return [];
  }
}

export async function getAssets(): Promise<{ assets: Asset[]; updatedAt: string }> {
  const results = await Promise.all(
    DEFS.map(async (def) => {
      const [live, sparkline] = await Promise.all([
        fetchLivePrice(def.slug),
        fetchSparkline(def.slug),
      ]);
      const data = live ?? FALLBACK[def.slug];
      return {
        slug: def.slug,
        symbol: def.symbol,
        name: def.name,
        price: formatPrice(data.price),
        change: Math.round(data.change * 10) / 10,
        marketOpen: def.crypto ? true : isForexMarketOpen(),
        sparkline,
      };
    })
  );

  const updatedAt = new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return { assets: results, updatedAt };
}
