import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { fetchCandles } from '@/lib/prices';
import ReplayChart from '@/components/ReplayChart';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!post) return notFound();

  const slug = post.asset.toLowerCase();
  const candles = (await fetchCandles(slug, 30)) ?? [];

  return (
    <article>
      <div className="post-header">
        <span className="post-tag">{post.asset}</span>
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.tag} · {post.date}
        </p>
      </div>

      {post.nivelAlvo && (
        <ReplayChart
          candles={candles}
          calledDate={post.date}
          nivelAlvo={post.nivelAlvo}
          direcao={post.direcao}
        />
      )}

      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
}
