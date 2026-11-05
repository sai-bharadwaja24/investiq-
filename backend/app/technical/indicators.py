import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.models.schemas import Candle, TechnicalIndicatorValue

class TechnicalAnalyzer:
    @staticmethod
    def candles_to_df(candles: List[Candle]) -> pd.DataFrame:
        if not candles:
            return pd.DataFrame(columns=["open", "high", "low", "close", "volume", "vwap"])
        data = {
            "time": [c.time for c in candles],
            "open": [c.open for c in candles],
            "high": [c.high for c in candles],
            "low": [c.low for c in candles],
            "close": [c.close for c in candles],
            "volume": [c.volume for c in candles],
            "vwap": [c.vwap for c in candles],
        }
        return pd.DataFrame(data)

    @staticmethod
    def calculate_sma(series: pd.Series, period: int = 20) -> pd.Series:
        return series.rolling(window=period, min_periods=1).mean()

    @staticmethod
    def calculate_ema(series: pd.Series, period: int = 20) -> pd.Series:
        return series.ewm(span=period, adjust=False).mean()

    @staticmethod
    def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period, min_periods=1).mean()
        rs = gain / (loss + 1e-9)
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50.0)

    @staticmethod
    def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
        ema_fast = TechnicalAnalyzer.calculate_ema(series, fast)
        ema_slow = TechnicalAnalyzer.calculate_ema(series, slow)
        macd_line = ema_fast - ema_slow
        signal_line = TechnicalAnalyzer.calculate_ema(macd_line, signal)
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram

    @staticmethod
    def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
        high = df["high"]
        low = df["low"]
        close_prev = df["close"].shift(1).fillna(df["open"])
        
        tr1 = high - low
        tr2 = (high - close_prev).abs()
        tr3 = (low - close_prev).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        return tr.rolling(window=period, min_periods=1).mean()

    @staticmethod
    def calculate_bollinger_bands(series: pd.Series, period: int = 20, num_std: float = 2.0):
        sma = series.rolling(window=period, min_periods=1).mean()
        std = series.rolling(window=period, min_periods=1).std().fillna(0)
        upper = sma + (std * num_std)
        lower = sma - (std * num_std)
        bandwidth = (upper - lower) / (sma + 1e-9)
        pct_b = (series - lower) / (upper - lower + 1e-9)
        return upper, sma, lower, bandwidth, pct_b

    @staticmethod
    def calculate_vwap(df: pd.DataFrame) -> pd.Series:
        typical_price = (df["high"] + df["low"] + df["close"]) / 3.0
        cum_vol_price = (typical_price * df["volume"]).cumsum()
        cum_vol = df["volume"].cumsum() + 1e-9
        return cum_vol_price / cum_vol

    @staticmethod
    def resample_bars_chunk(df: pd.DataFrame, chunk_size: int) -> pd.DataFrame:
        """Resamples 5m bars into higher timeframe chunks (3 bars = 15m, 12 bars = 1H)."""
        if len(df) < chunk_size:
            return df.copy()
        n = len(df)
        group_ids = [i // chunk_size for i in range(n)]
        df_grouped = df.copy()
        df_grouped["_group"] = group_ids
        
        agg_rules = {
            "open": "first",
            "high": "max",
            "low": "min",
            "close": "last",
            "volume": "sum"
        }
        return df_grouped.groupby("_group").agg(agg_rules).reset_index(drop=True)

    @staticmethod
    def extract_features(candles: List[Candle]) -> Dict[str, Any]:
        df = TechnicalAnalyzer.candles_to_df(candles)
        if len(df) < 5:
            return {}

        close = df["close"]
        current_close = float(close.iloc[-1])
        
        # Moving averages
        ema_9 = TechnicalAnalyzer.calculate_ema(close, 9).iloc[-1]
        ema_21 = TechnicalAnalyzer.calculate_ema(close, 21).iloc[-1]
        ema_50 = TechnicalAnalyzer.calculate_ema(close, 50).iloc[-1]
        sma_200 = TechnicalAnalyzer.calculate_sma(close, min(200, len(close))).iloc[-1]
        
        # VWAP
        vwap_series = TechnicalAnalyzer.calculate_vwap(df)
        current_vwap = float(vwap_series.iloc[-1])
        vwap_distance_pct = round(((current_close - current_vwap) / current_vwap) * 100, 2)
        
        # RSI
        rsi_series = TechnicalAnalyzer.calculate_rsi(close, 14)
        current_rsi = round(float(rsi_series.iloc[-1]), 1)
        
        # MACD
        macd_l, signal_l, hist = TechnicalAnalyzer.calculate_macd(close)
        current_macd_hist = round(float(hist.iloc[-1]), 2)
        macd_bullish = current_macd_hist > 0
        
        # ATR
        atr_series = TechnicalAnalyzer.calculate_atr(df, 14)
        current_atr = round(float(atr_series.iloc[-1]), 2)
        atr_pct = round((current_atr / current_close) * 100, 2)
        
        # Bollinger Bands
        upper_bb, mid_bb, lower_bb, bw, pct_b = TechnicalAnalyzer.calculate_bollinger_bands(close, 20)
        current_pct_b = round(float(pct_b.iloc[-1]), 2)
        
        # Volume & RVOL
        vol_ma = df["volume"].rolling(20, min_periods=1).mean().iloc[-1]
        current_vol = float(df["volume"].iloc[-1])
        rvol = round(current_vol / (vol_ma + 1e-9), 2)
        
        # Continuous Feature Scaling (ATR normalized & log-scaled volume)
        vwap_dist_atr = round((current_close - current_vwap) / (current_atr + 1e-9), 3)
        rvol_log2 = float(np.log2(max(0.05, rvol)))
        rvol_deadband = 0.0 if abs(rvol_log2) < 0.25 else round(rvol_log2, 3)
        rsi_continuous = round((current_rsi - 50.0) / 10.0, 3)
        macd_atr = round(current_macd_hist / (current_atr + 1e-9), 3)
        ema_slope_atr = round((ema_9 - ema_21) / (current_atr + 1e-9), 3)

        # Real Multi-Timeframe Resampling (15m and 1H)
        df_15m = TechnicalAnalyzer.resample_bars_chunk(df, 3)
        df_1h = TechnicalAnalyzer.resample_bars_chunk(df, 12)
        
        # 15m Indicators
        close_15m = df_15m["close"]
        rsi_15m = float(TechnicalAnalyzer.calculate_rsi(close_15m, min(14, len(close_15m))).iloc[-1])
        ema_20_15m = float(TechnicalAnalyzer.calculate_ema(close_15m, min(20, len(close_15m))).iloc[-1])
        last_close_15m = float(close_15m.iloc[-1])
        mtf_15m_bias = "BULLISH" if last_close_15m > ema_20_15m and rsi_15m >= 50 else "BEARISH" if last_close_15m < ema_20_15m and rsi_15m <= 50 else "NEUTRAL"

        # 1H Indicators
        close_1h = df_1h["close"]
        rsi_1h = float(TechnicalAnalyzer.calculate_rsi(close_1h, min(14, len(close_1h))).iloc[-1])
        ema_20_1h = float(TechnicalAnalyzer.calculate_ema(close_1h, min(20, len(close_1h))).iloc[-1])
        last_close_1h = float(close_1h.iloc[-1])
        mtf_1h_bias = "BULLISH" if last_close_1h > ema_20_1h and rsi_1h >= 50 else "BEARISH" if last_close_1h < ema_20_1h and rsi_1h <= 50 else "NEUTRAL"

        # Candle shape
        curr_open = float(df["open"].iloc[-1])
        curr_high = float(df["high"].iloc[-1])
        curr_low = float(df["low"].iloc[-1])
        body_size = abs(current_close - curr_open)
        total_range = curr_high - curr_low + 1e-9
        body_ratio = round(body_size / total_range, 2)
        upper_wick = round((curr_high - max(curr_open, current_close)) / total_range, 2)
        lower_wick = round((min(curr_open, current_close) - curr_low) / total_range, 2)
        
        # Trend score (0 to 100)
        trend_signals = [
            current_close > current_vwap,
            current_close > ema_9,
            ema_9 > ema_21,
            ema_21 > ema_50,
            current_rsi > 50,
            macd_bullish,
            rvol > 1.0,
            current_pct_b > 0.5
        ]
        bullish_count = sum(trend_signals)
        technical_score = int((bullish_count / len(trend_signals)) * 100)
        
        return {
            "current_price": current_close,
            "vwap": current_vwap,
            "vwap_distance_pct": vwap_distance_pct,
            "vwap_dist_atr": vwap_dist_atr,
            "rvol_log2": rvol_log2,
            "rvol_deadband": rvol_deadband,
            "rsi_continuous": rsi_continuous,
            "macd_atr": macd_atr,
            "ema_slope_atr": ema_slope_atr,
            "ema_9": round(float(ema_9), 2),
            "ema_21": round(float(ema_21), 2),
            "ema_50": round(float(ema_50), 2),
            "sma_200": round(float(sma_200), 2),
            "rsi_14": current_rsi,
            "macd_hist": current_macd_hist,
            "atr_14": current_atr,
            "atr_pct": atr_pct,
            "bb_upper": round(float(upper_bb.iloc[-1]), 2),
            "bb_lower": round(float(lower_bb.iloc[-1]), 2),
            "pct_b": current_pct_b,
            "rvol": rvol,
            "body_ratio": body_ratio,
            "upper_wick": upper_wick,
            "lower_wick": lower_wick,
            "technical_score": technical_score,
            "is_above_vwap": current_close >= current_vwap,
            "is_ema_aligned_bullish": ema_9 >= ema_21 >= ema_50,
            "is_ema_aligned_bearish": ema_9 <= ema_21 <= ema_50,
            "mtf_15m": mtf_15m_bias,
            "mtf_1h": mtf_1h_bias,
        }
