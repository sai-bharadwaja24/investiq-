import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Target,
  ShieldAlert,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Timer,
  CheckCircle2,
  Trash2,
  Pin,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { TimedExitEvaluation, ActiveTrade } from '../types';
import { api, liveWs } from '../services/api';

interface ActiveTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol: string;
  defaultPrice: number;
  activeTrades: ActiveTrade[];
  onRefreshTrades: () => void;
}

const formatCurrentTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const ActiveTradeModal: React.FC<ActiveTradeModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol,
  defaultPrice,
  activeTrades,
  onRefreshTrades,
}) => {
  const [symbol, setSymbol] = useState(defaultSymbol || 'TATASTEEL');
  const [entryPrice, setEntryPrice] = useState<number>(defaultPrice || 185.0);
  const [entryTime, setEntryTime] = useState<string>(formatCurrentTime());
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [livePrice, setLivePrice] = useState<number>(defaultPrice || 0);

  const [evaluation, setEvaluation] = useState<TimedExitEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Keep track of which symbol was initialized to prevent overwriting user input
  const initializedSymbolRef = useRef<string | null>(null);

  // Initialize or load pinned trade when modal opens or symbol changes
  useEffect(() => {
    if (!isOpen) {
      initializedSymbolRef.current = null;
      return;
    }

    const currentSym = (defaultSymbol || symbol).toUpperCase();
    if (initializedSymbolRef.current === currentSym) {
      return;
    }
    initializedSymbolRef.current = currentSym;
    setSymbol(currentSym);

    // 1. Check local storage for persistent pinned trade
    try {
      const saved = localStorage.getItem(`investiq_trade_${currentSym}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.entryPrice && parsed.entryPrice > 0) {
          setEntryPrice(Number(parsed.entryPrice));
          setEntryTime(parsed.entryTime || formatCurrentTime());
          setIsPinned(true);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Check backend activeTrades list
    const backendTrade = activeTrades.find((t) => t.symbol.toUpperCase() === currentSym);
    if (backendTrade) {
      setEntryPrice(backendTrade.entry_price);
      setEntryTime(backendTrade.entry_time);
      setIsPinned(true);
      return;
    }

    // 3. Brand new trade setup: use current price once, but don't overwrite if user already typed
    if (defaultPrice && defaultPrice > 0) {
      setEntryPrice(defaultPrice);
      setLivePrice(defaultPrice);
    }
    setEntryTime(formatCurrentTime());
    setIsPinned(false);
  }, [isOpen, defaultSymbol]);

  // Save changes to localStorage so buy price stays permanently fixed
  const persistTrade = (sym: string, price: number, time: string) => {
    try {
      localStorage.setItem(
        `investiq_trade_${sym.toUpperCase()}`,
        JSON.stringify({ entryPrice: price, entryTime: time, savedAt: Date.now() })
      );
      setIsPinned(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEntryPriceChange = (val: number) => {
    setEntryPrice(val);
    persistTrade(symbol, val, entryTime);
  };

  const handleEntryTimeChange = (val: string) => {
    setEntryTime(val);
    persistTrade(symbol, entryPrice, val);
  };

  const handleResetToMarketPrice = () => {
    if (livePrice > 0) {
      setEntryPrice(livePrice);
      const nowTime = formatCurrentTime();
      setEntryTime(nowTime);
      persistTrade(symbol, livePrice, nowTime);
    }
  };

  const handleClearTrade = () => {
    try {
      localStorage.removeItem(`investiq_trade_${symbol.toUpperCase()}`);
    } catch (e) {}
    setIsPinned(false);
    if (livePrice > 0) {
      setEntryPrice(livePrice);
    }
    setEntryTime(formatCurrentTime());
  };

  // Evaluate trade with backend intelligence
  const runEvaluation = async () => {
    if (!symbol || entryPrice <= 0) return;
    setLoading(true);
    try {
      const res = await api.evaluateTrade(symbol, entryPrice, entryTime);
      setEvaluation(res);
      if (res.current_price) {
        setLivePrice(res.current_price);
      }
      if (res.countdown_seconds) {
        setCountdown(res.countdown_seconds);
      } else {
        setCountdown(null);
      }
    } catch (e) {
      console.error('Evaluation error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && symbol && entryPrice > 0) {
      runEvaluation();
      const interval = setInterval(runEvaluation, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, symbol, entryPrice, entryTime]);

  // Live WebSocket Tick subscription for real-time sub-second price and PnL updates
  useEffect(() => {
    if (!isOpen || !symbol) return;

    const handleTick = (tickData: any) => {
      if (!tickData || !tickData.price || tickData.price <= 0) return;
      if (tickData.symbol && tickData.symbol !== symbol) return;

      const newPrice = Number(tickData.price);
      setLivePrice(newPrice);

      // Recompute real-time PnL instantly on each tick
      setEvaluation((prev) => {
        if (!prev) return null;
        const livePnl = Number((newPrice - entryPrice).toFixed(2));
        const livePnlPct = Number(((livePnl / (entryPrice || 1)) * 100).toFixed(2));
        return {
          ...prev,
          current_price: newPrice,
          current_pnl: livePnl,
          current_pnl_percent: livePnlPct,
        };
      });
    };

    liveWs.subscribe(symbol, handleTick);
    return () => {
      liveWs.unsubscribe(symbol, handleTick);
    };
  }, [isOpen, symbol, entryPrice]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSaveToBackend = async () => {
    try {
      await api.trackTrade({
        symbol,
        entry_price: entryPrice,
        entry_time: entryTime,
      });
      persistTrade(symbol, entryPrice, entryTime);
      onRefreshTrades();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseTrade = async (id: string) => {
    try {
      await api.closeTrade(id);
      onRefreshTrades();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const currentDisplayPrice = livePrice > 0 ? livePrice : (evaluation?.current_price || entryPrice);
  const livePnl = Number((currentDisplayPrice - entryPrice).toFixed(2));
  const livePnlPct = Number(((livePnl / (entryPrice || 1)) * 100).toFixed(2));
  const isProfit = livePnl >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-[#232D42] w-full max-w-2xl rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#20283A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Active In-Trade Monitor & Timed Exit Advisor</h2>
              <p className="text-xs text-slate-400">Continuous live re-predictions & exact exit clock times</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Entry Setup Form (Pinned & Fixed) */}
        <div className="bg-[#171D2B] border border-[#232D42] rounded-2xl p-4 my-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Your Trade Setup</span>
              {isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Pin className="w-3 h-3 rotate-45" />
                  PINNED BUY PRICE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToMarketPrice}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                title="Reset buy price to current live market price"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Use Live Price (₹{currentDisplayPrice.toFixed(2)})</span>
              </button>
              {isPinned && (
                <button
                  onClick={handleClearTrade}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                  title="Unpin / Clear saved price"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Stock Ticker</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  const s = e.target.value.toUpperCase();
                  setSymbol(s);
                  initializedSymbolRef.current = null;
                }}
                className="w-full bg-[#121620] border border-[#2B364E] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>I Bought At (₹)</span>
                <span className="text-[10px] text-emerald-400 font-normal">Fixed & Saved</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={entryPrice}
                onChange={(e) => handleEntryPriceChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121620] border border-[#2B364E] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 ring-1 ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>Time Bought</span>
                <button
                  type="button"
                  onClick={() => handleEntryTimeChange(formatCurrentTime())}
                  className="text-[10px] text-sky-400 hover:underline"
                >
                  Set Now
                </button>
              </label>
              <input
                type="text"
                placeholder="e.g. 09:30 AM"
                value={entryTime}
                onChange={(e) => handleEntryTimeChange(e.target.value)}
                className="w-full bg-[#121620] border border-[#2B364E] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Live In-Flight Evaluation Result */}
        {loading && !evaluation ? (
          <div className="p-8 text-center text-sm text-slate-400 animate-pulse bg-[#171D2B]/50 rounded-2xl border border-[#232D42]">
            Analyzing live market ticks, order flow, and momentum decay...
          </div>
        ) : evaluation ? (
          <div className="space-y-4">
            
            {/* Master State & Action Card */}
            <div
              className={`p-5 rounded-2xl border ${
                evaluation.state === 'STILL_BULLISH'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : evaluation.state === 'STALLING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Current Trade Health & State
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/50 border border-current">
                  {evaluation.state_display}
                </span>
              </div>

              {/* Real-time Live P&L Snapshot */}
              <div className="flex items-baseline gap-3 my-2">
                <span className="text-2xl font-black text-white">
                  ₹{currentDisplayPrice.toFixed(2)}
                </span>
                <span
                  className={`text-base font-extrabold ${
                    isProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isProfit ? '+' : ''}₹{livePnl.toFixed(2)} ({isProfit ? '+' : ''}{livePnlPct.toFixed(2)}%)
                </span>
                <span className="text-xs text-slate-400">
                  ({evaluation.elapsed_minutes}m elapsed since entry @ ₹{entryPrice.toFixed(2)})
                </span>
              </div>

              {/* Explicit Action Required Banner */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2.5 bg-black/30 p-3 rounded-xl">
                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isProfit ? 'text-emerald-400' : 'text-amber-400'}`} />
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-white/70">What You Should Do Right Now:</div>
                  <p className="text-sm text-white font-bold leading-relaxed mt-0.5">
                    {evaluation.action_guidance}
                  </p>
                </div>
              </div>
            </div>

            {/* Exact Exit Timing & Clock Recommendations */}
            <div className="bg-[#161C2A] border border-[#232D42] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-emerald-400" />
                  <span>Exact Time to Exit</span>
                </span>
                {evaluation.countdown_seconds && (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 animate-bounce">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      URGENT EXIT: {Math.floor((countdown || 0) / 60)}:
                      {String((countdown || 0) % 60).padStart(2, '0')} mins remaining
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#111622] rounded-xl p-3 border border-[#20283A]">
                  <div className="text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Exit Clock Time:</span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    {evaluation.recommended_exit_clock_time}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    (~{evaluation.remaining_expected_minutes} mins remaining in move)
                  </div>
                </div>

                <div className="bg-[#111622] rounded-xl p-3 border border-[#20283A]">
                  <div className="text-slate-400 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recommended Trailing Stop:</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    ₹{evaluation.recommended_trailing_stop.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Lock in profits if price dips below this level
                  </div>
                </div>
              </div>

              {/* Rationale & Order Flow Context */}
              <div className="p-3 bg-[#111622] rounded-xl border border-[#20283A] text-xs text-slate-300">
                <span className="font-bold text-slate-400">Market Rationale: </span>
                {evaluation.reason}
              </div>

              {/* Current Probability Spectrum */}
              <div className="pt-2 border-t border-[#232D42]/60">
                <div className="text-[11px] font-bold text-slate-400 mb-2">Live Probability Shift:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="bg-emerald-500/10 text-emerald-400 py-1.5 rounded-lg border border-emerald-500/20">
                    UP: {Math.round(evaluation.current_probability.UP * 100)}%
                  </div>
                  <div className="bg-amber-500/10 text-amber-300 py-1.5 rounded-lg border border-amber-500/20">
                    SIDEWAYS: {Math.round(evaluation.current_probability.SIDEWAYS * 100)}%
                  </div>
                  <div className="bg-rose-500/10 text-rose-400 py-1.5 rounded-lg border border-rose-500/20">
                    DOWN: {Math.round(evaluation.current_probability.DOWN * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveToBackend}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>Pin & Track My Trade</span>
              </button>
              <button
                onClick={runEvaluation}
                className="px-4 bg-[#1B2232] hover:bg-[#232D42] border border-[#2D3A54] text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Existing Active Tracked Trades List */}
        {activeTrades.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#20283A]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Your Active Tracked Trades ({activeTrades.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeTrades.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#171D2B] border border-[#232D42] rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white text-sm mr-2">{t.symbol}</span>
                    <span className="text-slate-400">
                      Bought at ₹{t.entry_price} @ {t.entry_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.current_price && (
                      <span
                        className={`font-bold ${
                          (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(t.pnl || 0) >= 0 ? '+' : ''}₹{t.pnl?.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => handleCloseTrade(t.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Close Trade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
