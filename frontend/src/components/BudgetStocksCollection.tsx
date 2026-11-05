import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  ArrowRight,
  Calculator,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Info,
  HelpCircle
} from 'lucide-react';
import { BudgetStockItem, BudgetStocksResponse } from '../types';
import { api } from '../services/api';
import { ProfitCalculatorModal } from './ProfitCalculatorModal';

interface BudgetStocksCollectionProps {
  onSelectStock: (symbol: string) => void;
}

export const BudgetStocksCollection: React.FC<BudgetStocksCollectionProps> = ({ onSelectStock }) => {
  const [data, setData] = useState<BudgetStocksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNDER_100' | '100_TO_250' | '250_TO_500'>('ALL');
  const [selectedBudget, setSelectedBudget] = useState<number>(5000);
  const [useLeverage, setUseLeverage] = useState<boolean>(true);
  const [calcModalStock, setCalcModalStock] = useState<BudgetStockItem | null>(null);

  const fetchBudgetStocks = async () => {
    try {
      const res = await api.getBudgetStocks();
      setData(res);
    } catch (err) {
      console.error('Failed to load budget stocks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStocks();
    const timer = setInterval(fetchBudgetStocks, 15000);
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

  const stocks = data?.stocks || [];
  const filteredStocks = stocks.filter((s) => {
    if (filter === 'ALL') return true;
    return s.budget_tier === filter;
  });

  return (
    <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              PENNY & BUDGET STOCK COLLECTION (UNDER ₹500)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {stocks.length} Affordable Stocks
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Buy more shares with less money! Designed for small budgets (₹1,000 ~ ₹10,000) to get high quantity and high ROI.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'bg-[#182030] text-slate-300 hover:text-white border border-[#26334B]'
            }`}
          >
            All Under ₹500 ({stocks.length})
          </button>
          <button
            onClick={() => setFilter('UNDER_100')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'UNDER_100'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-black'
                : 'bg-[#182030] text-teal-300 hover:text-white border border-[#26334B]'
            }`}
          >
            🪙 Under ₹100 ({data?.under_100_count || 0})
          </button>
          <button
            onClick={() => setFilter('100_TO_250')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === '100_TO_250'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'bg-[#182030] text-indigo-300 hover:text-white border border-[#26334B]'
            }`}
          >
            ⚡ ₹100 - ₹250 ({data?.under_250_count || 0})
          </button>
          <button
            onClick={() => setFilter('250_TO_500')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === '250_TO_500'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-[#182030] text-amber-300 hover:text-white border border-[#26334B]'
            }`}
          >
            🏆 ₹250 - ₹500 ({data?.under_500_count || 0})
          </button>
        </div>
      </div>

      {/* Interactive Budget Simulator Bar */}
      <div className="bg-[#0E131F] p-4 rounded-xl border border-[#222E44] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              Your Investment Budget:
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={500}
                step={500}
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(Math.max(100, Number(e.target.value) || 0))}
                className="bg-[#161D2B] border border-emerald-500/40 rounded-lg pl-6 pr-2 py-1 text-xs text-white font-mono font-bold w-28 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useLeverage}
                onChange={(e) => setUseLeverage(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span>5x Intraday MIS Leverage</span>
              <span className="text-[10px] text-emerald-400 font-mono">(₹{(selectedBudget * (useLeverage ? 5 : 1)).toLocaleString('en-IN')} Buying Power)</span>
            </label>
          </div>
        </div>

        {/* Preset quick budget chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
          {[1000, 2000, 5000, 10000, 25000, 50000].map((b) => {
            const active = selectedBudget === b;
            return (
              <button
                key={b}
                onClick={() => setSelectedBudget(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-sm'
                    : 'bg-[#182030] text-slate-400 hover:text-white border border-[#26334B]'
                }`}
              >
                ₹{b.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Semantic List of Budget Stocks */}
      {filteredStocks.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs bg-[#0E131F] rounded-xl border border-dashed border-[#232F46]">
          No stocks found in this budget tier. Select "All Under ₹500" to view all.
        </div>
      ) : (
        <ul role="list" aria-label="Budget Stocks Collection" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0 m-0">
          {filteredStocks.map((stock) => {
            const isUp = stock.direction === 'UP';
            const multiplier = useLeverage ? 5 : 1;
            const buyingPower = selectedBudget * multiplier;
            const userShares = Math.max(1, Math.floor(buyingPower / stock.price));
            const estProfit = Math.round(userShares * (stock.target_price - stock.price));
            const targetPct = (((stock.target_price - stock.price) / stock.price) * 100).toFixed(1);
            const stopPct = (((stock.price - stock.stop_loss) / stock.price) * 100).toFixed(1);

            return (
              <li
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="bg-gradient-to-b from-[#182030] to-[#131824] hover:from-[#1E273B] hover:to-[#171E2D] border border-[#26334B] hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all shadow-md group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />

                <div>
                  {/* Top: Category Tag + Budget Tier */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate max-w-[150px]">
                      {stock.budget_tier_label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Target: <strong className="text-emerald-400 font-mono">+{targetPct}%</strong>
                    </span>
                  </div>

                  {/* Symbol & Name on left, Price & Change on right */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-black text-white text-base group-hover:text-emerald-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">
                        ₹{stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-extrabold flex items-center justify-end gap-0.5 ${
                          stock.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.change_percent >= 0 ? '+' : ''}
                        {stock.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Direction Banner with Methodology Tooltip */}
                  <div className="mb-3">
                    <div
                      title="Methodology: Scanned under ₹500 using 5-candle ATR range, volume acceleration vs 20-EMA, and distance to VWAP to optimize share quantity and risk/reward."
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-help ${
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
                        <span>{isUp ? 'BULLISH UPSIDE' : 'DEFENSIVE WATCH'}</span>
                        <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
                        Target ₹{stock.target_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Budget Buying Power Box driven by budget input */}
                  <div className="mb-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">With ₹{selectedBudget.toLocaleString('en-IN')}{useLeverage ? ' (5x)' : ''}:</span>
                      <strong className="text-emerald-400 font-bold font-mono">{userShares} Shares</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Est. Profit:</span>
                      <strong className="text-emerald-300 font-bold font-mono">
                        +₹{estProfit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Target & Stop Loss Levels with target% and stop% */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3 bg-black/30 p-2 rounded-xl border border-white/5 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Target</span>
                      <span className="font-bold text-emerald-400">
                        ₹{stock.target_price.toFixed(2)} <span className="text-[10px] text-emerald-300 font-sans">(+{targetPct}%)</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Stop Loss</span>
                      <span className="font-bold text-rose-400">
                        ₹{stock.stop_loss.toFixed(2)} <span className="text-[10px] text-rose-300 font-sans">(-{stopPct}%)</span>
                      </span>
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

                  <span className="text-[11px] font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
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
          targetPrice={calcModalStock.target_price}
          stopLoss={calcModalStock.stop_loss}
          initialQuantity={Math.max(1, Math.floor(selectedBudget / calcModalStock.price))}
          onTrade={() => {
            onSelectStock(calcModalStock.symbol);
            setCalcModalStock(null);
          }}
        />
      )}
    </div>
  );
};
