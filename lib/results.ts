import { fetchCandles } from './prices';
import type { Post } from './db';

export type ResultadoAnalise = {
  status: 'atingiu' | 'nao-atingiu' | 'indisponivel';
  percentual: number | null;
};

export async function calcularResultado(post: Post): Promise<ResultadoAnalise> {
  if (!post.nivelAlvo || !post.direcao || !post.precoEntrada) {
    return { status: 'indisponivel', percentual: null };
  }

  const percentual =
    post.direcao === 'alta'
      ? ((post.nivelAlvo - post.precoEntrada) / post.precoEntrada) * 100
      : ((post.precoEntrada - post.nivelAlvo) / post.precoEntrada) * 100;

  const slug = post.asset.toLowerCase();
  const createdAtDate = new Date(post.createdAt);
  const daysSinceCreated = Math.max(
    1,
    Math.ceil((Date.now() - createdAtDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
  );

  const candles = await fetchCandles(slug, daysSinceCreated);
  if (!candles || candles.length === 0) {
    return { status: 'indisponivel', percentual };
  }

  const calledDate = createdAtDate.toISOString().slice(0, 10);
  const afterCall = candles.filter((c) => c.date >= calledDate);
  const hit = afterCall.some((c) =>
    post.direcao === 'alta' ? c.high >= post.nivelAlvo! : c.low <= post.nivelAlvo!
  );

  return { status: hit ? 'atingiu' : 'nao-atingiu', percentual };
}
