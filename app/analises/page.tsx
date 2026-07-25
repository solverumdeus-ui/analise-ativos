import { getAllPosts } from '@/lib/db';
import { calcularResultado } from '@/lib/results';
import PostCard from '@/components/PostCard';
import AnalysisEditor from '@/components/AnalysisEditor';

export const dynamic = 'force-dynamic';

const ASSET_BLOCKS = [
  { symbol: 'BTC', label: 'Bitcoin (BTC)' },
  { symbol: 'XAU', label: 'Ouro (XAU)' },
  { symbol: 'XAG', label: 'Prata (XAG)' },
  { symbol: 'XRP', label: 'XRP' },
];

export default async function Episodios() {
  const posts = await getAllPosts();

  // calcula o resultado de todas as análises em paralelo, uma vez só,
  // e guarda num mapa por slug pra consultar rápido ao renderizar
  const resultadosList = await Promise.all(posts.map((p) => calcularResultado(p)));
  const resultadosPorSlug = Object.fromEntries(posts.map((p, i) => [p.slug, resultadosList[i]]));

  return (
    <div style={{ padding: '28px 0' }}>
      <AnalysisEditor />

      {ASSET_BLOCKS.map((block) => {
        const postsForAsset = posts.filter((p) => p.asset === block.symbol);
        if (postsForAsset.length === 0) return null;

        return (
          <div key={block.symbol} style={{ marginBottom: 40 }}>
            <p className="section-label">{block.label}</p>
            <div className="post-list">
              {postsForAsset.map((p) => (
                <PostCard key={p.slug} post={p} resultado={resultadosPorSlug[p.slug]} />
              ))}
            </div>
          </div>
        );
      })}

      {posts.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Nenhuma análise publicada ainda.
        </p>
      )}
    </div>
  );
}
