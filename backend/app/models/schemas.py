from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class StockQuote(BaseModel):
    symbol: str
    ticker: str
    name: str
    price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    previous_close: float
    volume: int
    vwap: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    is_market_open: bool = False
    timestamp: str
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    bse_price: Optional[float] = None
    bse_change_percent: Optional[float] = None

class MarketIndex(BaseModel):
    name: str
    symbol: str
    price: float
    change: float
    change_percent: float
    high: float
    low: float
    sparkline: List[float] = []
    status: str = "OPEN"

class MarketMovers(BaseModel):
    top_gainers: List[StockQuote]
    top_losers: List[StockQuote]
    most_active: List[StockQuote]
    high_probability_intraday: List[Dict[str, Any]]

class Candle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    vwap: Optional[float] = None

class FundamentalMetric(BaseModel):
    name: str
    value: Any
    unit: str = ""
    status: str = "neutral"  # positive, warning, negative, neutral
    beginner_explanation: str
    why_it_matters: str
    formula: Optional[str] = None

class FundamentalAnalysis(BaseModel):
    symbol: str
    name: str
    overall_score: int = Field(ge=0, le=100)
    verdict: str  # ATTRACTIVE BUY, HOLD / FAIR VALUE, AVOID / OVERVALUED
    verdict_badge: str  # green, yellow, red
    category_scores: Dict[str, int]
    positive_factors: List[str]
    warning_factors: List[str]
    metrics: Dict[str, List[FundamentalMetric]]
    beginner_takeaway: str

class TechnicalIndicatorValue(BaseModel):
    name: str
    value: float
    signal: str  # BULLISH, BEARISH, NEUTRAL
    beginner_explanation: str
    advanced_details: str

class IntradayPredictionResponse(BaseModel):
    symbol: str
    current_price: float
    change_percent: float
    timestamp: str
    is_market_open: bool = False
    market_status_text: str = "Market Closed"
    
    # Direction & Indicator Score (replacing raw uncalibrated "probabilities")
    direction: str  # UP, DOWN, SIDEWAYS, NO_CLEAR_EDGE
    direction_display: str  # e.g. "🟢 BUY BIAS — Signal Strength 82/100"
    signal_strength_score: int = 50  # 0-100 unvalidated indicator score
    indicator_score: int = 50        # 0-100 score
    probabilities: Dict[str, float]  # Directional indicator weight shares
    confidence: str  # HIGH, MODERATE, LOW
    edge_detected: bool
    
    # Timing & Targets ("Till How Much Time")
    horizon_minutes: int
    expected_duration_minutes: int
    target_clock_time: str
    projected_target_price: float
    invalidation_stop_loss: float
    risk_reward_ratio: float
    
    # Confluence & Context
    market_regime: str
    multi_timeframe_alignment: Dict[str, str]  # {"1H": "BULLISH", "15M": "BULLISH", "5M": "BULLISH"}
    intraday_setup_score: int  # 0-100
    historical_similar_cases: int
    historical_up_frequency: float
    
    # Guards & Veto Flags
    session_guard_active: bool = False
    historical_veto_applied: bool = False
    
    # Explanations
    why_reasons: List[str]
    warning_reasons: List[str]
    beginner_summary: str

class TimedExitResponse(BaseModel):
    symbol: str
    entry_price: float
    entry_time: str
    current_price: float
    current_pnl: float
    current_pnl_percent: float
    elapsed_minutes: int
    
    # In-Flight State
    state: str  # STILL_BULLISH, STALLING, REVERSAL
    state_display: str  # "🟢 STILL BULLISH (HOLD)", "🟡 STALLING (SIDEWAYS)", "🔴 REVERSAL (EXIT NOW)"
    current_probability: Dict[str, float]
    
    # Exact Exit Timing
    recommended_action: str  # HOLD, TRAIL_STOP, TIMEOUT_EXIT, IMMEDIATE_EXIT
    recommended_exit_clock_time: str
    remaining_expected_minutes: int
    recommended_trailing_stop: float
    urgency: str  # NORMAL, WARNING, CRITICAL
    countdown_seconds: Optional[int] = None
    action_guidance: str
    reason: str

class ActiveTradeRequest(BaseModel):
    symbol: str
    entry_price: float
    entry_time: str
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    quantity: int = 1
    side: Optional[str] = "BUY"

class StockNewsItem(BaseModel):
    id: str
    title: str
    publisher: str
    published_time: str
    url: str
    summary: Optional[str] = None
    sentiment: str  # BULLISH, BEARISH, NEUTRAL
    impact_badge: str  # e.g. "🟢 RISE CATALYST" or "🔴 FALL RISK"
    impact_severity: str  # HIGH, MODERATE, LOW
    expected_impact_range: str  # e.g. "+1.5% ~ +3.0%" or "-1.0% ~ -2.5%"
    why_it_matters: str  # Plain English explanation for beginners

