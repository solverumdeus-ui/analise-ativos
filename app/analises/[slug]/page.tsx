import { getPostBySlug } from '@/lib/db';
import { fetchCandles } from '@/lib/prices';
import ReplayChart from '@/components/ReplayChart';
import Comments from '@/components/Comments';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  const processed = await remark().use(html).process(post.content);
  const contentHtml = processed.toString();

  const slug = post.asset.toLowerCase();
  const createdAtDate = new Date(post.createdAt);
  const createdAtIso = createdAtDate.toISOString().slice(0, 10);
  const candles = post.nivelAlvo ? ((await fetchCandles(slug, 30)) ?? []) : [];

  const dateLabel = createdAtDate.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <article>
      <div className="post-header">
        <span className="post-tag">{post.asset}</span>
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.tag} · {dateLabel} · por {post.author}
        </p>
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}
        />
      )}

      {post.videoUrl && (
        <p style={{ marginBottom: 20 }}>
          <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            ▶ ver vídeo relacionado
          </a>
        </p>
      )}

      {post.nivelAlvo && (
        <ReplayChart
          candles={candles}
          calledDate={createdAtIso}
          nivelAlvo={post.nivelAlvo}
          direcao={post.direcao ?? undefined}
        />
      )}

      <div className="post-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      <Comments postSlug={post.slug} />
    </article>
  );
}
