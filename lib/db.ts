import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// A Vercel injeta essa variável automaticamente ao conectar o banco Neon.
// A conexão só é criada na hora do uso (não no carregamento do arquivo),
// pra nunca quebrar o build por falta da variável em algum ambiente.
let sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('DATABASE_URL não configurada.');
    sql = neon(url);
  }
  return sql;
}

export type Post = {
  id: number;
  slug: string;
  title: string;
  content: string;
  asset: string;
  tag: string;
  nivelAlvo: number | null;
  direcao: 'alta' | 'baixa' | null;
  imageUrl: string | null;
  videoUrl: string | null;
  author: string;
  createdAt: string;
};

export type Comment = {
  id: number;
  postSlug: string;
  name: string;
  message: string;
  createdAt: string;
};

function mapPost(row: any): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    asset: row.asset,
    tag: row.tag,
    nivelAlvo: row.nivel_alvo !== null ? Number(row.nivel_alvo) : null,
    direcao: row.direcao,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    author: row.author,
    createdAt: row.created_at,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const rows = await getSql()`SELECT * FROM posts ORDER BY created_at DESC`;
  return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await getSql()`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`;
  if (rows.length === 0) return null;
  return mapPost(rows[0]);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export async function createPost(input: {
  title: string;
  content: string;
  asset: string;
  tag: string;
  nivelAlvo?: number;
  direcao?: 'alta' | 'baixa';
  imageUrl?: string;
  videoUrl?: string;
}): Promise<Post> {
  const base = slugify(input.title);
  const slug = `${base}-${Date.now().toString().slice(-5)}`;

  const rows = await getSql()`
    INSERT INTO posts (slug, title, content, asset, tag, nivel_alvo, direcao, image_url, video_url)
    VALUES (
      ${slug}, ${input.title}, ${input.content}, ${input.asset}, ${input.tag},
      ${input.nivelAlvo ?? null}, ${input.direcao ?? null},
      ${input.imageUrl ?? null}, ${input.videoUrl ?? null}
    )
    RETURNING *
  `;
  return mapPost(rows[0]);
}

export async function updatePost(
  slug: string,
  input: {
    title?: string;
    content?: string;
    asset?: string;
    tag?: string;
    nivelAlvo?: number | null;
    direcao?: 'alta' | 'baixa' | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
  }
): Promise<Post | null> {
  const current = await getPostBySlug(slug);
  if (!current) return null;

  const rows = await getSql()`
    UPDATE posts SET
      title = ${input.title ?? current.title},
      content = ${input.content ?? current.content},
      asset = ${input.asset ?? current.asset},
      tag = ${input.tag ?? current.tag},
      nivel_alvo = ${input.nivelAlvo !== undefined ? input.nivelAlvo : current.nivelAlvo},
      direcao = ${input.direcao !== undefined ? input.direcao : current.direcao},
      image_url = ${input.imageUrl !== undefined ? input.imageUrl : current.imageUrl},
      video_url = ${input.videoUrl !== undefined ? input.videoUrl : current.videoUrl}
    WHERE slug = ${slug}
    RETURNING *
  `;
  return mapPost(rows[0]);
}
export async function deletePost(slug: string): Promise<boolean> {
  const rows = await getSql()`DELETE FROM posts WHERE slug = ${slug} RETURNING slug`;
  return rows.length > 0;
}
export async function getComments(postSlug: string): Promise<Comment[]> {
  const rows = await getSql()`
    SELECT * FROM comments WHERE post_slug = ${postSlug} ORDER BY created_at ASC
  `;
  return rows.map((r: any) => ({
    id: r.id,
    postSlug: r.post_slug,
    name: r.name,
    message: r.message,
    createdAt: r.created_at,
  }));
}

export async function createComment(input: {
  postSlug: string;
  name: string;
  message: string;
}): Promise<Comment> {
  const rows = await getSql()`
    INSERT INTO comments (post_slug, name, message)
    VALUES (${input.postSlug}, ${input.name}, ${input.message})
    RETURNING *
  `;
  const r = rows[0];
  return { id: r.id, postSlug: r.post_slug, name: r.name, message: r.message, createdAt: r.created_at };
}
