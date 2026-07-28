import { fetchCandles, fetchLivePrice } from './prices';
import type { Post } from './db';

export type ResultadoAnalise = {
  status: 'atingiu' | 'nao-atingiu' | 'indisponivel';
  percentual: number | null;
};

// A API OHLC da CoinGecko só aceita esses valores específicos pro
// parâmetro "days" — qualquer outro número dá erro 400. Precisamos
// sempre arredondar pra cima, pro próximo valor válido da lista.
const COINGECKO_ALLOWED_DAYS = [1, 7, 14, 30, 90, 180, 365];

function roundUpToAllowedDays(days: number): number {
  return COINGECKO_ALLOWED_DAYS.find((d) => d >= days) ?? 365;
}

// Calcula automaticamente se uma análise bateu o alvo e o percentual de
// variação entre o preço de entrada (capturado no momento da publicação)
// e o nível-alvo — sem precisar de nada digitado manualmente. Reaproveita
// a mesma lógica de comparação já usada no replay (ReplayChart).
export async function calcularResultado(post: Post): Promise<ResultadoAnalise> {
  if (!post.nivelAlvo || !post.direcao || !post.precoEntrada) {
    return { status: 'indisponivel', percentual: null };
  }

  // O percentual é sempre expresso como "ganho pretendido" positivo,
  // independente da direção — condiz com o jeito que operações de baixa
  // também são lidas como resultado positivo quando dão certo.
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
  const requestDays = roundUpToAllowedDays(daysSinceCreated);

  const candles = await fetchCandles(slug, requestDays);

  // Os candles têm granularidade de 4h — o candle "atual" pode ainda não
  // ter fechado refletindo um cruzamento recente do alvo. Por isso,
  // além de olhar o histórico, conferimos também o preço AO VIVO: se ele
  // já passou do alvo agora, consideramos atingido na hora, sem esperar
  // o próximo candle fechar.
  let liveHit = false;
  try {
    const live = await fetchLivePrice(slug);
    if (live) {
      liveHit = post.direcao === 'alta' ? live.price >= post.nivelAlvo! : live.price <= post.nivelAlvo!;
    }
  } catch {
    // se a busca ao vivo falhar, seguimos só com o histórico
  }

  if (!candles || candles.length === 0) {
    return { status: liveHit ? 'atingiu' : 'indisponivel', percentual };
  }

  const calledDate = createdAtDate.toISOString().slice(0, 10);
  const afterCall = candles.filter((c) => c.date >= calledDate);
  const historyHit = afterCall.some((c) =>
    post.direcao === 'alta' ? c.high >= post.nivelAlvo! : c.low <= post.nivelAlvo!
  );

  const hit = historyHit || liveHit;

  return { status: hit ? 'atingiu' : 'nao-atingiu', percentual };
}
