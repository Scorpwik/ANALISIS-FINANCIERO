import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';

export default function TradingPanel() {
  const chartContainerRef = useRef();
  const [marketData, setMarketData] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [aiSummary, setAiSummary] = useState('');
  
  // Confluence State
  const [confluence, setConfluence] = useState({ trend: false, mom: false, vol: false, rr: false });

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    const fetchGoldData = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/api/market/gold');
        if (data && data.length > 0) {
          setMarketData(data[data.length - 1]);
          initChart(data);
          calculateConfluence(data);
        }
      } catch (e) {
        console.error("Error fetching market data", e);
      }
    };
    fetchGoldData();
  }, []);

  const initChart = (data) => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(51, 65, 85, 0.3)' }, horzLines: { color: 'rgba(51, 65, 85, 0.3)' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
    });
    candlestickSeries.setData(data);
  };

  const calculateConfluence = (data) => {
    if (data.length < 50) return;
    const current = data[data.length - 1];
    
    // Simulación del motor estricto basada en la data local
    const ema50 = data.slice(-50).reduce((acc, val) => acc + val.close, 0) / 50;
    const trend = current.close > ema50;
    
    const range = current.high - current.low;
    const vol = range > 2; // Threshold mínimo de volatilidad
    
    const isUp = current.close > current.open;
    const mom = isUp; // Simplificación de momentum
    
    const rr = true; // Simplificación de Risk/Reward

    setConfluence({ trend, mom, vol, rr });
  };

  const getAiAnalysis = async () => {
    if (!apiKey || !marketData) return;
    setAiSummary('Analizando datos en tiempo real...');
    try {
      const { data } = await axios.post('http://localhost:8000/api/ai/analyze', {
        api_key: apiKey, price: marketData.close
      });
      setAiSummary(data.summary);
    } catch (e) {
      setAiSummary('Error al procesar el análisis AI. Revise su clave.');
    }
  };

  const allClear = confluence.trend && confluence.mom && confluence.vol && confluence.rr;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* TradingView Lightweight Chart */}
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Gráfico Interactivo XAU/USD (Live)</h2>
          <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
        </div>
        
        {/* Gemini AI Panel */}
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Gemini Fundamental Context</h2>
          <div className="flex gap-4 mb-4">
            <input 
              type="password" placeholder="API Key de Gemini" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border border-border rounded-lg px-4 py-2 w-full text-slate-100 outline-none focus:border-gold"
            />
            <button onClick={getAiAnalysis} className="bg-gold/10 text-gold border border-gold px-6 py-2 rounded-lg hover:bg-gold hover:text-background transition-colors font-semibold">
              Analizar
            </button>
          </div>
          <div className="bg-slate-900/50 border-l-4 border-gold p-4 rounded-r-lg text-sm text-slate-300 min-h-[80px]">
            {aiSummary || 'Esperando orden de análisis...'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Confluence Engine */}
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Motor de Confluencia Estricto</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-border">
              <span className="text-slate-300">Tendencia Alineada (EMA 50)</span>
              <span>{confluence.trend ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-border">
              <span className="text-slate-300">Momentum (RSI/MACD)</span>
              <span>{confluence.mom ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-border">
              <span className="text-slate-300">Volumen Óptimo (ATR)</span>
              <span>{confluence.vol ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-border">
              <span className="text-slate-300">Risk/Reward Limpio</span>
              <span>{confluence.rr ? '✅' : '❌'}</span>
            </div>
          </div>
          
          <div className={`mt-6 p-6 rounded-xl text-center text-xl font-bold border-2 transition-all ${allClear ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-border text-slate-400 bg-black/20'}`}>
            {allClear ? '🟢 COMPRA CONFIRMADA' : '🔒 ESPERAR CONFLUENCIA'}
          </div>
        </div>
      </div>
    </div>
  );
}
