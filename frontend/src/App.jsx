import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import TradingViewChart from './components/TradingViewChart';
import RightPanel from './components/RightPanel';
import PortfolioTab from './components/PortfolioTab';
import AdvancedWidget from './components/AdvancedWidget';

function App() {
  const [activeTab, setActiveTab] = useState('xau');

  return (
    <div className="h-screen w-full bg-[#080b11] text-slate-100 overflow-hidden font-sans flex flex-col">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-800/50 p-4 bg-slate-900/50 shadow-md z-50">
        <div className="font-black text-xl text-slate-200 mr-8 tracking-widest">NEXUS</div>
        <button onClick={() => setActiveTab('xau')} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab==='xau'?'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]':'bg-[#080b11] border border-slate-800 text-slate-400 hover:text-slate-200'}`}>
          ⚔️ XAU/USD Terminal
        </button>
        <button onClick={() => setActiveTab('tv')} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab==='tv'?'bg-blue-500/20 text-blue-500 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]':'bg-[#080b11] border border-slate-800 text-slate-400 hover:text-slate-200'}`}>
          ☁️ My TradingView
        </button>
        <button onClick={() => setActiveTab('spy')} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab==='spy'?'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]':'bg-[#080b11] border border-slate-800 text-slate-400 hover:text-slate-200'}`}>
          📈 SP500 Portfolio
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-hidden relative">
        
        {/* TAB 1: Terminal Principal */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'xau' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="h-full w-full grid grid-cols-12 gap-4 p-4">
            <div className="col-span-3 h-full overflow-y-auto custom-scrollbar"><LeftPanel /></div>
            <div className="col-span-6 h-full overflow-hidden flex flex-col"><TradingViewChart /></div>
            <div className="col-span-3 h-full overflow-y-auto custom-scrollbar"><RightPanel /></div>
          </div>
        </div>

        {/* TAB 2: Nube Personal de TradingView */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'tv' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <AdvancedWidget />
        </div>

        {/* TAB 3: SPY Tracker */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'spy' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <PortfolioTab />
        </div>

      </div>
    </div>
  );
}

export default App;
