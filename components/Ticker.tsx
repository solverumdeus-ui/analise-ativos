import { Asset } from '@/lib/assets';

export default function Ticker({ assets }: { assets: Asset[] }) {
  // duplicamos a lista para o efeito de rolagem contínua (CSS puro, sem JS)
  const items = [...assets, ...assets];

  return (
    <div className="ticker-wrap">
      <div className="ticker-track container">
        {items.map((a, i) => (
          <div className="ticker-item" key={`${a.slug}-${i}`}>
            <span className="sym">{a.symbol}</span>
            <span>{a.price}</span>
            <span className={`chg ${a.change >= 0 ? 'up' : 'down'}`}>
              {a.change >= 0 ? '+' : ''}
              {a.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
