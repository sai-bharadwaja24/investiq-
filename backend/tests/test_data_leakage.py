import pytest
import numpy as np
from app.models.schemas import Candle
from app.technical.indicators import TechnicalAnalyzer

def test_zero_lookahead_bias():
    """
    CRITICAL FINANCIAL INTEGRITY TEST:
    Verify that appending a future candle with wild movements does NOT
    retrospectively alter the features calculated at timestamp T.
    """
    base_candles = [
        Candle(time=f"10:{i:02d}", open=100.0 + i*0.5, high=101.0 + i*0.5, low=99.5 + i*0.5, close=100.5 + i*0.5, volume=10000, vwap=100.2 + i*0.5)
        for i in range(20)
    ]
    
    # Feature extraction at time T (bar 20)
    features_at_T = TechnicalAnalyzer.extract_features(base_candles)
    
    # Now simulate future candle at time T+1 with an extreme shock (e.g. price drops 50%)
    future_candle = Candle(time="10:21", open=110.0, high=111.0, low=50.0, close=55.0, volume=500000, vwap=70.0)
    
    # If we inspect the values computed at index 19 (time T) in a rolling calculation,
    # they must remain IDENTICAL.
    df_before = TechnicalAnalyzer.candles_to_df(base_candles)
    ema_before = TechnicalAnalyzer.calculate_ema(df_before["close"], 9).iloc[-1]
    rsi_before = TechnicalAnalyzer.calculate_rsi(df_before["close"], 14).iloc[-1]
    
    expanded_candles = base_candles + [future_candle]
    df_after = TechnicalAnalyzer.candles_to_df(expanded_candles)
    ema_at_T_after_future_added = TechnicalAnalyzer.calculate_ema(df_after["close"], 9).iloc[-2]
    rsi_at_T_after_future_added = TechnicalAnalyzer.calculate_rsi(df_after["close"], 14).iloc[-2]
    
    assert np.isclose(ema_before, ema_at_T_after_future_added, atol=1e-6), "Data leakage! EMA changed based on future candle!"
    assert np.isclose(rsi_before, rsi_at_T_after_future_added, atol=1e-6), "Data leakage! RSI changed based on future candle!"
