import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Flame, ChevronRight } from 'lucide-react';
import { MarketMoversData, StockQuote } from '../types';

interface MarketMoversProps {
  data: MarketMoversData;
  onSelectStock: (symbol: string) => void;
}

export const MarketMovers: React.FC<MarketMoversProps> = ({ data, onSelectStock }) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  const stocksToDisplay: StockQuote[] =
    activeTab === 'gainers'
      ? data.top_gainers
      : activeTab === 'losers'
      ? data.top_losers
      : data.most_active;

  return (
    <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Today's Market Movers</span>
          </h2>
          <p className="text-xs text-slate-400">Live momentum and volume leaders</p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center bg-[#181F30] border border-[#252F44] rounded-xl p-1 self-start">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gainers'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'losers'
                ? 'bg-rose-500/20 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Losers
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Most Active
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <ul role="list" aria-label="Market Movers List" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 list-none p-0 m-0">
        {stocksToDisplay.map((stock) => {
          const isPositive = stock.change >= 0;
          return (
            <li
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="bg-[#171D2B] hover:bg-[#1E2638] border border-[#232D42] hover:border-emerald-500/40 rounded-xl p-3.5 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                    {stock.symbol}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {stock.name}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {stock.change_percent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#232D42]/60">
                <span className="text-sm font-bold text-white">
                  ₹{stock.price.toFixed(2)}
                </span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center group-hover:translate-x-0.5 transition-transform">
                  View Verdict <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
