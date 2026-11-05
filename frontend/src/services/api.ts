import {
  MarketIndex,
  MarketMoversData,
  StockQuote,
  Candle,
  IntradayPrediction,
  FundamentalAnalysis,
  TimedExitEvaluation,
  ActiveTrade,
  Lesson,
  StockNewsItem,
  BigMoversResponse,
  BudgetStocksResponse,
  CandlePatternAnalysisResponse,
  SeniorAnalystVerdict,
  ChatMessage,
  ChatContext,
  ChatResponse
} from '../types';

const isBrowser = typeof window !== 'undefined';
const isSecure = isBrowser && window.location.protocol === 'https:';
const API_BASE_URL = '/api';
const WS_BASE_URL = isBrowser
  ? `${isSecure ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`
  : 'ws://localhost:8000/ws/live';

export const api = {
  async getIndices(): Promise<MarketIndex[]> {
    const res = await fetch(`${API_BASE_URL}/markets/indices`);
    if (!res.ok) throw new Error('Failed to fetch indices');
    return res.json();
  },

  async getMovers(): Promise<MarketMoversData> {
    const res = await fetch(`${API_BASE_URL}/markets/movers`);
    if (!res.ok) throw new Error('Failed to fetch market movers');
    return res.json();
  },

  async searchStocks(query: string): Promise<StockQuote[]> {
    const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search stocks');
    return res.json();
  },

  async getQuote(symbol: string): Promise<StockQuote> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/quote`);
    if (!res.ok) throw new Error('Failed to fetch quote');
    return res.json();
  },

  async getCandles(symbol: string, timeframe: string = '5m', count: number = 80): Promise<Candle[]> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/candles?timeframe=${timeframe}&count=${count}`);
    if (!res.ok) throw new Error('Failed to fetch candles');
    return res.json();
  },

  async getCandlestickPatterns(symbol: string, timeframe: string = '5m'): Promise<CandlePatternAnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/candlestick-patterns?timeframe=${encodeURIComponent(timeframe)}`);
    if (!res.ok) throw new Error('Failed to fetch candlestick patterns');
    return res.json();
  },

  async getSeniorAnalystVerdict(symbol: string, timeframe: string = '5m', horizon: number = 30): Promise<SeniorAnalystVerdict> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/senior-analyst?timeframe=${encodeURIComponent(timeframe)}&horizon=${horizon}`);
    if (!res.ok) throw new Error('Failed to fetch senior analyst verdict');
    return res.json();
  },

  async getPrediction(symbol: string, horizon: number = 30): Promise<IntradayPrediction> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/prediction?horizon=${horizon}`);
    if (!res.ok) throw new Error('Failed to fetch prediction');
    return res.json();
  },

  async getFundamentals(symbol: string): Promise<FundamentalAnalysis> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/fundamentals`);
    if (!res.ok) throw new Error('Failed to fetch fundamentals');
    return res.json();
  },

  async compareStocks(symbols: string[]): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/stocks/compare/multiquote?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (!res.ok) throw new Error('Failed to compare stocks');
    return res.json();
  },

  async getLessons(): Promise<Lesson[]> {
    const res = await fetch(`${API_BASE_URL}/learn/lessons`);
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return res.json();
  },

  async trackTrade(trade: { symbol: string; entry_price: number; entry_time: string; target_price?: number; stop_loss?: number; quantity?: number; side?: 'BUY' | 'SELL' }): Promise<ActiveTrade> {
    const res = await fetch(`${API_BASE_URL}/trades/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trade),
    });
    if (!res.ok) throw new Error('Failed to track trade');
    return res.json();
  },

  async getActiveTrades(): Promise<ActiveTrade[]> {
    const res = await fetch(`${API_BASE_URL}/trades/active`);
    if (!res.ok) throw new Error('Failed to fetch active trades');
    return res.json();
  },

  async evaluateTrade(symbol: string, entryPrice: number, entryTime: string = '10:00 AM'): Promise<TimedExitEvaluation> {
    const res = await fetch(`${API_BASE_URL}/trades/evaluate/${encodeURIComponent(symbol)}?entry_price=${entryPrice}&entry_time=${encodeURIComponent(entryTime)}`);
    if (!res.ok) throw new Error('Failed to evaluate trade');
    return res.json();
  },

  async closeTrade(tradeId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/trades/${encodeURIComponent(tradeId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to close trade');
    return res.json();
  },

  async getStockNews(symbol: string): Promise<StockNewsItem[]> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/news`);
    if (!res.ok) throw new Error('Failed to fetch stock news');
    const data = await res.json();
    return data.news || [];
  },

  async getMarketNews(): Promise<StockNewsItem[]> {
    const res = await fetch(`${API_BASE_URL}/markets/news`);
    if (!res.ok) throw new Error('Failed to fetch market news');
    return res.json();
  },

  async getBigMovers(): Promise<BigMoversResponse> {
    const res = await fetch(`${API_BASE_URL}/markets/big-movers`);
    if (!res.ok) throw new Error('Failed to fetch big movers');
    return res.json();
  },

  async getBudgetStocks(): Promise<BudgetStocksResponse> {
    const res = await fetch(`${API_BASE_URL}/markets/budget-stocks`);
    if (!res.ok) throw new Error('Failed to fetch budget stocks');
    return res.json();
  },

  async sendChatMessage(messages: ChatMessage[], context?: ChatContext): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context })
    });
    if (!res.ok) throw new Error('Failed to communicate with AI Trading Copilot');
    return res.json();
  }
};

