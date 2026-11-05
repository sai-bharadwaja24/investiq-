import pytest
from app.models.schemas import Candle, StockQuote
from app.prediction_engine.smart_money_engine import default_smart_money_engine


def test_fair_value_gap_consequent_encroachment():
    """Verify 3-candle FVG detection and 50% Consequent Encroachment (C.E.) calculation."""
    # Bullish FVG: c3.low > c1.high
    candles = [
        Candle(time="09:15", open=100.0, high=102.0, low=99.5, close=101.5, volume=1000),
        Candle(time="09:20", open=101.5, high=108.0, low=101.0, close=107.5, volume=5000),
        Candle(time="09:25", open=107.5, high=111.0, low=104.0, close=110.0, volume=3500),
    ]
    fvgs = default_smart_money_engine.detect_fair_value_gaps(candles)
    assert len(fvgs) >= 1
    fvg = fvgs[0]
    assert fvg.fvg_type == "BULLISH"
    assert fvg.bottom_price == 102.0  # c1.high
    assert fvg.top_price == 104.0     # c3.low
    # 50% midpoint C.E. = (102.0 + 104.0) / 2 = 103.0
    assert fvg.consequent_encroachment == 103.0


def test_order_block_and_volume_delta():
    """Verify Order Block detection and >= 60% Volume Delta rule."""
    candles = [
        Candle(time="09:15", open=100.0, high=101.0, low=99.0, close=100.5, volume=1000),
        Candle(time="09:20", open=100.5, high=101.0, low=98.5, close=98.8, volume=1500),  # Red OB candle
        Candle(time="09:25", open=98.8, high=103.0, low=98.8, close=102.8, volume=6000),   # Impulse green
        Candle(time="09:30", open=102.8, high=106.0, low=102.5, close=105.5, volume=8000),  # BOS green
    ]
    obs = default_smart_money_engine.detect_order_blocks(candles)
    assert len(obs) >= 1
    ob = obs[0]
    assert ob.block_type == "BULLISH_DEMAND"
    assert ob.is_valid_volume is True
    assert ob.volume_delta_pct >= 60.0


def test_vsa_institutional_absorption_wall():
    """Verify VSA flags narrow-range candle on heavy volume as smart money absorption wall."""
    candles = [
        Candle(time="09:15", open=100.0, high=101.0, low=99.0, close=100.5, volume=1000),
        Candle(time="09:20", open=100.5, high=105.0, low=100.0, close=104.5, volume=2000),
        # Narrow-range Doji at day high with massive volume
        Candle(time="09:25", open=104.8, high=105.0, low=104.4, close=104.85, volume=8000),
    ]
    vsa = default_smart_money_engine.analyze_vsa(candles, rvol=2.2)
    assert vsa.is_absorption_wall is True
    assert vsa.status == "INSTITUTIONAL_ABSORPTION_WALL"
    assert "SELLER_ABSORBING_AT_HIGH" in vsa.absorption_side


def test_location_principle_no_middle_zone():
    """Verify that trades inside middle 40% of day's range are flagged as chop zone."""
    quote_middle = StockQuote(
        symbol="TATASTEEL",
        ticker="TATASTEEL.NS",
        name="Tata Steel Ltd",
        price=185.0,
        change=0.5,
        change_percent=0.27,
        open=184.5,
        high=190.0,
        low=180.0,
        previous_close=184.5,
        volume=100000,
        is_market_open=True,
        timestamp="10:00:00"
    )
    loc = default_smart_money_engine.evaluate_location_principle(quote_middle)
    assert loc.zone == "MIDDLE_CHOP_ZONE"
    assert loc.is_tradeable_edge is False
    assert "NO-MIDDLE-ZONE RULE" in loc.warning_message

    # At day high (edge)
    quote_edge = StockQuote(
        symbol="TATASTEEL",
        ticker="TATASTEEL.NS",
        name="Tata Steel Ltd",
        price=189.2,
        change=4.7,
        change_percent=2.5,
        open=184.5,
        high=190.0,
        low=180.0,
        previous_close=184.5,
        volume=100000,
        is_market_open=True,
        timestamp="10:00:00"
    )
    loc_edge = default_smart_money_engine.evaluate_location_principle(quote_edge)
    assert loc_edge.zone == "RANGE_EXTREME_RESISTANCE"
    assert loc_edge.is_tradeable_edge is True


def test_heikin_ashi_flat_bottoms():
    """Verify Heikin Ashi trend detection for strong institutional thrust (zero lower wicks)."""
    candles = [
        Candle(time="09:15", open=100.0, high=102.0, low=100.0, close=102.0, volume=1000),
        Candle(time="09:20", open=102.0, high=104.0, low=102.0, close=104.0, volume=1200),
        Candle(time="09:25", open=104.0, high=106.0, low=104.0, close=106.0, volume=1500),
    ]
    ha = default_smart_money_engine.analyze_heikin_ashi(candles)
    assert ha.trend == "STRONG_BULL_FLAT_BOTTOMS"
    assert ha.has_flat_bottom is True
