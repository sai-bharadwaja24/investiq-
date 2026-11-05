import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SeniorAnalystVerdict } from '../types';

interface SeniorAnalystVerdictCardProps {
  verdict?: SeniorAnalystVerdict | null;
  loading?: boolean;
  onTrackTrade: () => void;
}

export const SeniorAnalystVerdictCard: React.FC<SeniorAnalystVerdictCardProps> = ({
  verdict,
  loading = false,
  onTrackTrade,
}) => {
  if (loading || !verdict) {
    return (
      <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-[#1C2436] pb-3">
          <div className="h-5 bg-slate-800 rounded w-48" />
          <div className="h-5 bg-slate-800 rounded w-24" />
        </div>
        <div className="h-20 bg-slate-800/60 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="h-14 bg-slate-800/40 rounded-xl" />
          <div className="h-14 bg-slate-800/40 rounded-xl" />
          <div className="h-14 bg-slate-800/40 rounded-xl" />
          <div className="h-14 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  const isBuy = verdict.verdict === 'STRONG_BUY' || verdict.verdict === 'MILD_BUY';
  const isAvoid = verdict.verdict === 'AVOID_SELL';
  const isNeutral = verdict.verdict === 'WAIT_CONSOLIDATION';

  // Badge styles based on verdict
  const theme = isBuy
    ? {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20',
        icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
        progress: 'bg-emerald-500'
      }
    : isAvoid
    ? {
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-500/20',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        progress: 'bg-rose-500'
      }
    : {
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/20',
        icon: <Layers className="w-5 h-5 text-amber-400" />,
        progress: 'bg-amber-500'
      };

  return (
    <div className={`bg-[#0E131F] border ${theme.border} rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden transition-all`}>
      {/* Background Subtle Ambient Glow */}
      <div
        className={`absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isBuy ? 'bg-emerald-500/10' : isAvoid ? 'bg-rose-500/10' : 'bg-amber-500/10'
        }`}
      />

      {/* Header with Senior Analyst Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2436] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Award className="w-4 h-4 text-indigo-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                SENIOR MARKET ANALYST CONSENSUS
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Unified Brain
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Synthesizes Institutional Order Flow (VWAP), Momentum (RSI), & Candlestick Traps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono text-[11px]">{verdict.timestamp}</span>
        </div>
      </div>

      {/* Master Verdict Banner */}
      <div className={`rounded-xl p-4 border ${theme.border} ${theme.bg} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme.badgeBg} border ${theme.border} shrink-0`}>
              {theme.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Official Recommendation
              </span>
              <div className="text-base sm:text-lg font-black text-white tracking-tight">
                {verdict.verdict_display}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Analyst Conviction
            </span>
            <div className="flex items-center sm:justify-end gap-2">
              <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full ${theme.progress} transition-all duration-500`}
                  style={{ width: `${verdict.conviction_percent}%` }}
                />
              </div>
              <span className={`text-sm font-black font-mono ${theme.text}`}>
                {verdict.conviction_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Single Source of Truth Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="bg-[#121724]/80 p-2.5 rounded-lg border border-[#222C40]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Price</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              ₹{verdict.target_price.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-400/80 block font-medium">
              {isAvoid ? '-' : '+'}{Math.abs(verdict.expected_gain_percent).toFixed(1)}% expected
            </span>
          </div>

          <div className="bg-[#121724]/80 p-2.5 rounded-lg border border-[#222C40]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Stop-Loss (Protection)</span>
            <span className="text-sm font-black text-rose-400 font-mono">
              ₹{verdict.stop_loss.toFixed(2)}
            </span>
            <span className="text-[10px] text-rose-400/80 block font-medium">
              Auto-cut safety line
            </span>
          </div>

          <div className="bg-[#121724]/80 p-2.5 rounded-lg border border-[#222C40]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Risk : Reward</span>
            <span className="text-sm font-black text-amber-300 font-mono">
              1 : {verdict.risk_reward_ratio.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Favorable setup
            </span>
          </div>

          <div className="bg-[#121724]/80 p-2.5 rounded-lg border border-[#222C40]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Expected Horizon</span>
            <span className="text-sm font-black text-slate-200 font-mono">
              {verdict.time_horizon_text}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Intraday window
            </span>
          </div>
        </div>

        {/* Smart Money Institutional Framework Insights (From YouTube Strategies) */}
        {verdict.smart_money_insights && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Smart Money Engine:
            </span>

            {/* Breakout 5-Check Status */}
            {verdict.smart_money_insights.breakout_5check_status === 'CONFIRMED_2R_RETEST' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🎯 5-Check Retest Confirmed (2R+)
              </span>
            )}
            {verdict.smart_money_insights.breakout_5check_status === 'PENDING_RETEST' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⏳ Awaiting Retest Pullback
              </span>
            )}

            {/* VSA Absorption Alert */}
            {verdict.smart_money_insights.is_absorption_wall && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ⚠️ VSA Iceberg Absorption Wall
              </span>
            )}
            {verdict.smart_money_insights.vsa_status === 'HEALTHY_EXPANSION' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🚀 VSA Institutional Expansion
              </span>
            )}

            {/* Fair Value Gap 50% C.E. */}
            {verdict.smart_money_insights.fvg_consequent_encroachment && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                🧊 FVG 50% C.E. @ ₹{Number(verdict.smart_money_insights.fvg_consequent_encroachment).toFixed(2)}
              </span>
            )}

            {/* Order Block Volume Delta */}
            {verdict.smart_money_insights.order_block && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                🛡️ {verdict.smart_money_insights.order_block.volume_delta_pct}% Vol-Delta OB (POC ₹{Number(verdict.smart_money_insights.order_block.poc).toFixed(2)})
              </span>
            )}

            {/* Location Principle No-Middle-Zone */}
            {verdict.smart_money_insights.location_zone === 'MIDDLE_CHOP_ZONE' ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚠️ Middle Range (50/50 Chop)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                📍 Range Boundary Edge
              </span>
            )}

            {/* Heikin Ashi Flow */}
            {verdict.smart_money_insights.heikin_ashi_trend === 'STRONG_BULL_FLAT_BOTTOMS' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                📊 Heikin Ashi Flat-Bottom Thrust
              </span>
            )}
            {verdict.smart_money_insights.heikin_ashi_trend === 'STRONG_BEAR_FLAT_TOPS' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                📊 Heikin Ashi Flat-Top Selloff
              </span>
            )}
          </div>
        )}
      </div>

      {/* Senior Analyst Plain-English Market Psychology Breakdown */}
      <div className="bg-[#141A26] border border-[#20293C] rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Senior Analyst Institutional Knowledge Take</span>
        </div>
        <p className="text-slate-200 text-xs leading-relaxed font-medium">
          {verdict.senior_analyst_take}
        </p>
      </div>

      {/* Candlestick Context & Trap Warning (Reconciled with Trend) */}
      {verdict.candlestick_context && (
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
          verdict.candlestick_context.includes('Trap') || verdict.candlestick_context.includes('Counter-Trend')
            ? 'bg-rose-500/10 border-rose-500/25 text-rose-200'
            : isBuy
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
            : 'bg-[#141A26] border-[#222C40] text-slate-300'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-1.5">
            {verdict.candlestick_context.includes('Trap') ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>Candlestick Context Evaluation:</span>
          </div>
          <p className="pl-5 text-[11px] leading-relaxed">
            {verdict.candlestick_context}
          </p>
        </div>
      )}

      {/* Confluence Checklist (Visual Proof of Consensus) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Institutional Confluence Checklist:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {verdict.confluence_checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-[#121622] p-2.5 rounded-xl border border-[#1F2739] text-xs"
            >
              {item.status === 'positive' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : item.status === 'negative' ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block leading-tight">
                  {item.label}
                </span>
                <span className="text-slate-200 text-[11px] font-medium leading-snug">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Advice For Beginners */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-3.5 space-y-1.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Actionable Execution Rules:
        </span>
        <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line font-mono">
          {verdict.action_advice}
        </div>
      </div>

      {/* Track Trade CTA Button */}
      <button
        onClick={onTrackTrade}
        className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] cursor-pointer ${
          isBuy
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20'
            : isAvoid
            ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-rose-500/20'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span>Track This Trade Live (Log Entry & Monitor Alerts)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
