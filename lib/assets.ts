import { fetchLivePrice } from './prices';

export type Asset = {
  slug: string;
  symbol: string;
  name: string;
  price: string;
  change: number;
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
  { slug: 'btc', symbol: 'BTC/USD', name: 'Bitcoin' },
  { slug: 'xau', symbol: 'XAU/USD', name: 'Ouro' },
  { slug: 'xag', symbol: 'XAG/USD', name: 'Prata' },
  { slug: 'xrp', symbol: 'XRP/USD', name: 'XRP' },
];

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: price >= 100 ? 0 : 2,
    maximumFractionDigits: price >= 100 ? 0 : 2,
  });
}

export async function getAssets(): Promise<Asset[]> {
  const results = await Promise.all(
    DEFS.map(async (def) => {
      const live = await fetchLivePrice(def.slug);
      const data = live ?? FALLBACK[def.slug];
      return {
        slug: def.slug,
        symbol: def.symbol,
        name: def.name,
        price: formatPrice(data.price),
        change: Math.round(data.change * 10) / 10,
      };
    })
  );

  return results;
}
