import pytest
from app.trade_monitor.timed_exit import TimedExitAdvisor

def test_timed_exit_still_bullish():
    features = {
        "technical_score": 75,
        "rsi_14": 62.0,
        "is_above_vwap": True,
        "macd_hist": 1.2,
        "rvol": 1.4,
        "atr_14": 20.0
    }
    res = TimedExitAdvisor.evaluate_active_trade(
        symbol="RELIANCE",
        entry_price=2900.0,
        entry_time_str="10:00 AM",
        current_price=2925.0,
        features=features,
        initial_horizon_minutes=30
    )
    assert res.state == "STILL_BULLISH"
    assert res.recommended_action == "HOLD"
    assert res.current_pnl == 25.0
    assert res.recommended_trailing_stop > 2900.0, "Trailing stop should lock in profit"
    assert "IST" in res.recommended_exit_clock_time

def test_timed_exit_reversal():
    features = {
        "technical_score": 25,
        "rsi_14": 38.0,
        "is_above_vwap": False,
        "macd_hist": -1.8,
        "rvol": 1.8,
        "atr_14": 22.0
    }
    res = TimedExitAdvisor.evaluate_active_trade(
        symbol="RELIANCE",
        entry_price=2900.0,
        entry_time_str="10:00 AM",
        current_price=2895.0,
        features=features,
        initial_horizon_minutes=30
    )
    assert res.state == "REVERSAL"
    assert res.recommended_action == "IMMEDIATE_EXIT"
    assert res.urgency == "CRITICAL"
    assert res.countdown_seconds is not None and res.countdown_seconds <= 180
