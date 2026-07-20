import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  asset: string; // ex: BTC, XAU
  tag: string; // ex: "análise técnica"
  nivelAlvo?: number;
  direcao?: 'alta' | 'baixa';
};

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter((f) => f.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        asset: data.asset,
        tag: data.tag,
        nivelAlvo: data.nivel_alvo,
        direcao: data.direcao,
      };
    });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    asset: data.asset as string,
    tag: data.tag as string,
    nivelAlvo: data.nivel_alvo as number | undefined,
    direcao: data.direcao as 'alta' | 'baixa' | undefined,
    contentHtml,
  };
}
