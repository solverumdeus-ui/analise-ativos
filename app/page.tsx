import { getAssets } from '@/lib/assets';
import { getAllPosts } from '@/lib/db';
import { calcularResultado } from '@/lib/results';
import AssetCard from '@/components/AssetCard';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

const ASSET_ORDER = ['BTC', 'XAU', 'XAG', 'XRP'];

export default async function Home() {
  const { assets, updatedAt } = await getAssets();
  const allPosts = await getAllPosts(); // já vem ordenado do mais recente pro mais antigo

  // pega só a análise mais recente de cada ativo (no máximo 4, uma por ativo)
  const latestByAsset = ASSET_ORDER.map((assetSymbol) =>
    allPosts.find((p) => p.asset === assetSymbol)
  ).filter((p): p is NonNullable<typeof p> => p !== undefined);

  // calcula o resultado (atingiu/não atingiu + percentual) de cada uma
  // em paralelo, pra não esperar uma de cada vez
  const resultados = await Promise.all(latestByAsset.map((p) => calcularResultado(p)));

  return (
    <>
      <div className="asset-table-wrap">
        <p className="section-label" style={{ margin: 0 }}>mesa</p>
        <span className="updated-at">cotações às {updatedAt}</span>
      </div>
      <div className="asset-table">
        {assets.map((a) => (
          <AssetCard key={a.slug} asset={a} />
        ))}
      </div>

      <p className="section-label">análises recentes</p>
      <div className="post-list">
        {latestByAsset.map((p, i) => (
          <PostCard key={p.slug} post={p} resultado={resultados[i]} />
        ))}
      </div>
    </>
  );
}
