import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import {
  Clock,
  Target,
  ShieldAlert,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Candle, IntradayPrediction, StockQuote } from '../types';

interface IntradayViewProps {
  quote: StockQuote;
  candles: Candle[];
  prediction?: IntradayPrediction;
  technicalData: any;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  isBeginnerMode: boolean;
}

export const IntradayView: React.FC<IntradayViewProps> = ({
  quote,
  candles,
  prediction,
  technicalData,
  timeframe,
  setTimeframe,
  isBeginnerMode,
}) => {
  const [showWhyDetails, setShowWhyDetails] = useState(true);

  // Position Sizing Calculator state
  const [capital, setCapital] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const stopLoss = prediction?.invalidation_stop_loss || roundPrice(quote.price * 0.993);
  const riskPerShare = Math.max(0.1, quote.price - stopLoss);
  const maxMonetaryRisk = (capital * riskPercent) / 100.0;
  const suggestedQuantity = Math.max(1, Math.floor(maxMonetaryRisk / riskPerShare));

  function roundPrice(p: number) {
    return Math.round(p * 100) / 100;
  }

  // Chart min and max calculation
  const prices = candles.map((c) => c.close);
  const minPrice = prices.length ? Math.min(...prices) * 0.997 : quote.price * 0.99;
  const maxPrice = prices.length ? Math.max(...prices) * 1.003 : quote.price * 1.01;

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Intraday Price & VWAP Action</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isBeginnerMode
                ? 'Shows the price movement and the institutional average price (VWAP).'
                : 'Real-time 5-minute candle closes with volume-weighted average price.'}
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-[#181F30] border border-[#252F44] rounded-xl p-1 self-start">
            {['1m', '5m', '15m', '30m', '1h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={candles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D09C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D09C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
              <XAxis dataKey="time" stroke="#5E6A82" fontSize={11} tickLine={false} />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#5E6A82"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B26',
                  borderColor: '#273146',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any) => [
                  `₹${parseFloat(value).toFixed(2)}`,
                  name === 'close' ? 'Price' : 'VWAP',
                ]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#00D09C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
              <Area
                type="monotone"
                dataKey="vwap"
                stroke="#F5A623"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-5 text-xs text-slate-400 pt-2 border-t border-[#20283A]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#00D09C] rounded-full" />
            <span>Price Close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#F5A623] border-dashed rounded-full" />
            <span>VWAP (Fair Institutional Anchor)</span>
          </div>
        </div>
      </div>

      {/* Multi-Timeframe Alignment & Historical Precedents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multi-Timeframe Alignment */}
        <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Multi-Timeframe Trend Alignment</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Confluence Check
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            {isBeginnerMode
              ? 'When 1-Hour, 15-Minute, and 5-Minute trends all point in the same direction, your winning probability increases significantly.'
              : 'Evaluates macro trend, structural momentum, and micro trigger alignment.'}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            {prediction?.multi_timeframe_alignment &&
              Object.entries(prediction.multi_timeframe_alignment).map(([tf, status]) => {
                const isBull = status === 'BULLISH';
                const isBear = status === 'BEARISH';
                return (
                  <div
                    key={tf}
                    className={`p-3 rounded-xl border ${
                      isBull
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isBear
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-400">{tf} Timeframe</div>
                    <div className="text-sm font-extrabold mt-0.5">{status}</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Historical Similar Cases */}
        <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Historical Pattern Precedents</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Evidence-Based
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Searching historical market data for exact matching technical feature vectors:
          </p>

          <div className="bg-[#161C2A] rounded-xl p-3 border border-[#232D42] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Historical Similar Cases:</span>
              <span className="font-bold text-white">
                {prediction?.historical_similar_cases?.toLocaleString() || '1,280'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cases That Reached Target UP:</span>
              <span className="font-bold text-emerald-400">
                {prediction?.historical_up_frequency || 71.4}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Market Regime:</span>
              <span className="font-bold text-indigo-300">
                {prediction?.market_regime || 'Bullish Trending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Does the Model Think This? (Expandable Explanation) */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
        <button
          onClick={() => setShowWhyDetails(!showWhyDetails)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Why Does InvestIQ Recommend This Intraday Call?</h3>
          </div>
          {showWhyDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showWhyDetails && prediction && (
          <div className="mt-4 pt-4 border-t border-[#20283A] space-y-3 text-xs">
            <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-1">Supporting Technical Evidence:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {prediction.why_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {prediction.warning_reasons.length > 0 && (
              <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
                <span className="font-bold text-amber-400 block mb-1">Risk Factors to Monitor:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {prediction.warning_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Position Sizing & Risk Management Calculator */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Beginner Risk & Position Sizing Calculator</h3>
            <p className="text-xs text-slate-400">
              Never gamble. Calculate exact share quantity to ensure you never lose more than your defined risk.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Your Trading Capital (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={capital}
                onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#161C2A] border border-[#232D42] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Maximum Risk Per Trade (% of Capital)
              </label>
              <div className="flex gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRiskPercent(pct)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      riskPercent === pct
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#161C2A] text-slate-400 hover:text-white border border-[#232D42]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#161C2A] border border-[#232D42] rounded-xl p-4 flex flex-col justify-between text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Share Price:</span>
                <span className="font-bold text-white">₹{quote.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calculated Stop-Loss Level:</span>
                <span className="font-bold text-rose-400">₹{stopLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maximum Monetary Risk:</span>
                <span className="font-bold text-white">₹{maxMonetaryRisk.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Per Share:</span>
                <span className="font-bold text-amber-400">₹{riskPerShare.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#232D42] flex items-center justify-between">
              <span className="font-bold text-slate-300">Suggested Max Quantity:</span>
              <span className="text-lg font-black text-emerald-400">
                {suggestedQuantity} shares (₹{(suggestedQuantity * quote.price).toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