class StockNewsResponse(BaseModel):
    symbol: str
    count: int
    news: List[StockNewsItem]

class BigMoverItem(BaseModel):
    symbol: str
    ticker: str
    name: str
    current_price: float
    change: float
    change_percent: float
    move_type: str  # GREAT_RISE, GREAT_FALL
    badge_text: str  # e.g. "🚀 GREAT RISE EXPECTED" or "🔻 GREAT FALL EXPECTED"
    expected_move_range: str  # e.g. "+3.5% ~ +8.0%" or "-4.5% ~ -10.0%"
    target_price: float
    invalidation_level: float
    confidence_score: int  # 0 to 100
    volume_surge_ratio: float  # e.g. 2.8x
    technical_catalyst: str  # Plain-English technical reason
    news_catalyst: str  # Plain-English news or macro reason
    action_advice: str  # Plain-English beginner advice
    risk_level: str  # HIGH, EXTREME, MODERATE
    beginner_explanation: Optional[str] = None
    company_summary: Optional[str] = None
    category_tag: Optional[str] = None
    how_to_invest_simple: Optional[str] = None
    smart_money_badge: Optional[str] = None
    fvg_consequent_encroachment: Optional[float] = None
    retest_level: Optional[float] = None
    breakout_checks_passed: Optional[int] = None
    volume_delta_dominant_pct: Optional[float] = None

class BigMoversResponse(BaseModel):
    scan_time: str
    total_count: int
    rise_candidates_count: int
    fall_candidates_count: int
    movers: List[BigMoverItem]

class BudgetStockItem(BaseModel):
    symbol: str
    ticker: str
    name: str
    price: float
    change: float
    change_percent: float
    budget_tier: str  # "UNDER_100", "100_TO_250", "250_TO_500"
    budget_tier_label: str  # "Under ₹100", "₹100 - ₹250", "₹250 - ₹500"
    shares_per_5k: int
    target_price: float
    stop_loss: float
    potential_profit_5k: float
    potential_roi_percent: float
    beginner_summary: str
    direction: str  # "UP" or "DOWN"

class BudgetStocksResponse(BaseModel):
    scan_time: str
    total_count: int
    under_100_count: int
    under_250_count: int
    under_500_count: int
    stocks: List[BudgetStockItem]

class CandlePatternMatch(BaseModel):
    pattern_id: str
    pattern_name: str
    sentiment: str  # "BULLISH", "BEARISH", "NEUTRAL"
    pattern_type: str  # "REVERSAL", "CONTINUATION", "INDECISION"
    predicted_movement: str  # "STRONG_RISE", "MILD_RISE", "STRONG_FALL", "MILD_FALL", "SIDEWAYS"
    predicted_target: float
    invalidation_stop_loss: float
    expected_gain_percent: float
    confidence_score: int  # 0 - 100
    candle_time: str
    candle_index: int
    beginner_summary: str
    what_happened_explanation: str
    actionable_beginner_advice: str

class CandlePatternAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    active_pattern: Optional[CandlePatternMatch] = None
    detected_patterns: List[CandlePatternMatch] = []
    overall_sentiment: str = "NEUTRAL"
    overall_confidence: int = 50
    primary_prediction_text: str = ""
    timestamp: str

class SeniorAnalystVerdictResponse(BaseModel):
    symbol: str
    current_price: float
    timestamp: str
    is_market_open: bool = False
    
    # The Single Master Opinion
    verdict: str  # STRONG_BUY, MILD_BUY, AVOID_SELL, WAIT_CONSOLIDATION
    verdict_display: str
    verdict_badge_color: str  # emerald, rose, amber, slate
    conviction_percent: int
    
    # Single Source of Truth Targets
    target_price: float
    stop_loss: float
    expected_gain_percent: float
    risk_reward_ratio: float
    time_horizon_text: str
    
    # Senior Market Analyst Knowledge Synthesis
    senior_analyst_take: str
    candlestick_context: str
    action_advice: str
    
    # Supporting Checklist & Institutional Smart Money Insights
    confluence_checklist: List[Dict[str, Any]] = []
    active_candlestick_pattern: Optional[CandlePatternMatch] = None
    market_regime: str = "NEUTRAL"
    smart_money_insights: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: Optional[str] = None

class ChatContext(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    bse_price: Optional[float] = None
    change_percent: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    vwap: Optional[float] = None
    timeframe: Optional[str] = "5m"
    quantity: Optional[int] = None
    limit_price: Optional[float] = None
    product_type: Optional[str] = "INTRADAY"  # "INTRADAY", "DELIVERY", "MTF"
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    active_pattern: Optional[str] = None
    pattern_sentiment: Optional[str] = None
    senior_verdict: Optional[str] = None
    conviction_percent: Optional[int] = None
    senior_analyst_take: Optional[str] = None
    user_balance: Optional[float] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[ChatContext] = None
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    context_stock: Optional[str] = None
    suggested_chips: List[str] = []
    timestamp: str


