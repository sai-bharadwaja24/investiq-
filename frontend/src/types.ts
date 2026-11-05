export interface StockQuote {
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  volume: number;
  vwap?: number;
  market_cap?: number;
  sector?: string;
  is_market_open: boolean;
  timestamp: string;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  bse_price?: number;
  bse_change_percent?: number;
}

export type OrderProductType = 'DELIVERY' | 'INTRADAY' | 'MTF';
export type OrderPriceType = 'LIMIT' | 'MARKET';
export type OrderExchange = 'NSE' | 'BSE';

export interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  sparkline: number[];
  status: string;
}

export interface HighProbSetup {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  intraday_direction: string;
  probability: number;
  setup_score: number;
  horizon: string;
  expected_exit_time: string;
  risk_level: string;
  category?: string;
  category_label?: string;
  target_price?: number;
  stop_loss?: number;
  potential_roi_percent?: number;
  beginner_reason?: string;
  how_to_trade?: string;
}

export interface MarketMoversData {
  top_gainers: StockQuote[];
  top_losers: StockQuote[];
  most_active: StockQuote[];
  high_probability_intraday: HighProbSetup[];
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface FundamentalMetric {
  name: string;
  value: any;
  unit: string;
  status: 'positive' | 'warning' | 'negative' | 'neutral';
  beginner_explanation: string;
  why_it_matters: string;
  formula?: string;
}

export interface FundamentalAnalysis {
  symbol: string;
  name: string;
  overall_score: number;
  verdict: string;
  verdict_badge: 'green' | 'yellow' | 'red';
  category_scores: Record<string, number>;
  positive_factors: string[];
  warning_factors: string[];
  metrics: Record<string, FundamentalMetric[]>;
  beginner_takeaway: string;
}

export interface IntradayPrediction {
  symbol: string;
  current_price: number;
  change_percent: number;
  timestamp: string;
  is_market_open?: boolean;
  market_status_text?: string;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS' | 'NO_CLEAR_EDGE';
  direction_display: string;
  signal_strength_score?: number;
  indicator_score?: number;
  session_guard_active?: boolean;
  historical_veto_applied?: boolean;
  probabilities: {
    UP: number;
    SIDEWAYS: number;
    DOWN: number;
  };
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  edge_detected: boolean;
  horizon_minutes: number;
  expected_duration_minutes: number;
  target_clock_time: string;
  projected_target_price: number;
  invalidation_stop_loss: number;
  risk_reward_ratio: number;
  market_regime: string;
  multi_timeframe_alignment: {
    '1H': string;
    '15M': string;
    '5M': string;
  };
  intraday_setup_score: number;
  historical_similar_cases: number;
  historical_up_frequency: number;
  why_reasons: string[];
  warning_reasons: string[];
  beginner_summary: string;
}

export interface TimedExitEvaluation {
  symbol: string;
  entry_price: number;
  entry_time: string;
  current_price: number;
  current_pnl: number;
  current_pnl_percent: number;
  elapsed_minutes: number;
  state: 'STILL_BULLISH' | 'STALLING' | 'REVERSAL';
  state_display: string;
  current_probability: {
    UP: number;
    SIDEWAYS: number;
    DOWN: number;
  };
  recommended_action: 'HOLD' | 'TRAIL_STOP' | 'TIMEOUT_EXIT' | 'IMMEDIATE_EXIT';
  recommended_exit_clock_time: string;
  remaining_expected_minutes: number;
  recommended_trailing_stop: number;
  urgency: 'NORMAL' | 'WARNING' | 'CRITICAL';
  countdown_seconds?: number;
  action_guidance: string;
  reason: string;
}

export interface ActiveTrade {
  id: string;
  symbol: string;
  entry_price: number;
  entry_time: string;
  target_price: number;
  stop_loss: number;
  quantity: number;
  side?: 'BUY' | 'SELL';
  current_price?: number;
  pnl?: number;
  pnl_percent?: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  reading_time: string;
  summary: string;
  content: string;
  key_takeaway: string;
}

export interface StockNewsItem {
  id: string;
  title: string;
  publisher: string;
  published_time: string;
  url: string;
  summary?: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact_badge: string;
  impact_severity: 'HIGH' | 'MODERATE' | 'LOW';
  expected_impact_range: string;
  why_it_matters: string;
}

export interface BigMoverItem {
  symbol: string;
  ticker: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  move_type: 'GREAT_RISE' | 'GREAT_FALL';
  badge_text: string;
  expected_move_range: string;
  target_price: number;
  invalidation_level: number;
  confidence_score: number;
  volume_surge_ratio: number;
  technical_catalyst: string;
  news_catalyst: string;
  action_advice: string;
  risk_level: 'HIGH' | 'EXTREME' | 'MODERATE';
  beginner_explanation?: string;
  company_summary?: string;
  category_tag?: string;
  how_to_invest_simple?: string;
  smart_money_badge?: string;
  fvg_consequent_encroachment?: number;
  retest_level?: number;
  breakout_checks_passed?: number;
  volume_delta_dominant_pct?: number;
}

export interface BigMoversResponse {
  scan_time: string;
  total_count: number;
  rise_candidates_count: number;
  fall_candidates_count: number;
  movers: BigMoverItem[];
}

export interface BudgetStockItem {
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  budget_tier: 'UNDER_100' | '100_TO_250' | '250_TO_500';
  budget_tier_label: string;
  shares_per_5k: number;
  target_price: number;
  stop_loss: number;
  potential_profit_5k: number;
  potential_roi_percent: number;
  beginner_summary: string;
  direction: 'UP' | 'DOWN';
}

export interface BudgetStocksResponse {
  scan_time: string;
  total_count: number;
  under_100_count: number;
  under_250_count: number;
  under_500_count: number;
  stocks: BudgetStockItem[];
}

export interface CandlePatternMatch {
  pattern_id: string;
  pattern_name: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  pattern_type: 'REVERSAL' | 'CONTINUATION' | 'INDECISION';
  predicted_movement: string;
  predicted_target: number;
  invalidation_stop_loss: number;
  expected_gain_percent: number;
  confidence_score: number;
  candle_time: string;
  candle_index: number;
  beginner_summary: string;
  what_happened_explanation: string;
  actionable_beginner_advice: string;
}

export interface CandlePatternAnalysisResponse {
  symbol: string;
  timeframe: string;
  current_price: number;
  active_pattern?: CandlePatternMatch | null;
  detected_patterns: CandlePatternMatch[];
  overall_sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  overall_confidence: number;
  primary_prediction_text: string;
  timestamp: string;
}
export interface ConfluenceChecklistItem {
  label: string;
  status: 'positive' | 'negative' | 'neutral';
  text: string;
}

export interface SeniorAnalystVerdict {
  symbol: string;
  current_price: number;
  timestamp: string;
  is_market_open: boolean;
  verdict: 'STRONG_BUY' | 'MILD_BUY' | 'AVOID_SELL' | 'WAIT_CONSOLIDATION';
  verdict_display: string;
  verdict_badge_color: string;
  conviction_percent: number;
  target_price: number;
  stop_loss: number;
  expected_gain_percent: number;
  risk_reward_ratio: number;
  time_horizon_text: string;
  senior_analyst_take: string;
  candlestick_context: string;
  action_advice: string;
  confluence_checklist: ConfluenceChecklistItem[];
  active_candlestick_pattern?: CandlePatternMatch | null;
  market_regime: string;
  smart_money_insights?: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatContext {
  symbol?: string;
  name?: string;
  price?: number;
  bse_price?: number;
  change_percent?: number;
  high?: number;
  low?: number;
  vwap?: number;
  timeframe?: string;
  quantity?: number;
  limit_price?: number;
  product_type?: string;
  target_price?: number;
  stop_loss?: number;
  active_pattern?: string;
  pattern_sentiment?: string;
  senior_verdict?: string;
  conviction_percent?: number;
  senior_analyst_take?: string;
  user_balance?: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: ChatContext;
  api_key?: string;
}

export interface ChatResponse {
  reply: string;
  context_stock?: string;
  suggested_chips: string[];
  timestamp: string;
}
