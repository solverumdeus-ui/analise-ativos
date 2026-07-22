import { getAssets } from '@/lib/assets';
import { getAllPosts } from '@/lib/db';
import AssetCard from '@/components/AssetCard';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

const ASSET_ORDER = ['BTC', 'XAU', 'XAG', 'XRP'];

export default async function Home() {
  const assets = await getAssets();
  const allPosts = await getAllPosts(); // já vem ordenado do mais recente pro mais antigo

  // pega só a análise mais recente de cada ativo (no máximo 4, uma por ativo)
  const latestByAsset = ASSET_ORDER.map((assetSymbol) =>
    allPosts.find((p) => p.asset === assetSymbol)
  ).filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <>
      <div className="asset-grid">
        {assets.map((a) => (
          <AssetCard key={a.slug} asset={a} />
        ))}
      </div>

      <p className="section-label">análises recentes</p>
      <div className="post-list">
        {latestByAsset.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </>
  );
}
