import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FundamentalAnalysis, StockQuote } from '../types';

interface InvestViewProps {
  quote: StockQuote;
  fundamentals?: FundamentalAnalysis;
  isBeginnerMode: boolean;
}

export const InvestView: React.FC<InvestViewProps> = ({
  quote,
  fundamentals,
  isBeginnerMode,
}) => {
  if (!fundamentals) {
    return (
      <div className="p-12 text-center text-sm text-slate-400 bg-[#121622] rounded-2xl border border-[#20283A] animate-pulse">
        Loading comprehensive fundamental analysis...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Scores Overview */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Fundamental Category Scores (0–100)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Every score is mathematically derived from financial statements and audited ratios.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(fundamentals.category_scores).map(([cat, score]) => {
            const isHigh = score >= 75;
            const isMid = score >= 55 && score < 75;
            return (
              <div
                key={cat}
                className="bg-[#161C2A] border border-[#232D42] rounded-xl p-4 flex flex-col justify-between"
              >
                <div className="text-xs font-semibold text-slate-400">{cat}</div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black ${
                      isHigh
                        ? 'text-emerald-400'
                        : isMid
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {score}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/100</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#1F283B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isHigh
                        ? 'bg-emerald-500'
                        : isMid
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Dive Metrics by Category */}
      {Object.entries(fundamentals.metrics).map(([catName, metricsList]) => (
        <div key={catName} className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-slate-300">
            {catName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricsList.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#161C2A] border border-[#232D42] rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">{m.name}</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        m.status === 'positive'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : m.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>

                  {/* Beginner explanation */}
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    {m.beginner_explanation}
                  </p>
                </div>

                {/* Why it matters */}
                <div className="mt-3 pt-3 border-t border-[#232D42]/60 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold">Why it matters: </span>
                  {m.why_it_matters}

                  {/* Advanced formula */}
                  {!isBeginnerMode && m.formula && (
                    <div className="mt-2 text-[10px] text-slate-400 font-mono bg-[#111520] p-1.5 rounded border border-[#1E2536]">
                      Formula: {m.formula}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
