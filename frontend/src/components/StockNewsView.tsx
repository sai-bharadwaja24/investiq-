import React, { useState } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Lightbulb,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { StockNewsItem } from '../types';

interface StockNewsViewProps {
  symbol: string;
  news: StockNewsItem[];
  loading?: boolean;
}

export const StockNewsView: React.FC<StockNewsViewProps> = ({
  symbol,
  news,
  loading = false,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');

  const bullishCount = news.filter((n) => n.sentiment === 'BULLISH').length;
  const bearishCount = news.filter((n) => n.sentiment === 'BEARISH').length;
  const neutralCount = news.filter((n) => n.sentiment === 'NEUTRAL').length;

  const filteredNews = news.filter((n) => {
    if (filter === 'BULLISH') return n.sentiment === 'BULLISH';
    if (filter === 'BEARISH') return n.sentiment === 'BEARISH';
    return true;
  });

  const netBias =
    bullishCount > bearishCount
      ? { text: '🟢 Bullish Catalyst Advantage (Upward Driver)', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
      : bearishCount > bullishCount
      ? { text: '🔴 Bearish Headwinds Dominating (Downside Risk)', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' }
      : { text: '⚪ Balanced News Flow (Mixed Catalysts)', color: 'text-slate-300', border: 'border-slate-500/30', bg: 'bg-slate-800/40' };

  return (
    <div className="space-y-6">
      {/* Top Banner: News Sentiment & Catalyst Breakdown */}
      <div className="bg-[#121622] border border-[#232D42] rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#20283A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{symbol} News & Price Impact Catalysts</span>
              </h2>
              <p className="text-xs text-slate-400">
                Actionable market intelligence: Does this headline push the stock UP or DOWN?
              </p>
            </div>
          </div>

          {/* Net Sentiment Badge */}
          <div className={`px-4 py-2 rounded-2xl border ${netBias.border} ${netBias.bg} flex items-center gap-2 text-xs font-extrabold ${netBias.color}`}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{netBias.text}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-[#182030] text-slate-300 hover:bg-[#202B40] border border-[#26344E]'
            }`}
          >
            <span>All News</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-500/20">
              {news.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('BULLISH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'BULLISH'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-[#182030] text-emerald-400 hover:bg-[#202B40] border border-[#26344E]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rise Catalysts (Bullish)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20">
              {bullishCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('BEARISH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'BEARISH'
                ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                : 'bg-[#182030] text-rose-400 hover:bg-[#202B40] border border-[#26344E]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Fall Risks (Bearish)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20">
              {bearishCount}
            </span>
          </button>
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400 bg-[#121622] rounded-3xl border border-[#232D42] animate-pulse">
          Scanning financial wires and evaluating price impact for {symbol}...
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#121622] rounded-3xl border border-[#232D42]">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">No news items found under this filter.</p>
          <button
            onClick={() => setFilter('ALL')}
            className="mt-3 text-xs text-sky-400 hover:underline font-bold"
          >
            View all {news.length} news stories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNews.map((item) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';

            return (
              <div
                key={item.id}
                className={`bg-[#121622] border rounded-3xl p-5 transition-all hover:border-slate-600/60 shadow-lg ${
                  isBullish
                    ? 'border-emerald-500/20 hover:border-emerald-500/40'
                    : isBearish
                    ? 'border-rose-500/20 hover:border-rose-500/40'
                    : 'border-[#232D42]'
                }`}
              >
                {/* Top Meta Line: Publisher, Time, and Impact Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{item.publisher}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.published_time}</span>
                    </span>
                  </div>

                  {/* Impact Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        isBullish
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : isBearish
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.impact_badge}
                    </span>

                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                      Est. Move: {item.expected_impact_range}
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-base font-bold text-white leading-snug mb-2.5 hover:text-sky-300 transition-colors">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <span>{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400 shrink-0" />
                  </a>
                </h3>

                {/* Summary snippet if present */}
                {item.summary && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {item.summary}
                  </p>
                )}

                {/* Plain-English Beginner Explanation: Why this moves the price */}
                <div
                  className={`rounded-2xl p-3.5 flex items-start gap-2.5 border ${
                    isBullish
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isBearish
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-[#182030] border-[#2A374F]'
                  }`}
                >
                  <Lightbulb
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isBullish
                        ? 'text-emerald-400'
                        : isBearish
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  />
                  <div className="text-xs leading-relaxed">
                    <span
                      className={`font-bold mr-1.5 ${
                        isBullish
                          ? 'text-emerald-300'
                          : isBearish
                          ? 'text-rose-300'
                          : 'text-slate-300'
                      }`}
                    >
                      Why this moves {symbol}:
                    </span>
                    <span className="text-slate-200">{item.why_it_matters}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
