import Link from 'next/link';

type PostCardData = {
  slug: string;
  title: string;
  asset: string;
  tag: string;
  createdAt: string;
};

export default function PostCard({ post }: { post: PostCardData }) {
  const dateLabel = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <Link href={`/analises/${post.slug}`} className="post-card">
      <span className="post-tag">{post.asset}</span>
      <div>
        <p className="post-title">{post.title}</p>
        <p className="post-meta">
          {post.tag} · {dateLabel}
        </p>
      </div>
    </Link>
  );
}
