import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Gold Manual Data & Risk Management
      goldData: { current: 2350, open: 2345, high: 2355, low: 2340, close: 2344 },
      setGoldData: (data) => set((state) => ({ goldData: { ...state.goldData, ...data } })),
      
      risk: { capital: 100000, riskPct: 1, slPips: 50 },
      setRisk: (data) => set((state) => ({ risk: { ...state.risk, ...data } })),
      
      // AI Auth
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // Portfolio SPY
      portfolio: { invested: 0, shares: 0, balance: 0, history: [] },
      setPortfolio: (data) => set((state) => ({ portfolio: { ...state.portfolio, ...data } })),
      
      // Live Data Storage for Advanced Confluence Calculation
      liveMarketData: [],
      setLiveMarketData: (data) => set({ liveMarketData: data }),

      // Timeframe Management
      timeframe: '15m',
      setTimeframe: (tf) => set({ timeframe: tf }),

      // Active Operations
      activeTrades: [],
      addTrade: (trade) => set((state) => ({ activeTrades: [...state.activeTrades, { ...trade, id: Date.now() }] })),
      removeTrade: (id) => set((state) => ({ activeTrades: state.activeTrades.filter(t => t.id !== id) })),
    }),
    {
      name: 'nexus-v3-storage', // Guardado persistente automático
      partialize: (state) => ({ risk: state.risk, apiKey: state.apiKey, portfolio: state.portfolio, goldData: state.goldData, activeTrades: state.activeTrades, timeframe: state.timeframe }),
    }
  )
);

export default useStore;
