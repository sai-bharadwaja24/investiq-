import React from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  Target,
  Sparkles,
  Compass,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react';
import { StockQuote, SeniorAnalystVerdict, Candle } from '../types';

interface SituationalActionDeskProps {
  quote: StockQuote;
  candles: Candle[];
  verdict: SeniorAnalystVerdict | null;
  onSelectTradeAction?: (side: 'BUY' | 'SELL', target?: number, stop?: number) => void;
}

export const SituationalActionDesk: React.FC<SituationalActionDeskProps> = ({
  quote,
  candles,
  verdict,
  onSelectTradeAction,
}) => {
  const currentPrice = quote.price;
  const dayHigh = quote.high > 0 ? quote.high : currentPrice * 1.01;
  const dayLow = quote.low > 0 ? quote.low : currentPrice * 0.99;
  const dayRange = Math.max(0.05, dayHigh - dayLow);
  
  // 1. Location Principle (Video 7 - Scarface Trades)
  const locationPct = Math.min(100, Math.max(0, Math.round(((currentPrice - dayLow) / dayRange) * 100)));
  const isDiscountZone = locationPct <= 30;
  const isPremiumZone = locationPct >= 70;
  const isMiddleChopZone = locationPct > 30 && locationPct < 70;

  // 2. VSA Insights (Video 10 - TradingLab)
  const smartInsights = verdict?.smart_money_insights;
  const isAbsorptionWall = smartInsights?.is_absorption_wall || false;
  const vsaStatus = smartInsights?.vsa_status || 'NORMAL';

  // 3. FVG 50% Consequent Encroachment (Videos 6 & 8 - Keepssy & Craig Percoco)
  const fvgCE = smartInsights?.fvg_consequent_encroachment || null;
  const fvgType = smartInsights?.fvg_type || 'NONE';

  // 4. Order Block Delta (Videos 2 & 3 - AlgoTrade Pro & Smart Risk)
  const orderBlock = smartInsights?.order_block;
  const obDeltaPct = orderBlock?.volume_delta_pct || 65;
  const obPOC = orderBlock?.poc || currentPrice;

  // 5. Heikin Ashi Flow (Video 9 - TradingLab)
  const haTrend = smartInsights?.heikin_ashi_trend || 'NEUTRAL';
  const isHaBullThrust = haTrend === 'STRONG_BULL_FLAT_BOTTOMS';
  const isHaBearThrust = haTrend === 'STRONG_BEAR_FLAT_TOPS';

  // 6. 5-Check Breakout (Video 0 - The Trading Foundry)
  const checksPassed = smartInsights?.breakout_checks_passed || 1;

  // Key Decision Logic at this exact moment
  type MomentDirective = {
    actionBadge: string;
    actionType: 'BUY' | 'SELL' | 'WAIT';
    headline: string;
    description: string;
    recommendedSide: 'BUY' | 'SELL';
    entryPrice: number;
    targetPrice: number;
    stopLoss: number;
    rrRatio: string;
    ruleSource: string;
  };

  const buyTarget = verdict?.target_price || Number((currentPrice * 1.025).toFixed(2));
  const buyStop = verdict?.stop_loss || Number((currentPrice * 0.988).toFixed(2));
  const sellTarget = Number((currentPrice * 0.975).toFixed(2));
  const sellStop = Number((currentPrice * 1.012).toFixed(2));

  let directive: MomentDirective;

  if (isMiddleChopZone && !isAbsorptionWall) {
    directive = {
      actionBadge: '🟡 MOMENT VERDICT: WAIT / STAND ASIDE (MIDDLE CHOP ZONE)',
      actionType: 'WAIT',
      headline: `Price is at ${locationPct}% inside the Middle 40% Range — Zero Institutional Edge`,
      description: `According to Video 7 (The Location Principle), entering trades between 30% and 70% of today's range (₹${dayLow.toFixed(2)} - ₹${dayHigh.toFixed(2)}) produces a 50/50 chop trap with negative risk-to-reward. Algorithms harvest stops here. Wait for price to reach the outer boundaries.`,
      recommendedSide: 'BUY',
      entryPrice: fvgCE || dayLow,
      targetPrice: buyTarget,
      stopLoss: buyStop,
      rrRatio: '1 : 1.2 (Unfavorable in chop)',
      ruleSource: 'Video 7: The Location Principle ("No-Middle-Zone" Rule)',
    };
  } else if (isAbsorptionWall) {
    directive = {
      actionBadge: '🔴 MOMENT VERDICT: SELL / SHORT REVERSAL (INSTITUTIONAL ABSORPTION)',
      actionType: 'SELL',
      headline: `Institutional Iceberg Wall at Session High (₹${dayHigh.toFixed(2)}) — Smart Money Selling`,
      description: `Video 10 (Volume Spread Analysis) detected heavy volume absorption with narrow candle bodies near the session high. Smart money is quietly filling sell orders into retail breakout buying. Do not chase long. Consider taking profits or shorting for mean-reversion.`,
      recommendedSide: 'SELL',
      entryPrice: currentPrice,
      targetPrice: sellTarget,
      stopLoss: Math.max(dayHigh + 0.5, sellStop),
      rrRatio: '1 : 2.5',
      ruleSource: 'Video 10: VSA Iceberg Absorption & Institutional Traps',
    };
  } else if (isDiscountZone || isHaBullThrust || verdict?.verdict === 'STRONG_BUY') {
    directive = {
      actionBadge: '🟢 MOMENT VERDICT: HIGH-CONVICTION BUY SETUP (DISCOUNT & DEMAND FLOW)',
      actionType: 'BUY',
      headline: `Institutional Long Edge: ${isDiscountZone ? 'Discount Zone' : 'Bullish Demand'} + ${isHaBullThrust ? 'Heikin Ashi Flat Bottoms' : 'Order Block Backing'}`,
      description: `Price offers favorable asymmetric risk-to-reward. Retesting the 50% Consequent Encroachment (C.E.) at ₹${(fvgCE || currentPrice).toFixed(2)} with ${obDeltaPct}% dominant volume delta. Enter long with protective stop below invalidation.`,
      recommendedSide: 'BUY',
      entryPrice: fvgCE || currentPrice,
      targetPrice: buyTarget,
      stopLoss: buyStop,
      rrRatio: verdict?.risk_reward_ratio ? `1 : ${verdict.risk_reward_ratio}` : '1 : 2.4',
      ruleSource: 'Videos 6 & 8: ICT Fair Value Gap 50% C.E. + FluxCharts Order Blocks',
    };
  } else {
    directive = {
      actionBadge: '🔴 MOMENT VERDICT: SELL / SHORT OPPORTUNITY (DOWNWARD MOMENTUM)',
      actionType: 'SELL',
      headline: `Supply Dominance: Heikin Ashi Flat Tops with Resistance Overhead`,
      description: `Sellers are in full control with bearish momentum pressing toward lower support. Maintain short bias or stay in cash until an institutional reversal candle prints at support.`,
      recommendedSide: 'SELL',
      entryPrice: currentPrice,
      targetPrice: sellTarget,
      stopLoss: sellStop,
      rrRatio: '1 : 2.2',
      ruleSource: 'Video 9: Heikin Ashi Trend-Smoothing & Video 4: PDH Sweep Reversal',
    };
  }

  return (
    <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Ambient Radial Highlight */}
      <div
        className={`absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl pointer-events-none ${
          directive.actionType === 'BUY'
            ? 'bg-emerald-500/15'
            : directive.actionType === 'SELL'
            ? 'bg-rose-500/15'
            : 'bg-amber-500/15'
        }`}
      />

      {/* Header Banner: Real-Time Moment Directive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2436] pb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`p-2 rounded-xl border ${
              directive.actionType === 'BUY'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : directive.actionType === 'SELL'
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            <Zap className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-slate-400">
                REAL-TIME SITUATIONAL DESK
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                11-Strategy Consensus
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              {directive.actionBadge}
            </h2>
          </div>
        </div>

        {/* Live Clock / Freshest Tick Status */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-[#141A26] px-3 py-1.5 rounded-xl border border-[#20293C] self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>At this moment: ₹{currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Directive Explanation Banner */}
      <div
        className={`p-4 rounded-xl border ${
          directive.actionType === 'BUY'
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : directive.actionType === 'SELL'
            ? 'bg-rose-950/20 border-rose-500/30'
            : 'bg-amber-950/20 border-amber-500/30'
        } space-y-2`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              {directive.actionType === 'BUY' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : directive.actionType === 'SELL' ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              {directive.headline}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {directive.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">
            Governing Rule: <strong className="text-white">{directive.ruleSource}</strong>
          </span>
          <span className="font-mono">
            R:R Ratio: <strong className="text-emerald-400">{directive.rrRatio}</strong>
          </span>
        </div>
      </div>

      {/* Instant 1-Click Action Buttons for BUY & SELL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onSelectTradeAction?.('BUY', buyTarget, buyStop)}
          className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-slate-950" />
          <span>
            ⚡ Set Up BUY Order (Target ₹{buyTarget.toFixed(2)} | SL ₹{buyStop.toFixed(2)})
          </span>
        </button>

        <button
          onClick={() => onSelectTradeAction?.('SELL', sellTarget, sellStop)}
          className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <TrendingDown className="w-4 h-4 text-white" />
          <span>
            ⚡ Set Up SELL / SHORT Order (Target ₹{sellTarget.toFixed(2)} | SL ₹{sellStop.toFixed(2)})
          </span>
        </button>
      </div>

      {/* The 6 YouTube Masterclass Situational Analysis Cards */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Live Technical Checklist (Trained from YouTube Strategies)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1: Location Principle */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                1. Location Principle
              </span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  isMiddleChopZone
                    ? 'bg-amber-500/20 text-amber-300'
                    : isDiscountZone
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {locationPct}% of Range
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {isMiddleChopZone
                ? '⚠️ Trapped in Middle 40% Chop. 0 edge.'
                : isDiscountZone
                ? '🟢 Bottom 30% Discount Zone (Prime Buy).'
                : '🔴 Top 30% Premium Zone (Watch for Reversal).'}
            </p>
          </div>

          {/* Card 2: FVG Consequent Encroachment */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                2. ICT 50% FVG C.E.
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                ₹{fvgCE ? fvgCE.toFixed(2) : currentPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {fvgCE
                ? `Midpoint entry level at ₹${fvgCE.toFixed(2)}. Body close invalidates.`
                : 'No unmitigated fair value gaps immediately above/below.'}
            </p>
          </div>

          {/* Card 3: Order Block Delta */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                3. Order Block & Delta
              </span>
              <span className="text-[10px] font-bold text-cyan-300">
                {obDeltaPct}% Dominance
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              POC shelf at ₹{obPOC.toFixed(2)}. Institutional volume is{' '}
              {obDeltaPct >= 60 ? '≥60% confirmed' : 'light/mixed'}.
            </p>
          </div>

          {/* Card 4: VSA Iceberg Wall */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                4. VSA Iceberg Absorption
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isAbsorptionWall
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {isAbsorptionWall ? 'WALL DETECTED' : 'CLEAR'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {isAbsorptionWall
                ? '⚠️ Institutions absorbing buys at day high. Reversal risk!'
                : 'Normal volume-spread equilibrium. No hidden walls.'}
            </p>
          </div>

          {/* Card 5: Heikin Ashi Flow */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                5. Heikin Ashi Flow
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isHaBullThrust
                    ? 'text-emerald-400'
                    : isHaBearThrust
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {isHaBullThrust ? 'FLAT BOTTOMS' : isHaBearThrust ? 'FLAT TOPS' : 'CONSOLIDATING'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {isHaBullThrust
                ? 'Zero lower wicks: Strong institutional buying thrust.'
                : isHaBearThrust
                ? 'Zero upper wicks: Persistent institutional selling.'
                : 'Mixed candle wicks: Momentum transitioning.'}
            </p>
          </div>

          {/* Card 6: 5-Check Breakout */}
          <div className="bg-[#121724] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                6. 5-Check Retest
              </span>
              <span className="text-[10px] font-bold text-emerald-300">
                {checksPassed}/5 Passed
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {checksPassed >= 4
                ? '✅ Valid breakout confirmed with 2-candle acceptance.'
                : '⚠️ Incomplete confirmation. Retest hold still required.'}
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Personal Trading Mentor Guidance Box */}
      <div className="p-3.5 rounded-xl bg-[#141A26] border border-[#20293C] text-xs text-slate-300 space-y-1.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Professional Trader Execution Playbook Right Now:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
          <li>
            <strong className="text-white">Rule 1 (Never move stops backwards):</strong> Always honour your pre-set stop loss at ₹{directive.stopLoss.toFixed(2)}. Never widen it hoping for a bounce.
          </li>
          <li>
            <strong className="text-white">Rule 2 (Take partial profits):</strong> When price moves 1.5R toward ₹{directive.targetPrice.toFixed(2)}, book 70% profit and trail your stop to breakeven entry (₹{directive.entryPrice.toFixed(2)}).
          </li>
          <li>
            <strong className="text-white">Rule 3 (Respect the Middle Zone):</strong> If price is stuck between 30% and 70% of today's range, do not enter at market price. Set a limit order at the edge instead!
          </li>
        </ul>
      </div>
    </div>
  );
};
