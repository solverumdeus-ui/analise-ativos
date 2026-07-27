import { notFound } from 'next/navigation';
import Link from 'next/link';
import TradingViewChart from '@/components/TradingViewChart';

// Símbolo usado no widget da TradingView pra cada ativo. Escolhido pra
// combinar com a mesma fonte de dado usada no resto do site quando
// existe equivalente direto (FOREXCOM pros metais, igual à gold-api);
// pra cripto usamos uma corretora de referência só pra visualização —
// o preço "oficial" do site continua vindo da CoinGecko.
const SYMBOLS: Record<string, { symbol: string; label: string }> = {
  btc: { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin (BTC/USD)' },
  xau: { symbol: 'FOREXCOM:XAUUSD', label: 'Ouro (XAU/USD)' },
  xag: { symbol: 'FOREXCOM:XAGUSD', label: 'Prata (XAG/USD)' },
  xrp: { symbol: 'BINANCE:XRPUSDT', label: 'XRP (XRP/USD)' },
};

export const dynamic = 'force-dynamic';

export default function GraficoPage({ params }: { params: { slug: string } }) {
  const asset = SYMBOLS[params.slug];
  if (!asset) return notFound();

  return (
    <div style={{ padding: '28px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>{asset.label}</h1>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          ← voltar pra mesa
        </Link>
      </div>
      <TradingViewChart symbol={asset.symbol} />
    </div>
  );
}
