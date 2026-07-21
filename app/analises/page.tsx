import { getAllPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import AnalysisEditor from '@/components/AnalysisEditor';

export const dynamic = 'force-dynamic';

export default async function Analises() {
  const posts = await getAllPosts();

  return (
    <div style={{ padding: '28px 0' }}>
      <AnalysisEditor />

      <p className="section-label">todas as análises</p>
      <div className="post-list">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
