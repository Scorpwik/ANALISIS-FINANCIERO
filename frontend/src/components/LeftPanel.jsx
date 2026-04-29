import React from 'react';
import useStore from '../store/useStore';

export default function LeftPanel() {
  const { goldData, setGoldData, risk, setRisk } = useStore();

  const handleGoldChange = (e) => setGoldData({ [e.target.name]: parseFloat(e.target.value) || 0 });
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

      {/* Manual Market Data Override */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider border-b border-slate-800/50 pb-2">Data Override (XAU/USD)</h2>
        <div className="grid grid-cols-2 gap-3">
          {['current', 'open', 'high', 'low', 'close'].map((k) => (
            <div key={k} className={`${k==='current' ? 'col-span-2' : 'col-span-1'}`}>
              <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">{k}</label>
              <input 
                type="number" name={k} value={goldData[k]} onChange={handleGoldChange}
                className="w-full bg-[#080b11]/80 border border-slate-800 rounded-lg p-2 text-amber-500 font-mono text-sm focus:border-amber-500 outline-none transition-all"
              />
            </div>
          ))}
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