export class LiveMarketWebSocket {
  private ws: WebSocket | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private statusListeners: Set<(status: 'connected' | 'connecting' | 'disconnected') => void> = new Set();
  private isPollingFallback: boolean = false;
  private pollingTimer: any = null;
  private connectAttempts: number = 0;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.notifyStatus('connecting');

    try {
      this.ws = new WebSocket(WS_BASE_URL);

      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          try { this.ws.close(); } catch (_) {}
          this.activatePollingFallback();
        }
      }, 2500);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.connectAttempts = 0;
        this.isPollingFallback = false;
        this.clearPolling();
        this.notifyStatus('connected');
        this.subscribedSymbols.forEach((sym) => {
          this.send({ action: 'subscribe', symbol: sym });
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'TICK' || msg.type === 'INITIAL_QUOTE') {
            const sym = msg.symbol;
            const handlers = this.listeners.get(sym);
            if (handlers) {
              handlers.forEach((h) => h(msg.data));
            }
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };

      this.ws.onclose = () => {
        clearTimeout(connectionTimeout);
        this.connectAttempts++;
        if (this.connectAttempts >= 2 || isSecure) {
          // Cloud / Vercel Serverless environment: seamless HTTP polling fallback
          this.activatePollingFallback();
        } else {
          this.notifyStatus('connecting');
          setTimeout(() => this.connect(), 3000);
        }
      };

      this.ws.onerror = () => {
        clearTimeout(connectionTimeout);
        this.activatePollingFallback();
      };
    } catch (e) {
      this.activatePollingFallback();
    }
  }

  private activatePollingFallback() {
    if (this.isPollingFallback) return;
    this.isPollingFallback = true;
    this.notifyStatus('connected'); // Connected via HTTP Live Sync

    this.startPolling();
  }

  private startPolling() {
    this.clearPolling();
    this.pollingTimer = setInterval(async () => {
      if (this.subscribedSymbols.size === 0) return;
      for (const sym of this.subscribedSymbols) {
        try {
          const quote = await api.getQuote(sym);
          const handlers = this.listeners.get(sym);
          if (handlers && quote) {
            handlers.forEach((h) => h(quote));
          }
        } catch (_) {}
      }
    }, 3000);
  }

  private clearPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  subscribe(symbol: string, onTick: (data: any) => void) {
    const sym = symbol.toUpperCase().trim();
    this.subscribedSymbols.add(sym);

    if (!this.listeners.has(sym)) {
      this.listeners.set(sym, new Set());
    }
    this.listeners.get(sym)!.add(onTick);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ action: 'subscribe', symbol: sym });
    } else if (this.isPollingFallback) {
      api.getQuote(sym).then((q) => onTick(q)).catch(() => {});
    }
  }

  unsubscribe(symbol: string, onTick: (data: any) => void) {
    const sym = symbol.toUpperCase().trim();
    const handlers = this.listeners.get(sym);
    if (handlers) {
      handlers.delete(onTick);
      if (handlers.size === 0) {
        this.listeners.delete(sym);
        this.subscribedSymbols.delete(sym);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.send({ action: 'unsubscribe', symbol: sym });
        }
      }
    }
  }

  onStatusChange(cb: (status: 'connected' | 'connecting' | 'disconnected') => void) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private notifyStatus(status: 'connected' | 'connecting' | 'disconnected') {
    this.statusListeners.forEach((cb) => cb(status));
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const liveWs = new LiveMarketWebSocket();
