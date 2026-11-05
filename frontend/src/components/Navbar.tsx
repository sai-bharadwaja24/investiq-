import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, BookOpen, BarChart2, ShieldCheck, Zap, Sparkles, TrendingUp, ArrowLeft, Clock, Info } from 'lucide-react';
import { StockQuote } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: 'markets' | 'stock' | 'compare' | 'learn';
  setCurrentTab: (tab: 'markets' | 'stock' | 'compare' | 'learn') => void;
  selectedStock: string;
  setSelectedStock?: (symbol: string) => void;
  onSelectStock?: (symbol: string) => void;
  isBeginnerMode: boolean;
  setIsBeginnerMode: (val: boolean) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  activeTradesCount: number;
  openActiveTradesModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  setSelectedStock,
  onSelectStock,
  isBeginnerMode,
  setIsBeginnerMode,
  connectionStatus,
  activeTradesCount,
  openActiveTradesModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [timeStr, setTimeStr] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';
  });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeStr(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Debounced search with instant fallback
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchStocks(query);
        if (res && res.length > 0) {
          setSearchResults(res);
        } else {
          setSearchResults([
            {
              symbol: query.toUpperCase(),
              ticker: `${query.toUpperCase()}.NS`,
              name: `${query.toUpperCase()} (NSE)`,
              sector: 'Equities',
              price: 0,
              change: 0,
              change_percent: 0,
              open: 0,
              high: 0,
              low: 0,
              previous_close: 0,
              volume: 0,
              is_market_open: true,
              timestamp: ''
            }
          ]);
        }
        setShowDropdown(true);
      } catch {
        setSearchResults([
          {
            symbol: query.toUpperCase(),
            ticker: `${query.toUpperCase()}.NS`,
            name: `${query.toUpperCase()} (NSE)`,
            sector: 'Equities',
            price: 0,
            change: 0,
            change_percent: 0,
            open: 0,
            high: 0,
            low: 0,
            previous_close: 0,
            volume: 0,
            is_market_open: true,
            timestamp: ''
          }
        ]);
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol: string) => {
    const clean = symbol.toUpperCase().trim();
    if (onSelectStock) {
      onSelectStock(clean);
    } else if (setSelectedStock) {
      setSelectedStock(clean);
    }
    setCurrentTab('stock');
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const clean = searchQuery.trim().toUpperCase();
      const exact = searchResults.find(
        (s) => s.symbol.toUpperCase() === clean
      );
      if (exact) {
        handleSelectStock(exact.symbol);
      } else if (searchResults.length > 0) {
        handleSelectStock(searchResults[0].symbol);
      } else {
        handleSelectStock(clean);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0E131F]/90 backdrop-blur-md border-b border-[#1F2739]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setCurrentTab('markets')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">Invest<span className="text-emerald-400">IQ</span></span>
                <div className="relative group/groww">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 cursor-help">
                    <span>5x Intraday MIS</span>
                    <Info className="w-2.5 h-2.5 opacity-70" />
                  </span>
                  <div className="absolute top-full left-0 mt-1.5 hidden group-hover/groww:block z-50 w-64 p-2.5 rounded-xl bg-[#161D2B] border border-emerald-500/30 shadow-2xl text-[11px] text-slate-300 leading-normal pointer-events-none">
                    <strong className="text-emerald-400 block mb-0.5">5x Intraday MIS Simulation:</strong>
                    Simulates standard Indian Brokerage (Groww / Zerodha) margin leverage (5x purchasing power) and auto 3:20 PM square-off risk rules.
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Real-Time Buy / Avoid Decision Engine</p>
            </div>
          </div>

          {/* Quick Back to Markets Button when on other tabs */}
          {currentTab !== 'markets' && (
            <button
              onClick={() => setCurrentTab('markets')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-[#151C2A] hover:bg-[#1C2638] text-emerald-400 border border-emerald-500/30 transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Markets</span>
            </button>
          )}

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('markets')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'markets'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Markets
            </button>
            <button
              onClick={() => setCurrentTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'compare'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Compare Stocks
            </button>
            <button
              onClick={() => setCurrentTab('learn')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'learn'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Learn
            </button>
          </nav>
        </div>

        {/* Global Search */}
        <div ref={searchRef} className="relative flex-1 min-w-[120px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stocks e.g. IFCI, RELIANCE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && setShowDropdown(true)}
              className="w-full bg-[#161B26] border border-[#273146] focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full sm:w-[420px] left-0 sm:left-auto sm:right-0 bg-[#161B26]/95 backdrop-blur-xl border border-[#2B354C] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-[#202738] max-h-96 overflow-y-auto">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="px-4 py-3 hover:bg-[#1E2638] cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <span>{stock.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">NSE</span>
                      {stock.sector && (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                          • {stock.sector}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate max-w-[260px] sm:max-w-[320px] mt-0.5">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {stock.price && stock.price > 0 ? (
                      <>
                        <div className="text-sm font-black text-white">₹{stock.price.toFixed(2)}</div>
                        <div
                          className={`text-xs font-extrabold ${
                            stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change_percent.toFixed(2)}%
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25 group-hover:bg-emerald-500/20 transition-colors">
                        Analyze →
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Active Trades Pill */}
          <button
            onClick={openActiveTradesModal}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeTradesCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 animate-pulse-subtle'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Trades ({activeTradesCount})</span>
          </button>

          {/* Beginner / Advanced Mode Switch */}
          <div className="flex items-center bg-[#161B26] border border-[#273146] rounded-xl p-0.5">
            <button
              onClick={() => setIsBeginnerMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isBeginnerMode
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simple plain English explanations, analogies, and clear verdicts"
            >
              <Sparkles className="w-3 h-3" />
              <span>Beginner</span>
            </button>
            <button
              onClick={() => setIsBeginnerMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                !isBeginnerMode
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deep quantitative statistics, formulas, and advanced technicals"
            >
              <BarChart2 className="w-3 h-3" />
              <span>Advanced</span>
            </button>
          </div>

          {/* As of <time> stamp + data source */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121622] border border-[#20293C] text-[10px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>As of <strong className="text-slate-200">{timeStr}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-sans">NSE/BSE FastInfo</span>
          </div>

          {/* Real-time Status Indicator (Fix stuck connecting state) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161B26] border border-[#273146] text-[11px] font-medium text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold tracking-wide">
              {connectionStatus === 'connected'
                ? 'LIVE FEED'
                : connectionStatus === 'connecting'
                ? 'SYNCING...'
                : 'RECONNECTING'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
