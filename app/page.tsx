import { getAssets } from '@/lib/assets';
import { getAllPosts } from '@/lib/posts';
import AssetCard from '@/components/AssetCard';
import PostCard from '@/components/PostCard';

export const revalidate = 300;

export default async function Home() {
  const assets = await getAssets();
  const posts = getAllPosts();

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
