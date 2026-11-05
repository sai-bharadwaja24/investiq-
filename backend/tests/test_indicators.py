import pytest
import pandas as pd
import numpy as np
from app.technical.indicators import TechnicalAnalyzer

def test_sma_calculation():
    series = pd.Series([10.0, 20.0, 30.0, 40.0, 50.0])
    sma = TechnicalAnalyzer.calculate_sma(series, 3)
    assert np.isclose(sma.iloc[-1], 40.0), f"Expected 40.0, got {sma.iloc[-1]}"

def test_rsi_bounds():
    # Uptrend
    series_up = pd.Series([float(i) for i in range(1, 30)])
    rsi_up = TechnicalAnalyzer.calculate_rsi(series_up, 14)
    assert 0.0 <= rsi_up.iloc[-1] <= 100.0
    assert rsi_up.iloc[-1] > 70.0, "Uptrend should have high RSI"

    # Downtrend
    series_down = pd.Series([float(30 - i) for i in range(1, 30)])
    rsi_down = TechnicalAnalyzer.calculate_rsi(series_down, 14)
    assert 0.0 <= rsi_down.iloc[-1] <= 100.0
    assert rsi_down.iloc[-1] < 30.0, "Downtrend should have low RSI"

def test_bollinger_bands():
    series = pd.Series([100.0 + np.sin(i) * 5 for i in range(50)])
    upper, mid, lower, bw, pct_b = TechnicalAnalyzer.calculate_bollinger_bands(series, 20, 2.0)
    assert (upper >= mid).all(), "Upper band must be >= middle band"
    assert (mid >= lower).all(), "Middle band must be >= lower band"
