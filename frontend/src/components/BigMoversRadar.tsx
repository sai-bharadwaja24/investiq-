import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldAlert,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Calculator,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { BigMoverItem, BigMoversResponse } from '../types';
import { api } from '../services/api';
import { ProfitCalculatorModal } from './ProfitCalculatorModal';

interface BigMoversRadarProps {
  onSelectStock: (symbol: string) => void;
}

export const BigMoversRadar: React.FC<BigMoversRadarProps> = ({ onSelectStock }) => {
  const [data, setData] = useState<BigMoversResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'GREAT_RISE' | 'GREAT_FALL' | 'HIGH_VOLATILITY' | 'UNDER_250'>('ALL');
  const [calcModalStock, setCalcModalStock] = useState<BigMoverItem | null>(null);

  const fetchMovers = async () => {
    try {
      const res = await api.getBigMovers();
      setData(res);
    } catch (err) {
      console.error('Failed to load big movers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers();
    // Auto-refresh every 12 seconds
    const timer = setInterval(fetchMovers, 12000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-72 bg-slate-800 rounded mb-4"></div>
        <div className="h-4 w-96 bg-slate-800/60 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-44 bg-slate-800/40 rounded-xl"></div>
          <div className="h-44 bg-slate-800/40 rounded-xl"></div>
          <div className="h-44 bg-slate-800/40 rounded-xl"></div>
          <div className="h-44 bg-slate-800/40 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const movers = data?.movers || [];
  const filteredMovers = movers.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'GREAT_RISE') return m.move_type === 'GREAT_RISE';
    if (filter === 'GREAT_FALL') return m.move_type === 'GREAT_FALL';
    if (filter === 'HIGH_VOLATILITY') return m.risk_level === 'EXTREME' || m.risk_level === 'HIGH';
    if (filter === 'UNDER_250') return m.current_price <= 250;
    return true;
  });

  return (
    <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              BIG MOVERS RADAR
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Today's Great Rise & Fall ({movers.length} Candidates)
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time scanner detecting extreme momentum breakouts, severe breakdowns below VWAP, and heavy catalyst volume.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-[#182030] text-slate-300 hover:text-white border border-[#26334B]'
            }`}
          >
            All Candidates ({movers.length})
          </button>
          <button
            onClick={() => setFilter('GREAT_RISE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'GREAT_RISE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'bg-[#182030] text-emerald-400 hover:bg-emerald-500/10 border border-[#26334B]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Great Rise ({data?.rise_candidates_count || 0})</span>
          </button>
          <button
            onClick={() => setFilter('GREAT_FALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'GREAT_FALL'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black'
                : 'bg-[#182030] text-rose-400 hover:bg-rose-500/10 border border-[#26334B]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Great Fall ({data?.fall_candidates_count || 0})</span>
          </button>
          <button
            onClick={() => setFilter('HIGH_VOLATILITY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'HIGH_VOLATILITY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-[#182030] text-amber-400 hover:bg-amber-500/10 border border-[#26334B]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>High Volatility</span>
          </button>
          <button
            onClick={() => setFilter('UNDER_250')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'UNDER_250'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-black'
                : 'bg-[#182030] text-teal-400 hover:bg-teal-500/10 border border-[#26334B]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Under ₹250</span>
          </button>
        </div>
      </div>

      {/* Grid of Big Mover Cards - Identical to Curated Intraday Timing Setups */}
      {filteredMovers.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs bg-[#0E131F] rounded-xl border border-dashed border-[#232F46]">
          No stocks currently match the "{filter}" filter. Select "All Candidates" to see all options.
        </div>
      ) : (
        <ul role="list" aria-label="Big Movers Radar" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0 m-0">
          {filteredMovers.map((stock) => {
            const isRise = stock.move_type === 'GREAT_RISE';
            const estProfit50 = (stock.target_price - stock.current_price) * 50;
            const targetPct = Math.abs(((stock.target_price - stock.current_price) / stock.current_price) * 100).toFixed(1);
            const stopPct = Math.abs(((stock.current_price - stock.invalidation_level) / stock.current_price) * 100).toFixed(1);

            return (
              <li
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="bg-gradient-to-b from-[#182030] to-[#131824] hover:from-[#1E273B] hover:to-[#171E2D] border border-[#26334B] hover:border-amber-500/50 rounded-2xl p-4 cursor-pointer transition-all shadow-md group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />

                <div>
                  {/* Top: Category Tag + Conviction Score */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      title="Methodology: Algorithmic detection of high-volume price impulses, multi-timeframe breakout patterns, and institutional liquidity order blocks."
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border truncate max-w-[150px] cursor-help ${
                        isRise
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {stock.badge_text}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Conviction: <strong className="text-white">{stock.confidence_score}%</strong>
                    </span>
                  </div>

                  {/* Symbol & Name on left, Price & Change on right */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-black text-white text-base group-hover:text-amber-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">
                        ₹{stock.current_price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-extrabold flex items-center justify-end gap-0.5 ${
                          stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Direction & Move Range Banner */}
                  <div className="mb-2">
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                        isRise
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isRise ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{isRise ? 'GREAT RISE' : 'GREAT FALL'}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
                        Exp. {stock.expected_move_range}
                      </span>
                    </div>
                  </div>

                  {/* Smart Money Concepts Badge (from YouTube strategies) */}
                  {stock.smart_money_badge && (
                    <div className="mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        {stock.smart_money_badge}
                      </span>
                    </div>
                  )}

                  {/* Target & Stop Loss Levels */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3 bg-black/30 p-2 rounded-xl border border-white/5 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Target</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-bold ${isRise ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{stock.target_price.toFixed(2)}
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
                          ₹{stock.invalidation_level.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-rose-400/80">
                          (-{stopPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Profit Preview for 50 Shares */}
                  <div className="mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      50 Shares Est:
                    </span>
                    <span className={`font-bold font-mono ${isRise ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {estProfit50 >= 0 ? `+₹${estProfit50.toFixed(0)} Profit` : 'Defensive Exit'}
                    </span>
                  </div>

                  {/* Beginner-Friendly Reason */}
                  {stock.beginner_explanation && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#0F1420] border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-amber-400 font-bold block mb-0.5">💡 Why it's moving:</span>
                      <p className="line-clamp-2">{stock.beginner_explanation}</p>
                    </div>
                  )}

                  {/* Volume Ratio & Risk Level */}
                  <div className="space-y-1 text-[11px] text-slate-400 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Volume Ratio:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{stock.volume_surge_ratio}x Volume</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldAlert className="w-3 h-3 text-indigo-400" />
                        <span>Risk Level:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{stock.risk_level}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#232F46] flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalcModalStock(stock);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182236] hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Calculate Profit</span>
                  </button>

                  <span className="text-[11px] font-bold text-amber-400 group-hover:underline flex items-center gap-0.5">
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
          currentPrice={calcModalStock.current_price}
          targetPrice={calcModalStock.target_price}
          stopLoss={calcModalStock.invalidation_level}
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
