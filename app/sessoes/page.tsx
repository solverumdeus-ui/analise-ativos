import { getAllSessionPosts } from '@/lib/db';
import SessionPostCard from '@/components/SessionPostCard';
import SessionPostEditor from '@/components/SessionPostEditor';

export const dynamic = 'force-dynamic';

const CATEGORY_BLOCKS = [
  { value: 'fora-do-grafico', label: 'Fora do Gráfico' },
  { value: 'base', label: 'Base' },
];

export default async function EntreSessoes() {
  const posts = await getAllSessionPosts();

  return (
    <div style={{ padding: '28px 0' }}>
      <div className="post-header" style={{ padding: '0 0 20px', border: 'none', marginBottom: 12 }}>
        <h1>Entre Sessões</h1>
        <p className="post-meta" style={{ marginTop: 8 }}>
          O que fica entre uma sessão e outra — enquanto o mercado não abre, o processo continua.
        </p>
      </div>

      <SessionPostEditor />

      {CATEGORY_BLOCKS.map((block) => {
        const postsForCategory = posts.filter((p) => p.category === block.value);
        if (postsForCategory.length === 0) return null;

        return (
          <div key={block.value} style={{ marginBottom: 40 }}>
            <p className="section-label">{block.label}</p>
            <div className="post-list">
              {postsForCategory.map((p) => (
                <SessionPostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        );
      })}

      {posts.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Nada publicado ainda por aqui.
        </p>
      )}
    </div>
  );
}
