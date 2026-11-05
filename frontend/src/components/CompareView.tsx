import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, TrendingUp, Award, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

interface CompareViewProps {
  onSelectStock: (symbol: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ onSelectStock }) => {
  const [symbols, setSymbols] = useState<string[]>(['TCS', 'INFY', 'RELIANCE']);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchComparison = async (symList: string[]) => {
    setLoading(true);
    try {
      const res = await api.compareStocks(symList);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(symbols);
  }, []);

  const handleToggleSymbol = (s: string) => {
    let next: string[];
    if (symbols.includes(s)) {
      if (symbols.length <= 2) return; // keep at least 2
      next = symbols.filter((x) => x !== s);
    } else {
      if (symbols.length >= 5) return;
      next = [...symbols, s];
    }
    setSymbols(next);
    fetchComparison(next);
  };

  const popularOptions = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'TATAMOTORS', 'ITC'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Compare Stocks Side-by-Side</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Analyze fundamental quality, financial health, and valuation across 2–5 stocks.
            </p>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Select:</span>
            {popularOptions.map((s) => {
              const active = symbols.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => handleToggleSymbol(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#171D2B] border border-[#232D42] text-slate-400 hover:text-white'
                  }`}
                >
                  {s} {active ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      {loading ? (
        <div className="p-16 text-center text-sm text-slate-400 bg-[#121622] rounded-2xl border border-[#20283A] animate-pulse">
          Computing multi-stock fundamental metrics...
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#20283A] text-slate-400">
                  <th className="pb-4 font-bold uppercase tracking-wider">Metrics</th>
                  {data.stocks.map((stk: any) => (
                    <th key={stk.symbol} className="pb-4 font-bold text-white text-sm">
                      <div className="cursor-pointer hover:text-emerald-400" onClick={() => onSelectStock(stk.symbol)}>
                        {stk.symbol}
                        <div className="text-[11px] font-normal text-slate-400">{stk.name}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2536] text-slate-300">
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Current Share Price</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-bold text-white text-sm">
                      ₹{stk.price.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Overall Score</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3">
                      <span className="text-sm font-black text-emerald-400">
                        {stk.overall_score}/100
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Long-Term Verdict</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-bold text-xs text-white">
                      {stk.verdict}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Return on Equity (ROE)</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-semibold text-emerald-400">
                      {stk.roe}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">P/E Ratio (Valuation)</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-semibold text-amber-300">
                      {stk.pe_ratio}x
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Debt-to-Equity</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-semibold">
                      {stk.debt_to_equity}x
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Operating Margin</td>
                  {data.stocks.map((stk: any) => (
                    <td key={stk.symbol} className="py-3 font-semibold">
                      {stk.operating_margin}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Beginner Takeaway */}
          <div className="bg-[#161C2A] border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Beginner Comparison Takeaway</h3>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {data.beginner_takeaway}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
