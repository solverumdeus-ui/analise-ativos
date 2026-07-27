'use client';

import { useEffect, useRef } from 'react';

type Props = {
  symbol: string;
};

export default function TradingViewChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Limpa antes de recriar, caso o símbolo mude sem recarregar a página
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '240', // 4H, mesmo timeframe usado nas análises
      timezone: 'America/Sao_Paulo',
      theme: 'dark',
      style: '1',
      locale: 'br',
      backgroundColor: 'rgba(11, 14, 17, 1)', // combina com --bg do site
      gridColor: 'rgba(35, 42, 51, 0.5)', // combina com --border do site
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      support_host: 'https://www.tradingview.com',
    });

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container chart-container" ref={containerRef} />
  );
}
