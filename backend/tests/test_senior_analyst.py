import pytest
from app.models.schemas import (
    StockQuote,
    CandlePatternAnalysisResponse,
    CandlePatternMatch
)
from app.ml_engine.models import IntradayMLPredictor
from app.prediction_engine.senior_analyst import default_senior_analyst

def test_senior_analyst_zaggle_counter_trend_trap():
    """
    Verifies that when a stock is below VWAP with an 88% DOWN ML signal,
    a minor bullish candlestick pattern (e.g., Inverted Hammer) is NOT presented
    as a buy recommendation, but as an AVOID_SELL / Retail Bounce Trap.
    """
    quote = StockQuote(
        symbol="ZAGGLE",
        ticker="ZAGGLE.NS",
        name="Zaggle Prepaid Ocean Services",
        price=179.50,
        change=-3.20,
        change_percent=-1.75,
        open=182.70,
        high=183.10,
        low=178.80,
        previous_close=182.70,
        volume=1250000,
        timestamp="15:30:00"
    )
    
    features = {
        "is_above_vwap": False,
        "vwap_distance_pct": -1.85,
        "vwap": 182.80,
        "rsi_14": 36.5,
        "rvol": 1.85,
        "is_ema_aligned_bearish": True,
        "is_ema_aligned_bullish": False,
        "macd_hist": -0.8,
        "technical_score": 25,
        "atr_14": 1.60
    }
    
    historical_stats = {
        "sample_size": 30,
        "up_frequency": 0.15,
        "down_frequency": 0.85,
        "avg_return_up": 0.4,
        "avg_return_down": -1.6
    }
    
    ml_prediction = IntradayMLPredictor.predict(
        symbol=quote.symbol,
        current_price=quote.price,
        features=features,
        historical_stats=historical_stats,
        horizon_minutes=30
    )
    
    candlestick_analysis = CandlePatternAnalysisResponse(
        symbol="ZAGGLE",
        timeframe="5m",
        current_price=179.50,
        active_pattern=CandlePatternMatch(
            pattern_id="INVERTED_HAMMER",
            pattern_name="Inverted Hammer",
            sentiment="BULLISH",
            pattern_type="REVERSAL",
            predicted_movement="MILD_RISE",
            predicted_target=179.90,
            invalidation_stop_loss=178.80,
            expected_gain_percent=0.22,
            confidence_score=55,
            candle_time="15:15",
            candle_index=79,
            beginner_summary="Buyers pushed higher but sellers responded.",
            what_happened_explanation="Upper shadow shows early buying absorbed by supply.",
            actionable_beginner_advice="Do not chase without VWAP confirmation."
        ),
        detected_patterns=[],
        overall_sentiment="BULLISH",
        overall_confidence=55,
        primary_prediction_text="Mild upward bounce attempt",
        timestamp="15:20"
    )
    
    verdict = default_senior_analyst.evaluate(quote, features, ml_prediction, candlestick_analysis)
    
    # Must NOT advise buying
    assert verdict.verdict == "AVOID_SELL"
    assert verdict.conviction_percent >= 70
    assert "trap" in verdict.senior_analyst_take.lower() or "avoid" in verdict.action_advice.lower()
    assert "counter-trend trap" in verdict.candlestick_context.lower()
    assert verdict.target_price < quote.price
    assert verdict.stop_loss > quote.price


def test_senior_analyst_bullish_confluence():
    """
    Verifies that when macro trend (above VWAP, EMA bullish, UP prediction)
    aligns with a bullish candlestick pattern, the engine issues a strong BUY consensus.
    """
    quote = StockQuote(
        symbol="RELIANCE",
        ticker="RELIANCE.NS",
        name="Reliance Industries",
        price=2950.0,
        change=45.0,
        change_percent=1.55,
        open=2910.0,
        high=2960.0,
        low=2905.0,
        previous_close=2905.0,
        volume=3500000,
        timestamp="11:30:00"
    )
    
    features = {
        "is_above_vwap": True,
        "vwap_distance_pct": 1.5,
        "vwap": 2915.0,
        "rsi_14": 65.0,
        "rvol": 1.8,
        "is_ema_aligned_bearish": False,
        "is_ema_aligned_bullish": True,
        "macd_hist": 1.2,
        "technical_score": 75,
        "atr_14": 25.0
    }
    
    historical_stats = {
        "sample_size": 40,
        "up_frequency": 0.80,
        "down_frequency": 0.20,
        "avg_return_up": 1.8,
        "avg_return_down": -0.6
    }
    
    ml_prediction = IntradayMLPredictor.predict(
        symbol=quote.symbol,
        current_price=quote.price,
        features=features,
        historical_stats=historical_stats,
        horizon_minutes=30
    )
    
    candlestick_analysis = CandlePatternAnalysisResponse(
        symbol="RELIANCE",
        timeframe="5m",
        current_price=2950.0,
        active_pattern=CandlePatternMatch(
            pattern_id="HAMMER",
            pattern_name="Hammer",
            sentiment="BULLISH",
            pattern_type="REVERSAL",
            predicted_movement="STRONG_RISE",
            predicted_target=2985.0,
            invalidation_stop_loss=2930.0,
            expected_gain_percent=1.2,
            confidence_score=78,
            candle_time="11:30",
            candle_index=79,
            beginner_summary="Strong dip buying witnessed.",
            what_happened_explanation="Lower wick shows aggressive buyers pushing price back up.",
            actionable_beginner_advice="Look for entry on breakout."
        ),
        detected_patterns=[],
        overall_sentiment="BULLISH",
        overall_confidence=78,
        primary_prediction_text="Bullish reversal confirmation",
        timestamp="11:35"
    )
    
    verdict = default_senior_analyst.evaluate(quote, features, ml_prediction, candlestick_analysis)
    
    assert verdict.verdict == "STRONG_BUY"
    assert verdict.conviction_percent >= 75
    assert verdict.target_price > quote.price
    assert verdict.stop_loss < quote.price
    assert verdict.risk_reward_ratio > 1.0
