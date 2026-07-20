import Link from 'next/link';
import { PostMeta } from '@/lib/posts';

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/analises/${post.slug}`} className="post-card">
      <span className="post-tag">{post.asset}</span>
      <div>
        <p className="post-title">{post.title}</p>
        <p className="post-meta">
          {post.tag} · {post.date}
        </p>
      </div>
    </Link>
  );
}
