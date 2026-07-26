import { Asset } from '@/lib/assets';

function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return <div style={{ width: 64, height: 22 }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 22;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? 'var(--up)' : 'var(--down)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AssetCard({ asset }: { asset: Asset }) {
  const isUp = asset.change >= 0;

  return (
    <div className="asset-row">
      <div className="asset-row-symbol">
        <span
          className={`market-dot ${asset.marketOpen ? 'open' : 'closed'}`}
          title={asset.marketOpen ? 'Mercado aberto' : 'Mercado fechado'}
        />
        {asset.symbol}
      </div>
      <div className="asset-row-spark">
        <Sparkline data={asset.sparkline} isUp={isUp} />
      </div>
      <div className="asset-row-price">{asset.price}</div>
      <div className={`asset-row-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(asset.change)}%
      </div>
    </div>
  );
}
