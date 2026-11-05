import React, { useState } from 'react';
import {
  Target,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Coins,
  ArrowRight,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import { HighProbSetup } from '../types';
import { ProfitCalculatorModal } from './ProfitCalculatorModal';

interface HighProbSetupsProps {
  setups: HighProbSetup[];
  onSelectStock: (symbol: string) => void;
}

export const HighProbSetups: React.FC<HighProbSetupsProps> = ({ setups, onSelectStock }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [calcModalStock, setCalcModalStock] = useState<HighProbSetup | null>(null);

  const categories = [
    { id: 'ALL', label: `All Setups (${setups.length})` },
    { id: 'BREAKOUT', label: '🚀 Breakouts' },
    { id: 'DIP_BUY', label: '🌊 Institutional Dip Buys' },
    { id: 'BREAKDOWN', label: '🔻 Breakdowns' },
    { id: 'VOLUME_SURGE', label: '⚡ Volume Surges' },
  ];

  const filteredSetups = setups.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              CURATED INTRADAY TIMING SETUPS
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {setups.length} Active Options
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Top statistical setups with multi-timeframe alignment, VWAP dominance, and institutional risk-reward edge.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                    : 'bg-[#182030] text-slate-300 hover:text-white border border-[#26334B]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Setups */}
      {filteredSetups.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs bg-[#0E131F] rounded-xl border border-dashed border-[#232F46]">
          No setups currently in this category. Select "All Setups" to view all available options.
        </div>
      ) : (
        <ul role="list" aria-label="Curated Intraday Timing Setups" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0 m-0">
          {filteredSetups.map((setup) => {
            const isUp = setup.intraday_direction === 'UP';
            const targetP = setup.target_price || (isUp ? setup.price * 1.035 : setup.price * 0.965);
            const stopP = setup.stop_loss || (isUp ? setup.price * 0.985 : setup.price * 1.015);
            const roiPct = setup.potential_roi_percent || 3.5;
            const estProfit50 = Math.abs(targetP - setup.price) * 50;
            const targetPct = Math.abs(((targetP - setup.price) / setup.price) * 100).toFixed(1);
            const stopPct = Math.abs(((setup.price - stopP) / setup.price) * 100).toFixed(1);

            return (
              <li
                key={setup.symbol}
                onClick={() => onSelectStock(setup.symbol)}
                className="bg-gradient-to-b from-[#182030] to-[#131824] hover:from-[#1E273B] hover:to-[#171E2D] border border-[#26334B] hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all shadow-md group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />

                <div>
                  {/* Top: Category Tag + Symbol & Price */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      title="Methodology: Multi-factor statistical scoring combining RSI momentum divergence, VWAP deviation, Bollinger band squeezes, and Order Block institutional flow."
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate max-w-[150px] cursor-help"
                    >
                      {setup.category_label || '🚀 Momentum Setup'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Score: <strong className="text-white">{setup.setup_score}/100</strong>
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-black text-white text-base group-hover:text-indigo-400 transition-colors">
                        {setup.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">
                        {setup.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">
                        ₹{setup.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-extrabold flex items-center justify-end gap-0.5 ${
                          setup.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {setup.change_percent >= 0 ? '+' : ''}
                        {setup.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Direction & Probability Banner */}
                  <div className="mb-3">
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                        isUp
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isUp ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{setup.probability}% {setup.intraday_direction}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
                        Exp. +{roiPct}%
                      </span>
                    </div>
                  </div>

                  {/* Target & Stop Loss Levels */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3 bg-black/30 p-2 rounded-xl border border-white/5 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Target</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{targetP.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-400/80">
                          (+{targetPct}%)
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Stop Loss</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-rose-300">
                          ₹{stopP.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-rose-400/80">
                          (-{stopPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Profit Preview for 50 Shares */}
                  <div className="mb-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-indigo-400" />
                      50 Shares Est:
                    </span>
                    <span className="font-bold font-mono text-emerald-400">
                      +₹{estProfit50.toFixed(0)} Profit
                    </span>
                  </div>

                  {/* Beginner-Friendly Explanation */}
                  {setup.beginner_reason && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#0F1420] border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-indigo-400 font-bold block mb-0.5">💡 Why this setup:</span>
                      <p className="line-clamp-2">{setup.beginner_reason}</p>
                    </div>
                  )}

                  {/* Key Timings */}
                  <div className="space-y-1 text-[11px] text-slate-400 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Horizon:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{setup.horizon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span>Exit Window:</span>
                      </span>
                      <span className="font-semibold text-emerald-400">{setup.expected_exit_time}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#232F46] flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalcModalStock(setup);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182236] hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Calculate Profit</span>
                  </button>

                  <span className="text-[11px] font-bold text-indigo-400 group-hover:underline flex items-center gap-0.5">
                    <span>Analyze</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Profit Calculator Modal Popup */}
      {calcModalStock && (
        <ProfitCalculatorModal
          isOpen={!!calcModalStock}
          onClose={() => setCalcModalStock(null)}
          symbol={calcModalStock.symbol}
          currentPrice={calcModalStock.price}
          targetPrice={calcModalStock.target_price || (calcModalStock.intraday_direction === 'UP' ? calcModalStock.price * 1.035 : calcModalStock.price * 0.965)}
          stopLoss={calcModalStock.stop_loss || (calcModalStock.intraday_direction === 'UP' ? calcModalStock.price * 0.985 : calcModalStock.price * 1.015)}
          initialQuantity={50}
          onTrade={() => {
            onSelectStock(calcModalStock.symbol);
            setCalcModalStock(null);
          }}
        />
      )}
    </div>
  );
};
