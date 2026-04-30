import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import useStore from '../store/useStore';

export default function TradingViewChart() {
  const chartContainerRef = useRef();
  const { liveMarketData, setLiveMarketData, activeAsset, setActiveAsset, timeframe, setTimeframe, priceOffset } = useStore();

  useEffect(() => {
    let chart;
    let isMounted = true;
    
    const fetchAndRender = async () => {
      try {
        const endpoint = activeAsset === 'SPY' ? '/api/market/spy/history' : '/api/market/gold';
        const period = timeframe === '1h' ? '3mo' : '1mo';
        const { data } = await axios.get(`http://localhost:8000${endpoint}?interval=${timeframe}&period=${period}`);
        if (!data || data.length < 50 || !isMounted) return;
        
        // Guardar para el motor de confluencia y AI
        const calibratedData = data.map(d => ({
            ...d,
            open: d.open + priceOffset,
            high: d.high + priceOffset,
            low: d.low + priceOffset,
            close: d.close + priceOffset
        }));

        setLiveMarketData(calibratedData);
        
        // Small delay to ensure layout is measured
        await new Promise(resolve => setTimeout(resolve, 100));

        if (chartContainerRef.current && chartContainerRef.current.clientHeight > 0) {
          chartContainerRef.current.innerHTML = '';
          
          // Crear contenedor del gráfico
          chart = createChart(chartContainerRef.current, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#94a3b8' },
            grid: { vertLines: { color: 'rgba(51, 65, 85, 0.15)' }, horzLines: { color: 'rgba(51, 65, 85, 0.15)' } },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            rightPriceScale: { borderColor: 'rgba(51, 65, 85, 0.3)' },
            timeScale: { borderColor: 'rgba(51, 65, 85, 0.3)', timeVisible: true },
          });

          // Capa 1: Candlesticks
          const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
          });
          candleSeries.setData(data);

          // Capa 2: EMA 50
          const emaData = calculateEMA(data, 50);
          const emaSeries = chart.addLineSeries({
            color: '#f59e0b', lineWidth: 2, crosshairMarkerVisible: false,
            priceLineVisible: false
          });
          emaSeries.setData(emaData);

          // Capa 3: Volumen (Histogram) superpuesto abajo
          const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '', // Esto lo coloca en una capa inferior escalada
          });
          
          chart.priceScale('').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
          });
          
          const volData = data.map(d => ({
            time: d.time,
            value: d.value || Math.random() * 1000, 
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
          }));
          volumeSeries.setData(volData);

          // Capa 4: Señales (Markers) generadas por el Motor de Confluencia
          const markers = [];
          const startIndex = Math.min(100, Math.floor(data.length / 2));
          for (let i = startIndex; i < data.length; i++) {
              const current = data[i];
              const ema50 = data.slice(Math.max(0, i-50), i).reduce((a, b) => a + b.close, 0) / Math.min(50, i);
              const ema100 = data.slice(Math.max(0, i-100), i).reduce((a, b) => a + b.close, 0) / Math.min(100, i);
              
              const trendBullish = current.close > ema50 && ema50 > ema100;
              const trendBearish = current.close < ema50 && ema50 < ema100;
              
              if (trendBullish || trendBearish) {
                  let gains = 0, losses = 0;
                  for (let j = i-14; j < i; j++) {
                      let diff = data[j].close - data[j-1].close;
                      if (diff > 0) gains += diff; else losses -= diff;
                  }
                  const rs = (gains/14) / ((losses/14) || 1);
                  const rsi = 100 - (100 / (1 + rs));
                  
                  const atr = data.slice(i-14, i).reduce((a, b) => a + (b.high - b.low), 0) / 14;
                  const volBreak = (current.high - current.low) > (atr * 1.1);

                  if (volBreak) {
                      if (trendBullish && rsi > 30 && rsi < 55) {
                          markers.push({ time: current.time, position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'BUY IDEA' });
                      } else if (trendBearish && rsi > 45 && rsi < 70) {
                          markers.push({ time: current.time, position: 'aboveBar', color: '#f43f5e', shape: 'arrowDown', text: 'SELL IDEA' });
                      }
                  }
              }
          }
          candleSeries.setMarkers(markers);

        }
      } catch (e) {
        console.error("Error fetching TradingView data", e);
      }
    };

    fetchAndRender();

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) chart.remove();
    };
  }, [activeAsset, timeframe, priceOffset]);

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let emaData = [];
    if(data.length === 0) return emaData;
    let ema = data[0].close;
    for (let i = 0; i < data.length; i++) {
      ema = (data[i].close - ema) * k + ema;
      emaData.push({ time: data[i].time, value: ema });
    }
    return emaData;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl">
      
      {/* Navegación Superior de Activos */}
      <div className="flex justify-between items-center mb-4 z-10 relative">
        <div className="flex gap-2 bg-[#080b11]/80 p-1 rounded-xl border border-slate-800/50">
          <button 
            className={`px-5 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-all ${activeAsset === 'XAU/USD' ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-slate-500 hover:text-slate-300'}`} 
            onClick={() => setActiveAsset('XAU/USD')}
          >
            Oro (XAU/USD)
          </button>
          <button 
            className={`px-5 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-all ${activeAsset === 'SPY' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:text-slate-300'}`} 
            onClick={() => setActiveAsset('SPY')}
          >
            S&P 500 (SPY)
          </button>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-[#080b11] border border-slate-800 rounded-xl p-1 gap-1">
          {['5m', '15m', '30m', '1h'].map(tf => (
            <button 
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${timeframe === tf ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-slate-200'}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-mono">LIVE / {timeframe.toUpperCase()}</div>
      </div>
      
      {/* Contenedor del Gráfico con 100% altura disponible */}
      <div className="flex-grow w-full relative">
        <div ref={chartContainerRef} className="absolute inset-0 rounded-lg overflow-hidden" />
      </div>

    </div>
  );
}
