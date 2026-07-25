import Link from 'next/link';
import type { ResultadoAnalise } from '@/lib/results';

type PostCardData = {
  slug: string;
  title: string;
  asset: string;
  tag: string;
  createdAt: string;
};

type Props = {
  post: PostCardData;
  resultado?: ResultadoAnalise;
};

export default function PostCard({ post, resultado }: Props) {
  const dateLabel = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const showBadge = resultado && resultado.status !== 'indisponivel' && resultado.percentual !== null;

  return (
    <Link href={`/analises/${post.slug}`} className="post-card">
      <span className="post-tag">{post.asset}</span>
      <div style={{ flex: 1 }}>
        <p className="post-title">{post.title}</p>
        <p className="post-meta">
          {post.tag} · {dateLabel}
        </p>
      </div>
      {showBadge && (
        <span
          style={{
            flexShrink: 0,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: 6,
            alignSelf: 'center',
            background: resultado!.status === 'atingiu' ? 'var(--up-dim)' : 'var(--down-dim)',
            color: resultado!.status === 'atingiu' ? 'var(--up)' : 'var(--down)',
          }}
        >
          {resultado!.status === 'atingiu' ? '✓' : '✕'} {resultado!.percentual! > 0 ? '+' : ''}
          {resultado!.percentual!.toFixed(2)}%
        </span>
      )}
    </Link>
  );
}
