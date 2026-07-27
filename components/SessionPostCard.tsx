import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  'fora-do-grafico': 'Fora do Gráfico',
  base: 'Base',
};

type SessionPostCardData = {
  slug: string;
  title: string;
  category: string;
  createdAt: string;
};

export default function SessionPostCard({ post }: { post: SessionPostCardData }) {
  const dateLabel = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <Link href={`/sessoes/${post.slug}`} className="post-card">
      <span className="post-tag">{CATEGORY_LABELS[post.category] ?? post.category}</span>
      <div>
        <p className="post-title">{post.title}</p>
        <p className="post-meta">{dateLabel}</p>
      </div>
    </Link>
  );
}
