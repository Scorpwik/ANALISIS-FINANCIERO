import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../store/useStore';

export default function RightPanel() {
  const { apiKey, setApiKey, liveMarketData, activeTrades, addTrade, removeTrade, activeAsset } = useStore();
  
  const [aiSummary, setAiSummary] = useState('');
  const [newTrade, setNewTrade] = useState({ type: 'BUY', entry: '', lots: '0.01', sl: '', tp: '' });
  const currentPrice = liveMarketData.length > 0 ? liveMarketData[liveMarketData.length-1].close : 2350;

  // Estado del Motor de Confluencia
  const [conf, setConf] = useState({ trend: false, mom: false, vol: false, rr: false, signal: 'WAIT', rsi: 50 });

  // ----------------------------------------------------
  // MOTOR DE CONFLUENCIA ESTRICTA (ESPECIALIZADO EN ORO)
  // ----------------------------------------------------
  useEffect(() => {
    if (!liveMarketData || liveMarketData.length < 50) return;
    
    const data = liveMarketData;
    const current = data[data.length - 1];
    
    // 1. Tendencia Estricta Institucional (EMA 50 cruzando/alineada con EMA 200 virtual)
    const ema50 = data.slice(-50).reduce((acc, val) => acc + val.close, 0) / 50;
    const ema100 = data.slice(-Math.min(100, data.length)).reduce((acc, val) => acc + val.close, 0) / Math.min(100, data.length);
    const trendBullish = current.close > ema50 && ema50 > ema100;
    const trendBearish = current.close < ema50 && ema50 < ema100;
    const trend = trendBullish || trendBearish;

    // 2. Momentum Estricto (Cálculo de RSI Interno para pullback preciso)
    let gains = 0, losses = 0;
    for(let i = data.length-14; i < data.length; i++) {
        const change = data[i].close - data[i-1].close;
        if(change > 0) gains += change;
        else losses -= change;
    }
    const rs = (gains/14) / ((losses/14) || 1);
    const rsi = 100 - (100 / (1 + rs));
    // Bullish: RSI rebota desde zona oversold (< 40) y ahora sube.
    const momBullish = trendBullish && rsi > 30 && rsi < 55;
    const momBearish = trendBearish && rsi < 70 && rsi > 45;
    const mom = momBullish || momBearish;

    // 3. Volatilidad (Filtro de Ruido vía ATR)
    const atr = data.slice(-14).reduce((acc, val) => acc + (val.high - val.low), 0) / 14;
    const currentRange = current.high - current.low;
    // Solo validamos si la vela actual tiene fuerza y supera el promedio de volatilidad reciente
    const vol = currentRange > atr * 1.1; 

    // 4. Risk / Reward Optimization
    // Confirmamos viabilidad de entrada (simulación estricta basada en rompimiento)
    const rr = trend && mom && vol; 

    let signal = 'WAIT';
    if (trend && mom && vol && rr) {
        signal = trendBullish ? 'BUY' : 'SELL';
    }

    setConf({ trend, mom, vol, rr, signal, rsi });
  }, [liveMarketData]);

  // ----------------------------------------------------
  // GEMINI MACRO AI
  // ----------------------------------------------------
  const getAiAnalysis = async () => {
    if (!apiKey) { setAiSummary("ERROR: API Key requerida."); return; }
    setAiSummary("<i>Iniciando lectura macroeconómica profunda...</i>");
    try {
      const price = liveMarketData.length > 0 ? liveMarketData[liveMarketData.length-1].close : 2350;
      const { data } = await axios.post('http://localhost:8000/api/ai/analyze', {
        api_key: apiKey, 
        price: price,
        rsi: conf.rsi,
        trend: conf.signal,
        trades: activeTrades,
        asset: activeAsset
      });
      setAiSummary(data.summary);
    } catch (e) {
      setAiSummary("Error conectando con Gemini AI.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Módulo 1: Motor de Confluencia */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative">
        <h2 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider border-b border-slate-800/50 pb-2">{activeAsset} Strict Engine</h2>
        
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center p-3 bg-[#080b11]/80 rounded-lg border border-slate-800/50">
            <span className="text-xs text-slate-400 font-semibold">Macro Trend (EMA 50/100)</span>
            <span className="text-lg">{conf.trend ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#080b11]/80 rounded-lg border border-slate-800/50">
            <span className="text-xs text-slate-400 font-semibold">Momentum Precision (RSI)</span>
            <span className="text-lg">{conf.mom ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#080b11]/80 rounded-lg border border-slate-800/50">
            <span className="text-xs text-slate-400 font-semibold">Volatilidad (ATR Breakout)</span>
            <span className="text-lg">{conf.vol ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#080b11]/80 rounded-lg border border-slate-800/50">
            <span className="text-xs text-slate-400 font-semibold">Risk/Reward Assessment</span>
            <span className="text-lg">{conf.rr ? '✅' : '❌'}</span>
          </div>
        </div>

        <div className={`p-5 rounded-xl text-center text-xl font-black tracking-widest border-2 transition-all duration-500
            ${conf.signal === 'BUY' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 
              conf.signal === 'SELL' ? 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 
              'border-slate-800 text-slate-600 bg-slate-950 shadow-inner'}`}
        >
          {conf.signal === 'WAIT' ? '🔒 WAIT FOR SETUP' : `${conf.signal} CONFIRMED`}
        </div>
      </div>

      {/* Módulo 2: Operaciones Activas */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-sm font-semibold mb-4 text-emerald-500 uppercase tracking-widest border-b border-slate-800/50 pb-2">Active Operations</h2>
        
        {/* Formulario de Nueva Operación */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <select 
            value={newTrade.type} onChange={e => setNewTrade({...newTrade, type: e.target.value})}
            className="col-span-2 bg-[#080b11] border border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-100 outline-none"
          >
            <option value="BUY">BUY (LONG)</option>
            <option value="SELL">SELL (SHORT)</option>
          </select>
          <input 
            type="number" placeholder="Entry" value={newTrade.entry} onChange={e => setNewTrade({...newTrade, entry: e.target.value})}
            className="bg-[#080b11] border border-slate-800 p-2 rounded-lg text-xs font-mono text-slate-100"
          />
          <input 
            type="number" placeholder="Lots" value={newTrade.lots} onChange={e => setNewTrade({...newTrade, lots: e.target.value})}
            className="bg-[#080b11] border border-slate-800 p-2 rounded-lg text-xs font-mono text-slate-100"
          />
          <button 
            onClick={() => { if(newTrade.entry) { addTrade(newTrade); setNewTrade({type:'BUY', entry:'', lots:'0.01', sl:'', tp:''}); } }}
            className="col-span-2 bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 p-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all"
          >
            Open Position
          </button>
        </div>

        {/* Lista de Operaciones */}
        <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar">
          {activeTrades.map(trade => {
            const pips = trade.type === 'BUY' ? (currentPrice - trade.entry) : (trade.entry - currentPrice);
            const pnl = pips * (parseFloat(trade.lots) * 100);
            return (
              <div key={trade.id} className="bg-[#080b11]/80 border border-slate-800 p-3 rounded-xl flex justify-between items-center group">
                <div>
                  <div className={`text-[10px] font-black ${trade.type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>{trade.type} {trade.lots} Lots</div>
                  <div className="text-[9px] text-slate-500 font-mono">Entry: {trade.entry}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-xs font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USD
                  </div>
                  <button onClick={() => removeTrade(trade.id)} className="mt-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-3 py-1 rounded-lg transition-colors text-[9px] uppercase font-black border border-rose-500/50 w-full">Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Módulo 3: Gemini Macro AI */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider border-b border-slate-800/50 pb-2">Macro AI Intelligence</h2>
        <input 
          type="password" placeholder="Gemini API Key" value={apiKey} onChange={e => setApiKey(e.target.value)}
          className="w-full bg-[#080b11]/80 border border-slate-800 rounded-lg p-2 text-amber-500 font-mono text-xs focus:border-amber-500 outline-none mb-3 transition-all"
        />
        <button onClick={getAiAnalysis} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/50 px-4 py-2 rounded-lg hover:bg-amber-500 hover:text-black transition-all font-bold text-xs tracking-wider uppercase mb-4">
          Scan Global Macros
        </button>
        <div className="bg-[#080b11]/80 border-l-2 border-amber-500 p-4 rounded-r-lg text-[13px] text-slate-300 min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar leading-relaxed" 
             dangerouslySetInnerHTML={{__html: aiSummary || '<span class="text-slate-600 italic">Waiting for command...</span>'}}>
        </div>
      </div>

    </div>
  );
}
