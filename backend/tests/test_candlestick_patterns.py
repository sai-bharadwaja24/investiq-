import pytest
from app.models.schemas import Candle
from app.prediction_engine.candlestick_patterns import default_pattern_detector

def test_detect_bullish_hammer():
    # Downward leg, followed by a hammer candle
    candles = [
        Candle(time='09:15', open=105.0, high=105.5, low=102.0, close=102.5, volume=10000),
        Candle(time='09:20', open=102.5, high=103.0, low=100.0, close=100.5, volume=12000),
        # Hammer: small body near top, long lower wick >= 2x body
        Candle(time='09:25', open=100.5, high=101.5, low=95.0, close=101.2, volume=25000),
    ]
    res = default_pattern_detector.analyze('TEST', candles, timeframe='5m')
    assert res.active_pattern is not None
    assert res.active_pattern.pattern_id == 'HAMMER'
    assert res.active_pattern.sentiment == 'BULLISH'
    assert res.active_pattern.predicted_movement == 'STRONG_RISE'
    assert res.active_pattern.predicted_target > 101.2
    assert res.active_pattern.invalidation_stop_loss < 96.0
    assert 'hammer' in res.active_pattern.beginner_summary.lower()

def test_detect_bullish_engulfing():
    candles = [
        Candle(time='09:15', open=105.0, high=105.5, low=103.0, close=103.5, volume=10000),
        # Red candle
        Candle(time='09:20', open=103.5, high=103.8, low=100.5, close=101.0, volume=12000),
        # Green candle completely engulfing previous red body
        Candle(time='09:25', open=100.8, high=105.0, low=100.5, close=104.5, volume=35000),
    ]
    res = default_pattern_detector.analyze('TEST', candles, timeframe='5m')
    assert res.active_pattern is not None
    assert res.active_pattern.pattern_id == 'BULLISH_ENGULFING'
    assert res.active_pattern.sentiment == 'BULLISH'
    assert res.active_pattern.predicted_target > 104.5

def test_detect_shooting_star():
    candles = [
        Candle(time='09:15', open=100.0, high=102.5, low=99.8, close=102.0, volume=10000),
        Candle(time='09:20', open=102.0, high=104.5, low=101.8, close=104.0, volume=12000),
        # Shooting star: small lower body, long upper wick >= 2x body
        Candle(time='09:25', open=104.0, high=110.0, low=103.5, close=104.2, volume=28000),
    ]
    res = default_pattern_detector.analyze('TEST', candles, timeframe='5m')
    assert res.active_pattern is not None
    assert res.active_pattern.pattern_id == 'SHOOTING_STAR'
    assert res.active_pattern.sentiment == 'BEARISH'
    assert res.active_pattern.predicted_movement == 'STRONG_FALL'
    assert res.active_pattern.predicted_target < 104.0
