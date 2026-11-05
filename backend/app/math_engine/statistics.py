import numpy as np
import pandas as pd
from typing import Dict, Any, List
from scipy import stats

class MathEngine:
    @staticmethod
    def calculate_returns(prices: List[float], log: bool = False) -> np.ndarray:
        p = np.array(prices, dtype=float)
        if len(p) < 2:
            return np.array([])
        if log:
            return np.diff(np.log(p))
        return (p[1:] - p[:-1]) / (p[:-1] + 1e-9)

    @staticmethod
    def calculate_descriptive_stats(prices: List[float]) -> Dict[str, Any]:
        p = np.array(prices, dtype=float)
        if len(p) < 5:
            return {}
            
        returns = MathEngine.calculate_returns(prices)
        if len(returns) == 0:
            return {}

        mean_ret = float(np.mean(returns))
        median_ret = float(np.median(returns))
        std_ret = float(np.std(returns, ddof=1)) if len(returns) > 1 else 0.0
        var_ret = float(np.var(returns, ddof=1)) if len(returns) > 1 else 0.0
        skew = float(stats.skew(returns)) if len(returns) > 2 else 0.0
        kurt = float(stats.kurtosis(returns)) if len(returns) > 3 else 0.0
        
        # Percentiles
        p5, p25, p75, p95 = np.percentile(returns, [5, 25, 75, 95])
        
        # Z-score of latest return
        latest_ret = returns[-1]
        z_score = float((latest_ret - mean_ret) / (std_ret + 1e-9))
        
        # Intraday rolling volatility (annualized assuming 75 5-min candles per trading day * 252 days)
        annualized_vol = float(std_ret * np.sqrt(75 * 252) * 100)

        return {
            "mean_return": round(mean_ret * 100, 4),
            "median_return": round(median_ret * 100, 4),
            "std_deviation": round(std_ret * 100, 4),
            "variance": round(var_ret, 6),
            "skewness": round(skew, 2),
            "kurtosis": round(kurt, 2),
            "p5_return": round(float(p5) * 100, 3),
            "p25_return": round(float(p25) * 100, 3),
            "p75_return": round(float(p75) * 100, 3),
            "p95_return": round(float(p95) * 100, 3),
            "latest_z_score": round(z_score, 2),
            "annualized_volatility_pct": round(annualized_vol, 2),
            "is_fat_tailed": kurt > 3.0,
            "has_negative_skew": skew < -0.5
        }
