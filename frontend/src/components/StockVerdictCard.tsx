import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Newspaper
} from 'lucide-react';
import { FundamentalAnalysis, IntradayPrediction, StockQuote, StockNewsItem } from '../types';

interface StockVerdictCardProps {
  quote: StockQuote;
  fundamentals?: FundamentalAnalysis;
  prediction?: IntradayPrediction;
  news?: StockNewsItem[];
  isBeginnerMode: boolean;
  onTrackTrade: () => void;
  onViewNews?: () => void;
}

export const StockVerdictCard: React.FC<StockVerdictCardProps> = ({
  quote,
  fundamentals,
  prediction,
  news,
  isBeginnerMode,
  onTrackTrade,
  onViewNews,
}) => {
  return (
    <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Stock Identity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#20283A]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">{quote.symbol}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {quote.ticker}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{quote.name}</p>
        </div>

        <div className="flex items-baseline gap-3 text-right">
          <div>
            <div className="text-2xl font-black text-white">
              ₹{quote.price.toFixed(2)}
            </div>
            <div
              className={`text-xs font-bold flex items-center justify-end gap-1 ${
                quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {quote.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {quote.change >= 0 ? '+' : ''}
                {quote.change.toFixed(2)} ({quote.change >= 0 ? '+' : ''}
                {quote.change_percent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Live Quote</span>
        </div>
      </div>

      {/* The Master Decision Grid: Long-Term vs Intraday */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 1. LONG-TERM INVESTING VERDICT */}
        <div className="bg-[#161C2A] border border-[#232D42] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>1. Long-Term Investing</span>
              </span>
              {fundamentals && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">Quality Score:</span>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      fundamentals.overall_score >= 75
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : fundamentals.overall_score >= 55
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {fundamentals.overall_score}/100
                  </span>
                </div>
              )}
            </div>

            {/* Verdict Banner */}
            {fundamentals ? (
              <div
                className={`p-3.5 rounded-xl border mb-4 ${
                  fundamentals.verdict_badge === 'green'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : fundamentals.verdict_badge === 'yellow'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Should You Buy Long-Term?
                </div>
                <div className="text-lg font-black tracking-tight mt-0.5">
                  {fundamentals.verdict}
                </div>
                <p className="text-xs mt-1.5 text-slate-300 leading-relaxed">
                  {fundamentals.beginner_takeaway}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/40 rounded-xl animate-pulse text-xs text-slate-400">
                Evaluating fundamental health and balance sheet metrics...
              </div>
            )}

            {/* Positive vs Warning Factors */}
            {fundamentals && (
              <div className="space-y-2 mt-3">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Key Factors:</div>
                <div className="space-y-1.5">
                  {fundamentals.positive_factors.slice(0, 2).map((pf, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pf}</span>
                    </div>
                  ))}
                  {fundamentals.warning_factors.slice(0, 1).map((wf, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{wf}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. INTRADAY TIMING & DIRECTION VERDICT */}
        <div className="bg-[#161C2A] border border-[#232D42] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>2. Intraday Direction & Timing</span>
              </span>
              {prediction && (
                <span className="text-xs font-semibold text-slate-400">
                  Horizon: <strong className="text-white">{prediction.horizon_minutes}m</strong>
                </span>
              )}
            </div>

            {/* Prediction Banner */}
            {prediction ? (
              <div
                className={`p-3.5 rounded-xl border mb-4 ${
                  prediction.direction === 'UP'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : prediction.direction === 'DOWN'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Intraday Directional Signal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700 text-white">
                    Confidence: {prediction.confidence}
                  </span>
                </div>

                {prediction.is_market_open === false && (
                  <div className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 rounded-lg my-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {prediction.market_status_text || "Market is currently CLOSED (09:15 AM – 03:30 PM IST). Showing last closing session analysis."}
                    </span>
                  </div>
                )}

                {prediction.session_guard_active && (
                  <div className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 rounded-lg my-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Session Guard Active: Entry signals disabled in the final 30 min of trading (after 03:00 PM IST).</span>
                  </div>
                )}

                {prediction.historical_veto_applied && (
                  <div className="text-[11px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 rounded-lg my-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Historical Veto Applied: Historical win rate below threshold (&lt;50%). Signal downgraded to NO CLEAR EDGE.</span>
                  </div>
                )}

                <div className="text-lg font-black tracking-tight mt-0.5">
                  {prediction.direction_display}
                </div>

                {/* Indicator Scoring & Signal Strength (Unvalidated) */}
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                    <span>Indicator Bias Weights (Experimental)</span>
                    <span className="text-emerald-400 font-mono">
                      Strength: {prediction.signal_strength_score ?? Math.round(prediction.probabilities.UP * 100)}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-500/10 rounded-lg py-1">
                      <div className="text-[10px] text-slate-400 font-semibold">BUY BIAS</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {Math.round(prediction.probabilities.UP * 100)}
                      </div>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg py-1">
                      <div className="text-[10px] text-slate-400 font-semibold">NEUTRAL</div>
                      <div className="text-sm font-bold text-amber-300">
                        {Math.round(prediction.probabilities.SIDEWAYS * 100)}
                      </div>
                    </div>
                    <div className="bg-rose-500/10 rounded-lg py-1">
                      <div className="text-[10px] text-slate-400 font-semibold">SELL BIAS</div>
                      <div className="text-sm font-bold text-rose-400">
                        {Math.round(prediction.probabilities.DOWN * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/40 rounded-xl animate-pulse text-xs text-slate-400">
                Calculating multi-timeframe indicators and signal strength...
              </div>
            )}

            {/* Target, Stop-Loss & Exact Time */}
            {prediction && (
              <div className="bg-[#121620] rounded-xl p-3 border border-[#20293B] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expected Duration:</span>
                  </span>
                  <span className="font-bold text-white">
                    ~{prediction.expected_duration_minutes} mins (Target by {prediction.target_clock_time})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Projected Target:</span>
                  </span>
                  <span className="font-bold text-emerald-400">₹{prediction.projected_target_price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Invalidation Stop:</span>
                  </span>
                  <span className="font-bold text-rose-400">₹{prediction.invalidation_stop_loss.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Call to action: Track Trade */}
          <div className="mt-4 pt-3 border-t border-[#232D42]/80">
            <button
              onClick={onTrackTrade}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Track My Trade in Real Time (I Bought This Stock)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breaking News Catalyst Preview Bar */}
      {news && news.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#20283A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161C2A]/60 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              Breaking Catalyst
            </span>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 border ${
                news[0].sentiment === 'BULLISH'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : news[0].sentiment === 'BEARISH'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {news[0].impact_badge}
            </span>
            <span className="text-xs text-slate-300 truncate font-medium">
              {news[0].title}
            </span>
          </div>
          {onViewNews && (
            <button
              onClick={onViewNews}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>See Impact & Explanations ({news.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
