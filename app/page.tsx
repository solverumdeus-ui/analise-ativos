import { getAssets } from '@/lib/assets';
import { getAllPosts } from '@/lib/db';
import AssetCard from '@/components/AssetCard';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const assets = await getAssets();
  const posts = (await getAllPosts()).slice(0, 5);

  return (
    <>
      <div className="asset-grid">
        {assets.map((a) => (
          <AssetCard key={a.slug} asset={a} />
        ))}
      </div>

      <p className="section-label">análises recentes</p>
      <div className="post-list">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </>
  );
}
