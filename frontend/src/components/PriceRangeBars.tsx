import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceRangeBarsProps {
  currentPrice: number;
  dayLow: number;
  dayHigh: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
}

export const PriceRangeBars: React.FC<PriceRangeBarsProps> = ({
  currentPrice,
  dayLow,
  dayHigh,
  fiftyTwoWeekLow,
  fiftyTwoWeekHigh
}) => {
  // Ensure valid values
  const validDayLow = dayLow > 0 ? dayLow : currentPrice * 0.985;
  const validDayHigh = dayHigh > 0 ? dayHigh : currentPrice * 1.015;
  const valid52Low = fiftyTwoWeekLow && fiftyTwoWeekLow > 0 ? fiftyTwoWeekLow : validDayLow * 0.75;
  const valid52High = fiftyTwoWeekHigh && fiftyTwoWeekHigh > 0 ? fiftyTwoWeekHigh : validDayHigh * 1.25;

  // Day Range calculation (0% to 100%)
  const daySpan = Math.max(0.01, validDayHigh - validDayLow);
  const dayPct = Math.min(100, Math.max(0, ((currentPrice - validDayLow) / daySpan) * 100));

  // 52-Week Range calculation (0% to 100%)
  const w52Span = Math.max(0.01, valid52High - valid52Low);
  const w52Pct = Math.min(100, Math.max(0, ((currentPrice - valid52Low) / w52Span) * 100));

  // Distance metrics
  const below52HighPct = Math.max(0, ((valid52High - currentPrice) / valid52High) * 100);
  const above52LowPct = Math.max(0, ((currentPrice - valid52Low) / valid52Low) * 100);

  return (
    <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 shadow-lg space-y-5">
      {/* Title & Live Status */}
      <div className="flex items-center justify-between border-b border-[#1C2436] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Performance & Price Ranges
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Market Position
        </span>
      </div>

      {/* Row 1: Today's Low & High (Matching Groww Screenshot) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Today's low</span>
            <span className="text-sm font-black text-white font-mono">
              ₹{validDayLow.toFixed(2)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              ₹{currentPrice.toFixed(2)} Current
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Today's high</span>
            <span className="text-sm font-black text-white font-mono">
              ₹{validDayHigh.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Horizontal Slider Bar */}
        <div className="relative pt-1 pb-3">
          {/* Background track */}
          <div className="h-1.5 w-full bg-[#1C2538] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 w-full rounded-full" />
          </div>

          {/* Upward triangle pointer marker */}
          <div
            className="absolute top-2 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${dayPct}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-emerald-400" />
            <span className="text-[9px] font-black text-slate-300 mt-0.5 font-mono">
              {dayPct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 52 Week Low & High (Matching Groww Screenshot) */}
      <div className="space-y-2 pt-2 border-t border-[#182030]">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">52 week low</span>
            <span className="text-sm font-black text-white font-mono">
              ₹{valid52Low.toFixed(2)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              {below52HighPct <= 5 ? (
                <span className="text-amber-400 font-bold">Near 52W High!</span>
              ) : (
                <span>{below52HighPct.toFixed(1)}% off 52W High</span>
              )}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">52 week high</span>
            <span className="text-sm font-black text-white font-mono">
              ₹{valid52High.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Horizontal Slider Bar */}
        <div className="relative pt-1 pb-3">
          {/* Background track */}
          <div className="h-1.5 w-full bg-[#1C2538] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 w-full rounded-full" />
          </div>

          {/* Upward triangle pointer marker */}
          <div
            className="absolute top-2 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${w52Pct}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-emerald-400" />
            <span className="text-[9px] font-black text-slate-300 mt-0.5 font-mono">
              {w52Pct.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="text-emerald-400 font-medium">
            +{above52LowPct.toFixed(1)}% from 52W Low
          </span>
          <span className="text-slate-400">
            52W Range: ₹{(valid52High - valid52Low).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
