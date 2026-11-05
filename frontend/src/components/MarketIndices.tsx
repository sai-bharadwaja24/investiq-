import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketIndex } from '../types';

interface MarketIndicesProps {
  indices: MarketIndex[];
  onSelectIndex?: (symbol: string) => void;
}

export const MarketIndices: React.FC<MarketIndicesProps> = ({ indices, onSelectIndex }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {indices.map((idx) => {
        const isPositive = idx.change >= 0;
        
        // Calculate mini sparkline path
        const minVal = Math.min(...idx.sparkline);
        const maxVal = Math.max(...idx.sparkline);
        const range = maxVal - minVal || 1;
        const points = idx.sparkline
          .map((val, i) => {
            const x = (i / (idx.sparkline.length - 1)) * 100;
            const y = 35 - ((val - minVal) / range) * 30;
            return `${x},${y}`;
          })
          .join(' ');

        return (
          <div
            key={idx.symbol}
            onClick={() => onSelectIndex && onSelectIndex(idx.symbol)}
            className="bg-[#121622] hover:bg-[#161C2C] border border-[#20283A] hover:border-emerald-500/40 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                {idx.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {idx.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  ₹{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {idx.change.toFixed(2)} ({isPositive ? '+' : ''}
                    {idx.change_percent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="w-24 h-10">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                  <polyline
                    fill="none"
                    stroke={isPositive ? '#00D09C' : '#EB5B3C'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
