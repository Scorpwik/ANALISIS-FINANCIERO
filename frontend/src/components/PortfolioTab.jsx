import React, { useState } from 'react';
import useStore from '../store/useStore';
import axios from 'axios';

export default function PortfolioTab() {
  const { portfolio, setPortfolio } = useStore();
  const [dcaAmount, setDcaAmount] = useState('');
  const [spyLivePrice, setSpyLivePrice] = useState(0);

  const updateSPYState = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/market/spy');
      const livePrice = data.price;
      setSpyLivePrice(livePrice);
      setPortfolio({ balance: portfolio.shares * livePrice });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDCA = () => {
    const amt = parseFloat(dcaAmount);
    if (!amt || spyLivePrice === 0) return;
    const boughtShares = amt / spyLivePrice;
    
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        usd: amt,
        price: spyLivePrice,
        shares: boughtShares
    };

    const newHistory = [...(portfolio.history || []), newEntry];

    setPortfolio({
      invested: portfolio.invested + amt,
      shares: portfolio.shares + boughtShares,
      balance: (portfolio.shares + boughtShares) * spyLivePrice,
      history: newHistory
    });
    setDcaAmount('');
  };

  const handleDelete = (id) => {
    const entry = portfolio.history.find(x => x.id === id);
    if(!entry) return;

    const newHistory = portfolio.history.filter(x => x.id !== id);
    
    const newInvested = portfolio.invested - entry.usd;
    const newShares = portfolio.shares - entry.shares;
    
    setPortfolio({
        invested: newInvested > 0 ? newInvested : 0,
        shares: newShares > 0 ? newShares : 0,
        balance: newShares > 0 && spyLivePrice > 0 ? newShares * spyLivePrice : 0,
        history: newHistory
    });
  };

  const isProfitable = portfolio.balance >= portfolio.invested;

  return (
    <div className="h-full overflow-y-auto p-8 max-w-6xl mx-auto flex flex-col gap-8 custom-scrollbar">
      
      <div className="flex justify-between items-end bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
        <div>
            <h1 className="text-4xl font-black text-emerald-500 tracking-tight">S&P 500 Index Tracker</h1>
            <p className="text-slate-400 mt-2">Gestiona tus aportes DCA y monitorea tu crecimiento a largo plazo.</p>
        </div>
        <button 
          onClick={updateSPYState}
          className="bg-slate-800 border-2 border-emerald-500 text-emerald-500 px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          🔄 Actualizar Precio en Vivo (SPY: ${spyLivePrice > 0 ? spyLivePrice.toFixed(2) : '...'})
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-sm text-slate-500 uppercase font-bold tracking-widest mb-2">Capital Total Invertido</div>
            <div className="font-mono text-3xl font-bold text-slate-200">${portfolio.invested.toFixed(2)}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-sm text-slate-500 uppercase font-bold tracking-widest mb-2">Total de Acciones (SPY)</div>
            <div className="font-mono text-3xl font-bold text-amber-500">{portfolio.shares.toFixed(4)}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-sm text-slate-400 uppercase font-bold tracking-widest mb-2">Balance en Tiempo Real</div>
            <div className={`font-mono text-4xl font-black flex items-center gap-2 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${portfolio.balance.toFixed(2)}
              {isProfitable ? '📈' : '📉'}
            </div>
          </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4">Añadir Aporte (DCA)</h2>
        <div className="flex gap-4">
          <input 
            type="number" placeholder="Monto en USD (Ej. 500)" value={dcaAmount} onChange={e => setDcaAmount(e.target.value)}
            className="flex-grow bg-[#080b11]/80 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-lg outline-none focus:border-emerald-500 transition-all"
          />
          <button onClick={handleDCA} className="px-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 rounded-xl font-black hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-wider text-lg">
            Comprar Fracciones
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl mb-10">
        <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4">Historial de Aportes</h2>
        {(!portfolio.history || portfolio.history.length === 0) ? (
            <p className="text-slate-500 text-center py-8">No hay aportes registrados aún.</p>
        ) : (
            <div className="flex flex-col gap-3">
                {portfolio.history.slice().reverse().map(entry => (
                    <div key={entry.id} className="flex justify-between items-center bg-[#080b11]/80 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex gap-12">
                            <div><span className="text-[10px] uppercase text-slate-500 font-bold block">Fecha</span><span className="font-mono text-sm">{entry.date}</span></div>
                            <div><span className="text-[10px] uppercase text-slate-500 font-bold block">Inversión</span><span className="font-mono text-sm text-emerald-500 font-bold">${entry.usd.toFixed(2)}</span></div>
                            <div><span className="text-[10px] uppercase text-slate-500 font-bold block">Precio SPY</span><span className="font-mono text-sm">${entry.price.toFixed(2)}</span></div>
                            <div><span className="text-[10px] uppercase text-slate-500 font-bold block">Shares Adquiridos</span><span className="font-mono text-sm text-amber-500">+{entry.shares.toFixed(4)}</span></div>
                        </div>
                        <button onClick={() => handleDelete(entry.id)} className="text-rose-500 hover:bg-rose-500/20 px-4 py-2 rounded-lg font-bold text-xs transition-colors border border-rose-500/50 uppercase tracking-widest">
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}
