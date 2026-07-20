import { Asset } from '@/lib/assets';

export default function AssetCard({ asset }: { asset: Asset }) {
  const isUp = asset.change >= 0;

  return (
    <div className="asset-card">
      <div className="label">{asset.symbol}</div>
      <div className="price">{asset.price}</div>
      <div className={`change ${isUp ? 'up' : 'down'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(asset.change)}%
      </div>
    </div>
  );
}
