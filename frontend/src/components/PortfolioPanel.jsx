import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PortfolioPanel() {
  const [invested, setInvested] = useState(0);
  const [shares, setShares] = useState(0);
  const [balance, setBalance] = useState(0);
  const [spyPrice, setSpyPrice] = useState(0);
  
  const [dcaAmount, setDcaAmount] = useState('');

  // Cargar estado guardado localmente (Simulando persistencia frontend/backend temporal)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nexus_portfolio')) || { invested: 0, shares: 0 };
    setInvested(saved.invested);
    setShares(saved.shares);
    updateMarketState(saved.shares);
  }, []);

  const saveState = (newInvested, newShares) => {
    localStorage.setItem('nexus_portfolio', JSON.stringify({ invested: newInvested, shares: newShares }));
  };

  // FETCH AL BACKEND PARA EL PRECIO DEL SPY EN VIVO
  const updateMarketState = async (currentShares = shares) => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/market/spy');
      const livePrice = data.price;
      setSpyPrice(livePrice);
      
      // Recalcular balance exacto según el precio en vivo y las acciones poseídas
      setBalance(currentShares * livePrice);
    } catch (e) {
      console.error("Error fetching SPY market data from backend", e);
    }
  };

  const handleDCA = () => {
    const amt = parseFloat(dcaAmount);
    if (!amt || amt <= 0 || !spyPrice) return;
    
    // Matemática pura: monto / precio actual = número de fracciones de acción
    const boughtShares = amt / spyPrice;
    const newInvested = invested + amt;
    const newShares = shares + boughtShares;
    
    setInvested(newInvested);
    setShares(newShares);
    setBalance(newShares * spyPrice);
    setDcaAmount('');
    saveState(newInvested, newShares);
  };

  // Cálculos de PnL (Ganancia o Pérdida)
  const pnlUSD = balance - invested;
  const pnlPct = invested > 0 ? (pnlUSD / invested) * 100 : 0;
  
  // Condicional de rentabilidad
  const isProfitable = balance >= invested;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Botón CRÍTICO: Actualizar Estado del Mercado */}
      <div className="flex justify-end">
        <button 
          onClick={() => updateMarketState()}
          className="bg-slate-800 border-2 border-emerald-500 text-emerald-500 px-8 py-3 rounded-xl font-bold text-lg hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
        >
          🔄 Actualizar Estado del Mercado (SPY: ${spyPrice > 0 ? spyPrice.toFixed(2) : '...'})
        </button>
      </div>

      {/* DASHBOARD METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <span className="text-slate-400 uppercase tracking-wider text-sm font-semibold mb-2">Capital Invertido</span>
          <span className="font-mono text-4xl font-bold text-slate-100">${invested.toFixed(2)}</span>
        </div>
        
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <span className="text-slate-400 uppercase tracking-wider text-sm font-semibold mb-2">Balance Actual</span>
          {/* Renderizado de color dinámico según rentabilidad */}
          <span className={`font-mono text-4xl font-bold flex items-center gap-2 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${balance.toFixed(2)}
            {isProfitable ? '📈' : '📉'}
          </span>
        </div>

        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <span className="text-slate-400 uppercase tracking-wider text-sm font-semibold mb-2">PnL (ROI)</span>
          <span className={`font-mono text-4xl font-bold ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
            {pnlUSD > 0 ? '+' : ''}{pnlUSD.toFixed(2)} ({pnlPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* FORMULARIO DCA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-card backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6">Gestión de Aportes (DCA)</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Monto a Invertir (USD)</label>
              <input 
                type="number" value={dcaAmount} onChange={e => setDcaAmount(e.target.value)}
                placeholder="Ej. 1000"
                className="bg-slate-800 border border-border rounded-lg px-4 py-3 w-full text-slate-100 font-mono text-lg outline-none focus:border-emerald-500"
              />
            </div>
            <button 
              onClick={handleDCA}
              className="bg-emerald-500/10 text-emerald-500 border border-emerald-500 px-6 py-3 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors font-bold text-lg mt-2"
            >
              Comprar SPY en Vivo
            </button>
            <div className="mt-4 text-sm text-slate-400">
              * El sistema dividirá el monto por el precio actual de SPY para calcular las fracciones. <br/><br/>
              Total de acciones acumuladas: <span className="text-gold font-mono">{shares.toFixed(4)} shares</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
