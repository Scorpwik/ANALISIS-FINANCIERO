import React, { useEffect, useRef } from 'react';

export default function AdvancedWidget() {
  const containerRef = useRef();

  useEffect(() => {
    if(containerRef.current) containerRef.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "OANDA:XAUUSD",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "enable_publishing": true,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": true,
        "backgroundColor": "#080b11",
        "gridColor": "rgba(51, 65, 85, 0.15)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview_widget"
      }`;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="h-full w-full p-6 bg-[#080b11]">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-2xl font-black text-blue-500">☁️ Tu Nube de TradingView</h1>
                <p className="text-slate-400 text-sm">Usa el menú superior del gráfico para iniciar sesión y sincronizar tus análisis personalizados.</p>
            </div>
        </div>
        <div className="h-[calc(100%-80px)] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" id="tradingview_widget" ref={containerRef}></div>
    </div>
  );
}
