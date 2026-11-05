import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketIndices } from './components/MarketIndices';
import { MarketMovers } from './components/MarketMovers';
import { HighProbSetups } from './components/HighProbSetups';
import { StockVerdictCard } from './components/StockVerdictCard';
import { IntradayView } from './components/IntradayView';
import { InvestView } from './components/InvestView';
import { ActiveTradeModal } from './components/ActiveTradeModal';
import { CompareView } from './components/CompareView';
import { LearnView } from './components/LearnView';
import { StockNewsView } from './components/StockNewsView';
import { BigMoversRadar } from './components/BigMoversRadar';
import { BudgetStocksCollection } from './components/BudgetStocksCollection';
import { StockDetailSideBySide } from './components/StockDetailSideBySide';
import { TradingChatbot } from './components/TradingChatbot';
import {
  MarketIndex,
  MarketMoversData,
  StockQuote,
  Candle,
  IntradayPrediction,
  FundamentalAnalysis,
  ActiveTrade,
  StockNewsItem
} from './types';
import { api, liveWs } from './services/api';
import { ShieldCheck, Target, AlertCircle, RefreshCw, BarChart2, Newspaper, LayoutGrid } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<'markets' | 'stock' | 'compare' | 'learn'>('markets');
  const [selectedStock, setSelectedStock] = useState<string>('RELIANCE');
  const [stockDetailTab, setStockDetailTab] = useState<'side-by-side' | 'intraday' | 'invest' | 'news'>('side-by-side');
  const [isBeginnerMode, setIsBeginnerMode] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [activeTradeModalOpen, setActiveTradeModalOpen] = useState<boolean>(false);

  // Market overview state
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [movers, setMovers] = useState<MarketMoversData | null>(null);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);

  // Stock detail state
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [prediction, setPrediction] = useState<IntradayPrediction | undefined>(undefined);
  const [fundamentals, setFundamentals] = useState<FundamentalAnalysis | undefined>(undefined);
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);
  const [technicalData, setTechnicalData] = useState<any>({});
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [loadingStock, setLoadingStock] = useState<boolean>(false);

  // Active trades state
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    liveWs.connect();
    const unsubStatus = liveWs.onStatusChange(setConnectionStatus);
    return () => {
      unsubStatus();
    };
  }, []);

  // Fetch active trades
  const fetchActiveTrades = async () => {
    try {
      const data = await api.getActiveTrades();
      setActiveTrades(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActiveTrades();
  }, []);

  // Load Markets Overview
  const loadMarketOverview = async () => {
    try {
      const [idxData, moversData] = await Promise.all([api.getIndices(), api.getMovers()]);
      setIndices(idxData);
      setMovers(moversData);
    } catch (e) {
      console.error('Failed to load market overview', e);
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    loadMarketOverview();
    // Poll markets overview every 30s
    const timer = setInterval(loadMarketOverview, 30000);
    return () => clearInterval(timer);
  }, []);

  // Load Stock Detail with instant progressive rendering
  const loadStockData = async (sym: string, tf: string) => {
    // Immediately clear previous stock state so NO old values linger
    setQuote(null);
    setCandles([]);
    setPrediction(undefined);
    setFundamentals(undefined);
    setNews([]);
    setLoadingStock(true);
    setLoadingNews(true);

    try {
      // Phase 1: Fetch live quote immediately (< 100ms) without waiting for candles!
      api.getQuote(sym).then((qData) => {
        if (qData && qData.price > 0) {
          setQuote(qData);
          setLoadingStock(false);
        }
      }).catch((err) => console.error('Quote load error', err));

      // Fetch candles concurrently
      api.getCandles(sym, tf, 80).then((cData) => {
        setCandles(cData || []);
      }).catch((err) => console.error('Candles load error', err));

      // Phase 2: Compute ML prediction, fundamentals & news concurrently in background
      const [pData, fData, nData] = await Promise.all([
        api.getPrediction(sym, 30),
        api.getFundamentals(sym),
        api.getStockNews(sym).catch(() => []),
      ]);
      setPrediction(pData);
      setFundamentals(fData);
      setNews(nData || []);
      setLoadingNews(false);
    } catch (e) {
      console.error('Failed to load stock data', e);
      setLoadingStock(false);
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    if (selectedStock) {
      loadStockData(selectedStock, timeframe);
    }
  }, [selectedStock, timeframe]);

  // Subscribe to live tick updates via WebSocket for current selected stock
  useEffect(() => {
    if (!selectedStock) return;

    const handleTick = (tickData: any) => {
      if (!tickData || typeof tickData.price !== 'number' || tickData.price <= 0) return;
      if (tickData.symbol && tickData.symbol !== selectedStock) return;

      setQuote((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          price: tickData.price,
          change: tickData.change,
          change_percent: tickData.change_percent,
          volume: tickData.volume,
          timestamp: tickData.timestamp,
        };
      });

      // Update active candle close
      setCandles((prev) => {
        if (!prev || prev.length === 0) return prev;
        const lastCandle = { ...prev[prev.length - 1] };
        lastCandle.close = tickData.price;
        if (tickData.price > lastCandle.high) lastCandle.high = tickData.price;
        if (tickData.price < lastCandle.low) lastCandle.low = tickData.price;
        return [...prev.slice(0, -1), lastCandle];
      });
    };

    liveWs.subscribe(selectedStock, handleTick);
    return () => {
      liveWs.unsubscribe(selectedStock, handleTick);
    };
  }, [selectedStock]);

  // Fast active stock quote sync (every 2.5s) to guarantee real-time parity with Groww/NSE
  useEffect(() => {
    if (!selectedStock) return;
    const syncQuote = async () => {
      try {
        const fresh = await api.getQuote(selectedStock);
        if (fresh && fresh.price > 0) {
          setQuote(fresh);
        }
      } catch {
        // fail silently
      }
    };
    const timer = setInterval(syncQuote, 2500);
    return () => clearInterval(timer);
  }, [selectedStock]);

  const handleSelectStock = (sym: string) => {
    const cleanSym = sym.toUpperCase().trim();
    if (cleanSym !== selectedStock) {
      // Instantly wipe old stock state so old prices NEVER linger
      setQuote(null);
      setCandles([]);
      setPrediction(undefined);
      setFundamentals(undefined);
      setNews([]);
      setLoadingStock(true);
      setSelectedStock(cleanSym);
    }
    setCurrentTab('stock');
    setStockDetailTab('side-by-side');
  };

  // Read URL query params (?tab=stock&symbol=TCS) for direct deep linking
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const symParam = params.get('symbol') || params.get('stock');
      if (symParam) {
        handleSelectStock(symParam.toUpperCase().trim());
      } else if (tabParam && ['markets', 'stock', 'compare', 'learn'].includes(tabParam)) {
        setCurrentTab(tabParam as any);
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Groww-Style Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedStock={selectedStock}
        setSelectedStock={setSelectedStock}
        onSelectStock={handleSelectStock}
        isBeginnerMode={isBeginnerMode}
        setIsBeginnerMode={setIsBeginnerMode}
        connectionStatus={connectionStatus}
        activeTradesCount={activeTrades.length}
        openActiveTradesModal={() => setActiveTradeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW 1: MARKETS (Home / Groww Dashboard) */}
        {currentTab === 'markets' && (
          <div className="space-y-6">
            {/* Live Indices */}
            <MarketIndices indices={indices} onSelectIndex={handleSelectStock} />

            {/* Big Movers Radar: Today's Great Rise & Fall Predictions */}
            <BigMoversRadar onSelectStock={handleSelectStock} />

            {/* High Probability Intraday Timing Setups */}
            {movers && (
              <HighProbSetups
                setups={movers.high_probability_intraday}
                onSelectStock={handleSelectStock}
              />
            )}

            {/* Penny & Budget Stock Collection (Under ₹500) */}
            <BudgetStocksCollection onSelectStock={handleSelectStock} />

            {/* Today's Market Movers */}
            {movers && <MarketMovers data={movers} onSelectStock={handleSelectStock} />}
          </div>
        )}

        {/* VIEW 2: STOCK DETAIL (Should You Buy? + Side-by-Side Intelligence) */}
        {currentTab === 'stock' && (
          <div className="space-y-6">
            {!quote ? (
              /* Instant Sleek Skeleton when switching stocks */
              <div className="space-y-6 animate-pulse">
                <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">{selectedStock}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700">NSE</span>
                        <span className="text-xs text-emerald-400 font-semibold animate-pulse flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Fetching live market quote...
                        </span>
                      </div>
                      <div className="h-4 w-48 bg-slate-800/60 rounded"></div>
                    </div>
                    <div className="h-9 w-32 bg-slate-800/80 rounded-xl"></div>
                  </div>
                  <div className="mt-6 h-72 bg-slate-800/25 rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 text-xs">
                    Loading live chart & institutional VWAP...
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Clean View Tabs Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#20283A] pb-3 gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setStockDetailTab('side-by-side')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                    stockDetailTab === 'side-by-side'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-[#121622] text-slate-400 hover:text-white border border-[#20283A]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>SIDE-BY-SIDE COMPLETE VIEW</span>
                </button>
                <button
                  onClick={() => setStockDetailTab('intraday')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    stockDetailTab === 'intraday'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#121622] text-slate-400 hover:text-white border border-[#20283A]'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>INTRADAY DEEP-DIVE</span>
                </button>
                <button
                  onClick={() => setStockDetailTab('invest')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    stockDetailTab === 'invest'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-[#121622] text-slate-400 hover:text-white border border-[#20283A]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>INVESTING DEEP-DIVE</span>
                </button>
                <button
                  onClick={() => setStockDetailTab('news')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    stockDetailTab === 'news'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-[#121622] text-slate-400 hover:text-white border border-[#20283A]'
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>NEWS & CATALYSTS</span>
                  {news.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        stockDetailTab === 'news'
                          ? 'bg-black/30 text-slate-900'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {news.length}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-xs text-slate-400 hidden lg:block">
                {stockDetailTab === 'side-by-side'
                  ? 'Real-time chart & signals on left, plain-English explanations & news on right'
                  : stockDetailTab === 'intraday'
                  ? 'Full-width candlestick chart, VWAP, and ML exit timers'
                  : stockDetailTab === 'invest'
                  ? 'Balance sheet solvency and valuation ratios'
                  : 'News impact on price rise or fall with beginner explanations'}
              </span>
            </div>

            {/* Side-by-Side Complete Intelligence View (Default) */}
            {stockDetailTab === 'side-by-side' && (
              <StockDetailSideBySide
                quote={quote}
                candles={candles}
                prediction={prediction}
                fundamentals={fundamentals}
                news={news}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                isBeginnerMode={isBeginnerMode}
                onTrackTrade={() => setActiveTradeModalOpen(true)}
                loadingNews={loadingNews}
                onBackToMarkets={() => setCurrentTab('markets')}
              />
            )}

            {/* Tab 1: Intraday Analysis */}
            {stockDetailTab === 'intraday' && (
              <IntradayView
                quote={quote}
                candles={candles}
                prediction={prediction}
                technicalData={technicalData}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                isBeginnerMode={isBeginnerMode}
              />
            )}

            {/* Tab 2: Long-Term Investing */}
            {stockDetailTab === 'invest' && (
              <InvestView
                quote={quote}
                fundamentals={fundamentals}
                isBeginnerMode={isBeginnerMode}
              />
            )}

            {/* Tab 3: News & Price Impact Catalysts */}
            {stockDetailTab === 'news' && (
              <StockNewsView
                symbol={selectedStock}
                news={news}
                loading={loadingNews}
              />
            )}
              </>
            )}
          </div>
        )}

        {/* VIEW 3: COMPARE STOCKS */}
        {currentTab === 'compare' && (
          <CompareView onSelectStock={handleSelectStock} />
        )}

        {/* VIEW 4: LEARN CENTER */}
        {currentTab === 'learn' && <LearnView />}
      </main>

      {/* Active In-Trade Monitor & Timed Exit Advisor Modal */}
      <ActiveTradeModal
        isOpen={activeTradeModalOpen}
        onClose={() => setActiveTradeModalOpen(false)}
        defaultSymbol={selectedStock}
        defaultPrice={quote?.price || 2920.0}
        activeTrades={activeTrades}
        onRefreshTrades={fetchActiveTrades}
      />

      {/* Comprehensive Professional Statutory Disclaimer Footer */}
      <footer className="mt-auto border-t border-[#1F2739] bg-[#0A0E17] py-8 px-4 text-slate-400">
        <div className="max-w-7xl mx-auto space-y-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1A2234] pb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-xs">
                IQ
              </div>
              <span className="text-sm font-black text-white tracking-wide">InvestIQ Analytics Lab</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Educational Engine
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span>Data: NSE / BSE FastInfo</span>
              <span className="text-slate-600">•</span>
              <span>Intraday MIS 5x Simulator</span>
              <span className="text-slate-600">•</span>
              <span>Smart Money SMC Algorithms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-slate-400">
            <div className="bg-[#0E131F] p-4 rounded-xl border border-[#1A2234] space-y-1.5">
              <strong className="text-amber-400 block font-semibold">⚠️ SEBI Compliance & Educational Disclaimer</strong>
              <p>
                InvestIQ is strictly an educational analytical platform designed for algorithmic paper research and market mechanics simulation. We are <strong>not a SEBI registered investment advisor or research analyst</strong>. All algorithmic probability scores, target projections, and stop-loss calculations are generated via mathematical heuristics and historical statistics. They do not constitute financial advice, buy/sell recommendations, or portfolio solicitation.
              </p>
            </div>

            <div className="bg-[#0E131F] p-4 rounded-xl border border-[#1A2234] space-y-1.5">
              <strong className="text-rose-400 block font-semibold">📊 Market Risk & Capital Disclosure</strong>
              <p>
                Trading in equities, intraday equities, and derivative contracts involves substantial financial risk and can lead to capital loss. According to SEBI&apos;s analysis, 9 out of 10 individual intraday and F&amp;O traders incur net financial losses. Past algorithmic performance does not guarantee future market outcomes. Always consult a certified financial advisor before committing real capital.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#161E2E] text-[10px] text-slate-400">
            <p>© {new Date().getFullYear()} InvestIQ Analytics. Designed for Indian Retail Equity &amp; Intraday Research.</p>
            <p className="flex items-center gap-3">
              <span>Real-Time Market Heuristics</span>
              <span>•</span>
              <span>SEBI Risk Guidelines Respected</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Real-Time Context-Aware AI Trading Copilot */}
      <TradingChatbot
        activeQuote={currentTab === 'stock' ? quote : null}
        prediction={prediction}
        timeframe={timeframe}
      />
    </div>
  );
};
export default App;
