import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CandlePatternMatch, CandlePatternAnalysisResponse } from '../types';

interface CandlestickPatternCardProps {
  analysis?: CandlePatternAnalysisResponse | null;
  currentPrice: number;
}

export const CandlestickPatternCard: React.FC<CandlestickPatternCardProps> = ({
  analysis,
  currentPrice
}) => {
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const active = analysis?.active_pattern;
  const isBullish = active?.sentiment === 'BULLISH';
  const isBearish = active?.sentiment === 'BEARISH';

  return (
    <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2436] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              CANDLESTICK PATTERN PREDICTOR
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Pattern Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live Japanese candlestick recognition with predicted price movement
            </p>
          </div>
        </div>

        {/* Cheat sheet toggle button */}
        <button
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#172030] text-indigo-300 hover:text-white border border-indigo-500/30 transition-all self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{showCheatsheet ? 'Hide Guide' : 'Beginner Guide'}</span>
          {showCheatsheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Pattern Cheatsheet for Beginners (Toggleable) */}
      {showCheatsheet && (
        <div className="bg-[#141A26] border border-indigo-500/30 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-bold border-b border-[#232D42] pb-2">
            <BookOpen className="w-4 h-4" />
            <span>Beginner Cheat Sheet: How to Read Japanese Candlesticks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0E131F] p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="font-black text-emerald-400 flex items-center gap-1">
                🔨 Hammer (Bullish Reversal)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Appears after a price drop. Has a small body at the top and a long lower tail ($2\times$ body).
                <strong> Meaning:</strong> Sellers tried to drop the price, but aggressive buyers rejected the low and pushed it back up! Buy signal.
              </p>
            </div>

            <div className="bg-[#0E131F] p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="font-black text-emerald-400 flex items-center gap-1">
                ⚡ Bullish Engulfing (Strong Buy)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                A large green candle that completely swallows the previous red candle's body.
                <strong> Meaning:</strong> Buyers completely overwhelmed previous sellers with heavy volume. Very reliable upward move.
              </p>
            </div>

            <div className="bg-[#0E131F] p-3 rounded-xl border border-rose-500/20 space-y-1">
              <span className="font-black text-rose-400 flex items-center gap-1">
                🌠 Shooting Star (Bearish Warning)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Appears at the peak of a rally. Small lower body and a long upper tail ($2\times$ body).
                <strong> Meaning:</strong> Buyers tried to breakout, but were slammed down by massive institutional selling. Caution!
              </p>
            </div>

            <div className="bg-[#0E131F] p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-black text-amber-400 flex items-center gap-1">
                ⚖️ Doji (+) (Indecision)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Open and close prices are virtually identical, forming a cross shape (+).
                <strong> Meaning:</strong> Perfect tie between buyers and sellers. Wait for the next candle to break out before trading.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Detected Pattern Display */}
      {active ? (
        <div className="space-y-3">
          {/* Top Pattern Badge & Reliability */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#141A26] p-3 rounded-xl border border-[#222C3E]">
            <div className="flex items-center gap-2">
              <span className="text-base">{active.pattern_name.split(' ')[0]}</span>
              <div>
                <span className="font-black text-white text-sm block">
                  {active.pattern_name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Identified at {active.candle_time} • {active.pattern_type}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Confidence</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {active.confidence_score}% Reliability
              </span>
            </div>
          </div>

          {/* Predicted Movement Banner */}
          <div
            className={`p-3.5 rounded-xl border ${
              isBullish
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : isBearish
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-black text-xs">
                {isBullish ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : isBearish ? (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span>PREDICTED MOVEMENT: {active.predicted_movement.replace('_', ' ')}</span>
              </div>
              <span className="text-xs font-mono font-black">
                {isBullish ? '+' : ''}{active.expected_gain_percent}% Potential
              </span>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-xs font-mono">
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Expected Target</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-white text-sm">₹{active.predicted_target.toFixed(2)}</span>
                  {currentPrice > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold">
                      (+{Math.abs(((active.predicted_target - currentPrice) / currentPrice) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Stop Loss</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-rose-300 text-sm">₹{active.invalidation_stop_loss.toFixed(2)}</span>
                  {currentPrice > 0 && (
                    <span className="text-[11px] text-rose-400 font-bold">
                      (-{Math.abs(((currentPrice - active.invalidation_stop_loss) / currentPrice) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plain English Detailed Explanation for Beginners */}
          <div className="bg-[#111723] p-4 rounded-xl border border-[#20293C] space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                What Happened (Beginner Explanation)
              </span>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                {active.what_happened_explanation}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1C2538]">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                What Beginners Should Do
              </span>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                {active.actionable_beginner_advice}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Consolidation Fallback */
        <div className="bg-[#111723] p-4 rounded-xl border border-[#20293C] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Consolidation & Price Discovery</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            No aggressive single-candle pattern triggered in the last 5 minutes. The stock is holding steady near{' '}
            <strong className="text-white font-mono">₹{currentPrice.toFixed(2)}</strong>. Watch for high-volume breakout candles near key resistance levels.
          </p>
        </div>
      )}
    </div>
  );
};
