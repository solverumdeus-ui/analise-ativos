'use client';

import { useEffect, useRef } from 'react';

type Props = {
  symbol: string;
};

export default function TradingViewChart({ symbol }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outerRef.current) return;

    outerRef.current.innerHTML = '';

    // Essa div (tradingview-widget-container) é a que o script da
    // TradingView controla e redimensiona via JavaScript — ele mesmo
    // aplica um style inline nela, então ela NÃO pode ser a mesma div
    // que controlamos o tamanho (isso é o que causava o espaço vazio:
    // o style inline deles sobrescrevia nosso CSS). Ela fica sempre a
    // 100% dentro do nosso container de fora, que é quem manda no
    // tamanho real.
    const tvContainer = document.createElement('div');
    tvContainer.className = 'tradingview-widget-container';
    tvContainer.style.height = '100%';
    tvContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '240',
      timezone: 'America/Sao_Paulo',
      theme: 'dark',
      style: '1',
      locale: 'br',
      backgroundColor: 'rgba(11, 14, 17, 1)',
      gridColor: 'rgba(35, 42, 51, 0.5)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      support_host: 'https://www.tradingview.com',
    });

    tvContainer.appendChild(widgetDiv);
    tvContainer.appendChild(script);
    outerRef.current.appendChild(tvContainer);
  }, [symbol]);

  return <div className="chart-container" ref={outerRef} />;
}
