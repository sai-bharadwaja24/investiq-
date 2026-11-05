import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Sparkles,
  Newspaper,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ArrowLeft,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PriceRangeBars } from './PriceRangeBars';
import { LiveCandlestickChart } from './LiveCandlestickChart';
import { ProfitCalculator } from './ProfitCalculator';
import { SeniorAnalystVerdictCard } from './SeniorAnalystVerdictCard';
import { SituationalActionDesk } from './SituationalActionDesk';
import {
  StockQuote,
  Candle,
  IntradayPrediction,
  FundamentalAnalysis,
  StockNewsItem,
  CandlePatternAnalysisResponse,
  SeniorAnalystVerdict
} from '../types';
import { api } from '../services/api';

interface StockDetailSideBySideProps {
  quote: StockQuote;
  candles: Candle[];
  prediction?: IntradayPrediction;
  fundamentals?: FundamentalAnalysis;
  news: StockNewsItem[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  isBeginnerMode: boolean;
  onTrackTrade: () => void;
  loadingNews?: boolean;
  onBackToMarkets?: () => void;
}

export const StockDetailSideBySide: React.FC<StockDetailSideBySideProps> = ({
  quote,
  candles,
  prediction,
  fundamentals,
  news,
  timeframe,
  setTimeframe,
  isBeginnerMode,
  onTrackTrade,
  loadingNews = false,
  onBackToMarkets
}) => {
  const isPositive = quote.change >= 0;

  // Senior Analyst Consensus state
  const [seniorVerdict, setSeniorVerdict] = useState<SeniorAnalystVerdict | null>(null);
  const [loadingVerdict, setLoadingVerdict] = useState<boolean>(true);

  // Candlestick pattern state
  const [patternAnalysis, setPatternAnalysis] = useState<CandlePatternAnalysisResponse | null>(null);
  const [loadingPatterns, setLoadingPatterns] = useState<boolean>(false);

  // Tabbed Deep-Dives in Right Column
  const [activeTab, setActiveTab] = useState<'action_plan' | 'health' | 'news'>('action_plan');
  const [showJargon, setShowJargon] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingVerdict(true);
    setLoadingPatterns(true);

    // Fetch unified Senior Analyst Consensus
    api.getSeniorAnalystVerdict(quote.symbol, timeframe)
      .then((res) => {
        if (isMounted) setSeniorVerdict(res);
      })
      .catch((err) => {
        console.error('Failed to load senior analyst verdict', err);
      })
      .finally(() => {
        if (isMounted) setLoadingVerdict(false);
      });

    // Fetch detailed candlestick patterns for chart overlays
    api.getCandlestickPatterns(quote.symbol, timeframe)
      .then((res) => {
        if (isMounted) setPatternAnalysis(res);
      })
      .catch((err) => {
        console.error('Failed to load candlestick patterns', err);
      })
      .finally(() => {
        if (isMounted) setLoadingPatterns(false);
      });

    return () => {
      isMounted = false;
    };
  }, [quote.symbol, timeframe]);

  // Synchronized Target & Stop-Loss from Senior Analyst & Situational Action Desk
  const [selectedTradeSide, setSelectedTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [customTarget, setCustomTarget] = useState<number | undefined>(undefined);
  const [customStopLoss, setCustomStopLoss] = useState<number | undefined>(undefined);

  const unifiedTarget = customTarget || seniorVerdict?.target_price || prediction?.projected_target_price;
  const unifiedStopLoss = customStopLoss || seniorVerdict?.stop_loss || prediction?.invalidation_stop_loss;

  return (
    <div className="space-y-6">
      {/* Prominent Back Button & Active Symbol Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {onBackToMarkets && (
          <button
            onClick={onBackToMarkets}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-[#141A26] hover:bg-[#1C2538] text-slate-200 hover:text-white border border-[#232D42] hover:border-emerald-500/50 transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Markets Dashboard</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="p-1 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono font-bold">
            NSE:{quote.symbol}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Source: NSE/BSE FastInfo (Real-time feed)
          </span>
        </div>
      </div>

      {/* 2-Column Institutional Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Visual Analytics, Chart & Synced Execution (7 cols on lg)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Stock Header Card */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {quote.symbol}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                    NSE
                  </span>
                  {quote.is_market_open ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE MARKET
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      MARKET CLOSED
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{quote.name}</div>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline sm:justify-end gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    ₹{quote.price.toFixed(2)}
                  </div>
                  {quote.bse_price && (
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      BSE ₹{quote.bse_price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center sm:justify-end gap-2 mt-1 font-bold text-xs">
                  <span
                    className={`flex items-center gap-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    NSE {isPositive ? '+' : ''}
                    {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                    {quote.change_percent.toFixed(2)}%)
                  </span>
                  {quote.bse_price && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono">
                        BSE ₹{quote.bse_price.toFixed(2)} ({quote.bse_change_percent && quote.bse_change_percent >= 0 ? '+' : ''}{quote.bse_change_percent?.toFixed(2)}%)
                      </span>
                    </>
                  )}
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-emerald-400 hover:text-emerald-300 text-[11px] font-black cursor-pointer hover:underline">
                    Depth
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1C2436] text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Day Range</span>
                <span className="font-bold text-slate-200 font-mono">
                  ₹{quote.low > 0 ? quote.low.toFixed(1) : quote.price.toFixed(1)} – ₹{quote.high > 0 ? quote.high.toFixed(1) : quote.price.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Prev Close</span>
                <span className="font-bold text-slate-200 font-mono">₹{quote.previous_close.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Volume</span>
                <span className="font-bold text-slate-200 font-mono">{(quote.volume / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </div>

          {/* Groww-Style Price Range Sliders (Today's Low/High + 52-Week Low/High) */}
          <PriceRangeBars
            currentPrice={quote.price}
            dayLow={quote.low}
            dayHigh={quote.high}
            fiftyTwoWeekLow={quote.fifty_two_week_low}
            fiftyTwoWeekHigh={quote.fifty_two_week_high}
          />

          {/* Real-Time Situational Desk ("WHAT TO DO RIGHT NOW" based on the 11 YouTube Strategies) */}
          <SituationalActionDesk
            quote={quote}
            candles={candles}
            verdict={seniorVerdict}
            onSelectTradeAction={(side, target, stop) => {
              setSelectedTradeSide(side);
              if (target) setCustomTarget(target);
              if (stop) setCustomStopLoss(stop);
            }}
          />

          {/* Normal Price Graph & Candlestick Chart (with volume & pattern markers) */}
          <LiveCandlestickChart
            candles={candles}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            patterns={patternAnalysis?.detected_patterns || []}
            activePattern={seniorVerdict?.active_candlestick_pattern || patternAnalysis?.active_pattern}
          />

          {/* Authentic Groww BUY & SELL Order & Profit Execution Pad (with Intraday 5x Margin & Keypad) */}
          <ProfitCalculator
            symbol={quote.symbol}
            currentPrice={quote.price}
            bsePrice={quote.bse_price}
            targetPrice={unifiedTarget}
            stopLoss={unifiedStopLoss}
            initialSide={selectedTradeSide}
          />
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Senior Analyst Hub & Tabbed Deep-Dives (5 cols on lg)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">

          {/* Master Senior Market Analyst Verdict (Single Source of Truth) */}
          <SeniorAnalystVerdictCard
            verdict={seniorVerdict}
            loading={loadingVerdict}
            onTrackTrade={onTrackTrade}
          />

          {/* Arranged Deep-Dives: Tabbed Clean Container */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl shadow-lg overflow-hidden">
            
            {/* Tabs Header Navigation */}
            <div className="flex border-b border-[#1C2436] bg-[#121724]/70 p-1.5 gap-1 text-xs">
              <button
                onClick={() => setActiveTab('action_plan')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'action_plan'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Action Plan</span>
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'health'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Company Health</span>
                {fundamentals && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-mono">
                    {fundamentals.overall_score}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>News</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-mono">
                  {news.length}
                </span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-5">

              {/* TAB 1: 4-STEP BEGINNER INVESTMENT ROADMAP & JARGON BUSTER */}
              {activeTab === 'action_plan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C2436] pb-2.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        4-Step Execution Checklist
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Beginner Friendly
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Step 1: Decision */}
                    <div className="bg-[#141A26] p-3 rounded-xl border border-[#20293C] space-y-1">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">1</span>
                        <span>The Decision: Should You Buy?</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                        {seniorVerdict?.verdict === 'AVOID_SELL'
                          ? `STRICTLY AVOID fresh buying. ${quote.symbol} is trading under heavy institutional selling pressure. Retail bounces below VWAP fail over 72% of the time.`
                          : seniorVerdict?.verdict === 'STRONG_BUY' || isPositive
                          ? `Yes, the stock has positive upward momentum today. Institutional buyers are actively supporting price dips above VWAP.`
                          : `Wait on the sidelines. There is no clear directional edge yet. Protect your capital until a decisive breakout occurs.`}
                      </p>
                    </div>

                    {/* Step 2: Position Sizing */}
                    <div className="bg-[#141A26] p-3 rounded-xl border border-[#20293C] space-y-1">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black">2</span>
                        <span>Position Sizing: How Much to Invest?</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                        Never put all your capital into one stock. Use the Profit Calculator on the left to size your quantity so your maximum monetary risk stays under 1% of your total account.
                      </p>
                    </div>

                    {/* Step 3: Emergency Exit */}
                    <div className="bg-[#141A26] p-3 rounded-xl border border-[#20293C] space-y-1">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-black">3</span>
                        <span>Stop Loss: Where Is Your Emergency Exit?</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                        Always set a stop-loss order at <strong className="text-rose-400 font-mono">₹{unifiedStopLoss ? unifiedStopLoss.toFixed(2) : (quote.price * 0.985).toFixed(2)}</strong>. If price breaches this level, the setup is invalidated and you exit with a minimal loss.
                      </p>
                    </div>

                    {/* Step 4: Target Exit */}
                    <div className="bg-[#141A26] p-3 rounded-xl border border-[#20293C] space-y-1">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">4</span>
                        <span>Target Exit: When to Take Your Profit?</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                        When price approaches the target of <strong className="text-emerald-400 font-mono">₹{unifiedTarget ? unifiedTarget.toFixed(2) : (quote.price * 1.035).toFixed(2)}</strong>, lock in at least 70% of your profits into cash and trail your stop-loss on the rest.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Jargon Buster Accordion */}
                  <div className="pt-2 border-t border-[#1C2436]">
                    <button
                      onClick={() => setShowJargon(!showJargon)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#121622] hover:bg-[#182030] text-slate-300 border border-[#232D42] text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <HelpCircle className="w-4 h-4" />
                        Confused by market terms? Open Beginner Jargon Buster
                      </span>
                      <span className="text-xs text-indigo-400">{showJargon ? '▲ Hide' : '▼ Show'}</span>
                    </button>

                    {showJargon && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#0B0F18] border border-[#20293C] space-y-2 text-[11px]">
                        <div>
                          <strong className="text-emerald-400">📊 VWAP (Volume Weighted Average Price):</strong>
                          <span className="text-slate-300 block">
                            The true benchmark price paid by institutional funds. When a stock trades below VWAP, institutions are net sellers.
                          </span>
                        </div>
                        <div>
                          <strong className="text-rose-400">🛡️ Stop-Loss:</strong>
                          <span className="text-slate-300 block">
                            Your safety parachute. An automated order that closes your position if the market goes against you, preventing deep drawdowns.
                          </span>
                        </div>
                        <div>
                          <strong className="text-amber-400">⚡ RSI (Relative Strength Index):</strong>
                          <span className="text-slate-300 block">
                            Momentum meter from 0 to 100. Above 60 indicates aggressive buyers; below 40 indicates persistent institutional distribution.
                          </span>
                        </div>
                        <div>
                          <strong className="text-indigo-400">🪤 Counter-Trend Trap:</strong>
                          <span className="text-slate-300 block">
                            A minor bullish candlestick that appears inside an aggressive downtrend. Retail buyers get trapped expecting a rally, but smart money sells into the bounce.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: COMPANY HEALTH & FUNDAMENTALS */}
              {activeTab === 'health' && (
                <div className="space-y-4">
                  {fundamentals ? (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-[#1C2436] pb-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Financial Health & Solvency
                          </h4>
                        </div>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                          {fundamentals.overall_score}/100 Score
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.values(fundamentals.metrics).flat().slice(0, 4).map((m: any, idx: number) => (
                          <div key={idx} className="bg-[#141A26] p-2.5 rounded-xl border border-[#20293C]">
                            <span className="text-slate-400 text-[10px] block uppercase truncate">
                              {m.name}
                            </span>
                            <span className="font-bold text-white text-sm font-mono">
                              {typeof m.value === 'number' ? m.value.toFixed(2) : String(m.value)}
                              {m.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#121622] p-3 rounded-xl border border-[#1F2739] text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Fundamental Verdict
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {fundamentals.beginner_takeaway}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-500 italic">
                      Fundamental data is currently being retrieved...
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CATALYST NEWS */}
              {activeTab === 'news' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C2436] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recent Market Catalysts
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{news.length} Articles</span>
                  </div>

                  {loadingNews ? (
                    <div className="text-center py-6 text-xs text-slate-500 animate-pulse">
                      Fetching latest company announcements...
                    </div>
                  ) : news.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 italic">
                      No major breaking news in the last 24 hours. Price is moving purely on technical supply and demand.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {news.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#141A26] p-3 rounded-xl border border-[#20293C] space-y-1 hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">{item.publisher}</span>
                            <span>{item.published_time}</span>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-white hover:text-emerald-400 transition-colors block line-clamp-2 leading-tight"
                          >
                            {item.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
