import React, { useState } from 'react';
import useStore from '../store/useStore';

export default function LeftPanel() {
  const { goldData, setGoldData, risk, setRisk, liveMarketData, priceOffset, setPriceOffset } = useStore();
  const [tvPriceInput, setTvPriceInput] = useState('');
  
  const rawPrice = liveMarketData.length > 0 ? liveMarketData[liveMarketData.length-1].close - priceOffset : 0;

  const handleCalibration = () => {
    const inputPrice = parseFloat(tvPriceInput);
    if(inputPrice && rawPrice > 0) {
        setPriceOffset(inputPrice - rawPrice);
        setTvPriceInput('');
    }
  };

  const handleRiskChange = (e) => setRisk({ [e.target.name]: parseFloat(e.target.value) || 0 });

  // Calculadora de Riesgo Institucional
  const riskAmount = (risk.capital * risk.riskPct) / 100;
  const pipValue = 10; // $10 por lote estándar en XAU/USD
  const slPips = risk.slPips || 1;
  const lotSize = riskAmount / (slPips * pipValue);

  return (
    <div className="flex flex-col gap-4">
      
      {/* Brand Header */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-tight">
          NEXUS V3
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Institutional Trading Setup</p>
      </div>

      {/* Market Calibration */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[9px] px-2 py-1 rounded-bl-lg font-bold border-l border-b border-amber-500/30">NUEVO</div>
        <h2 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider border-b border-slate-800/50 pb-2">Sync con TradingView</h2>
        <p className="text-[10px] text-slate-400 mb-3">Si tu broker tiene una diferencia de precio con nuestro feed en tiempo real, calíbralo aquí.</p>
        
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-[#080b11]/50 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Precio Interno</span>
                <span className="text-xs text-slate-300 font-mono">{rawPrice > 0 ? rawPrice.toFixed(2) : '...'}</span>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="number" placeholder="Tu precio en TV (Ej. 4565)" value={tvPriceInput} onChange={e => setTvPriceInput(e.target.value)}
                className="flex-grow bg-[#080b11]/80 border border-slate-800 rounded-lg p-2 text-amber-500 font-mono text-xs outline-none focus:border-amber-500 transition-all"
              />
              <button 
                onClick={handleCalibration}
                className="bg-amber-500/20 text-amber-500 border border-amber-500/50 px-3 rounded-lg font-bold text-[10px] uppercase hover:bg-amber-500 hover:text-black transition-all"
              >
                Sincronizar
              </button>
            </div>

            {priceOffset !== 0 && (
                <div className="mt-2 text-[10px] text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30 text-center font-bold">
                    Offset Activado: {priceOffset > 0 ? '+' : ''}{priceOffset.toFixed(2)} USD
                </div>
            )}
        </div>
      </div>

      {/* Risk Calculator */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider border-b border-slate-800/50 pb-2">Risk Engine</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Capital Total Cuenta ($)</label>
            <input 
              type="number" name="capital" value={risk.capital} onChange={handleRiskChange} 
              className="w-full bg-[#080b11]/80 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-base focus:border-emerald-500 outline-none transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Max Riesgo (%)</label>
              <input 
                type="number" name="riskPct" value={risk.riskPct} onChange={handleRiskChange} step="0.1" 
                className="w-full bg-[#080b11]/80 border border-slate-800 rounded-lg p-2 text-rose-500 font-mono text-sm focus:border-rose-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Stop Loss (Pips)</label>
              <input 
                type="number" name="slPips" value={risk.slPips} onChange={handleRiskChange} 
                className="w-full bg-[#080b11]/80 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-sm focus:border-emerald-500 outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Outputs Automáticos */}
        <div className="mt-6 p-4 bg-[#080b11]/80 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase font-semibold">Risk Amount</span>
            <span className="font-mono text-rose-500 font-bold text-lg">${riskAmount.toFixed(2)}</span>
          </div>
          <div className="w-full h-[1px] bg-slate-800/50 my-1"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase font-semibold">Position Size</span>
            <span className="font-mono text-emerald-500 font-bold text-lg">{lotSize.toFixed(2)} Lots</span>
          </div>
        </div>
      </div>

    </div>
  );
}
