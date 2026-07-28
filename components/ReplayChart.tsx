'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LinearScale,
  TimeScale,
  Tooltip,
  LineController,
  LineElement,
  PointElement,
  type ChartConfiguration,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';
import type { Candle } from '@/lib/prices';

Chart.register(
  LinearScale,
  TimeScale,
  Tooltip,
  LineController,
  LineElement,
  PointElement,
  CandlestickController,
  CandlestickElement
);

type Props = {
  candles: Candle[];
  calledDate: string;
  nivelAlvo?: number;
  direcao?: 'alta' | 'baixa';
};

export default function ReplayChart({ candles, calledDate, nivelAlvo, direcao }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<'atingiu' | 'nao-atingiu' | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;

    const config: ChartConfiguration = {
      type: 'candlestick' as any,
      data: {
        datasets: [
          {
            label: 'preço',
            data: [],
            // @ts-ignore - cores custom do plugin financial
            color: { up: '#3ecf8e', down: '#f0555a', unchanged: '#8b93a1' },
          },
          ...(nivelAlvo
            ? [
                {
                  type: 'line' as const,
                  label: 'nível-alvo',
                  data: candles.map((c) => ({ x: new Date(c.date).getTime(), y: nivelAlvo })),
                  borderColor: '#e3b341',
                  borderDash: [4, 4],
                  borderWidth: 1,
                  pointRadius: 0,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { type: 'time', time: { unit: 'day' }, display: false },
          y: { display: false },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function evaluateResult() {
    if (!nivelAlvo || !direcao) return;

    // Candles de cripto vêm com timestamp completo (ex: "2026-07-28T14:32:00.000Z"),
    // candles de metais vêm só com a data (ex: "2026-07-28") — a diferença
    // de tamanho da string é como detectamos qual precisão está disponível.
    // Candles de cripto vêm em ISO completo (com "T", ex: "2026-07-28T14:32:00.000Z").
    // Candles de metal vêm só com data — às vezes com uma hora "00:00:00"
    // anexada pela própria gold-api, mas sem o "T" — por isso usamos a
    // presença do "T" pra distinguir, não o tamanho da string.
    const isPrecise = candles.length > 0 && candles[0].date.includes('T');

    const afterCall = isPrecise
      ? candles.filter((c) => new Date(c.date).getTime() >= new Date(calledDate).getTime())
      : candles.filter((c) => c.date.slice(0, 10) > calledDate.slice(0, 10));

    const hit = afterCall.some((c) =>
      direcao === 'alta' ? c.high >= nivelAlvo : c.low <= nivelAlvo
    );
    setResult(hit ? 'atingiu' : 'nao-atingiu');
  }

  function step() {
    const chart = chartRef.current;
    if (!chart) return;

    if (indexRef.current >= candles.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPlaying(false);
      evaluateResult();
      return;
    }

    const c = candles[indexRef.current];
    (chart.data.datasets[0].data as any[]).push({
      x: new Date(c.date).getTime(),
      o: c.open,
      h: c.high,
      l: c.low,
      c: c.close,
    });
    chart.update();
    indexRef.current++;
  }

  function handlePlay() {
    const chart = chartRef.current;
    if (!chart) return;

    if (indexRef.current >= candles.length) {
      indexRef.current = 0;
      chart.data.datasets[0].data = [];
      chart.update();
      setResult(null);
    }

    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPlaying(false);
      return;
    }

    setPlaying(true);
    timerRef.current = setInterval(step, 90);
  }

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button
          onClick={handlePlay}
          disabled={candles.length === 0}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid var(--border-strong)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 13,
          }}
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        {result && (
          <span
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 6,
              background: result === 'atingiu' ? 'var(--up-dim)' : 'var(--down-dim)',
              color: result === 'atingiu' ? 'var(--up)' : 'var(--down)',
            }}
          >
            {result === 'atingiu' ? 'Nível atingido' : 'Ainda não atingiu'}
          </span>
        )}
      </div>
      <div style={{ position: 'relative', height: 220 }}>
        {candles.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Histórico de preços indisponível no momento — tente novamente mais tarde.
          </p>
        ) : (
          <canvas ref={canvasRef} role="img" aria-label="Gráfico de candles em replay" />
        )}
      </div>
    </div>
  );
}
