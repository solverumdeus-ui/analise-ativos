import { getSessionPostBySlug } from '@/lib/db';
import SessionPostEditor from '@/components/SessionPostEditor';
import DeleteSessionPostButton from '@/components/DeleteSessionPostButton';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  'fora-do-grafico': 'Fora do Gráfico',
  base: 'Base',
};

export default async function SessionPostPage({ params }: { params: { slug: string } }) {
  const post = await getSessionPostBySlug(params.slug);
  if (!post) return notFound();

  const processed = await remark().use(html).process(post.content);
  const contentHtml = processed.toString();

  const dateLabel = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <article>
      <div className="post-header">
        <span className="post-tag">{CATEGORY_LABELS[post.category] ?? post.category}</span>
        <h1>{post.title}</h1>
        <p className="post-meta">
          {dateLabel} · por {post.author}
        </p>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center' }}>
          <SessionPostEditor
            editPost={{
              slug: post.slug,
              title: post.title,
              content: post.content,
              category: post.category,
              imageUrl: post.imageUrl,
            }}
          />
          <DeleteSessionPostButton slug={post.slug} />
        </div>
      </div>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}
        />
      )}
      <div className="post-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
