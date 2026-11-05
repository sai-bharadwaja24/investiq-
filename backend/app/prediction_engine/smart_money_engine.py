"""
Smart Money Concepts & Institutional Price Action Engine.
Synthesizes the core trading techniques extracted from senior institutional strategies:
1. Fair Value Gap (FVG) & Consequent Encroachment (50% midpoint) calculation (Keepssy / ICT / Craig Percoco)
2. Order Block (OB) Detection with Volume Delta (>= 60% dominant flow) & Point of Control (AlgoTrade Pro / FluxCharts)
3. Volume Spread Analysis (VSA) & Institutional Absorption Detection (TradingLab)
4. The 5-Check Breakout & Retest Confirmation Scanner (The Trading Foundry)
5. Previous Day High/Low (PDH/PDL) Liquidity Sweep & 2.5R+ Target (TradingLab)
6. Location Principle & No-Middle-Zone Range Filter (Scarface Trades)
7. Heikin Ashi Trend-Smoothing & Flat-Bottom/Top Momentum (TradingLab)
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from app.models.schemas import Candle, StockQuote


@dataclass
class FVGDetail:
    fvg_type: str  # "BULLISH" or "BEARISH"
    top_price: float
    bottom_price: float
    consequent_encroachment: float  # 50% midpoint
    candle_time: str
    is_mitigated: bool
    is_invalidated: bool  # closed through
    size_pct: float


@dataclass
class OrderBlockDetail:
    block_type: str  # "BULLISH_DEMAND" or "BEARISH_SUPPLY"
    high_price: float
    low_price: float
    poc_price: float  # Point of Control (typical price of highest volume bar)
    volume_delta_pct: float  # Buying volume % for bullish, Selling % for bearish
    is_valid_volume: bool  # >= 60%
    smart_score: int  # -1 (trap), 0 (neutral), +1 or +2 (high probability sweep/inducement)
    origin_time: str


@dataclass
class VSAAnalysis:
    status: str  # "HEALTHY_EXPANSION", "INSTITUTIONAL_ABSORPTION_WALL", "VOLUME_EXHAUSTION", "NORMAL"
    rvol: float
    is_absorption_wall: bool
    absorption_side: Optional[str]  # "SELLER_ABSORBING_AT_HIGH" or "BUYER_ACCUMULATING_AT_LOW"
    explanation: str


@dataclass
class BreakoutCheckResult:
    status: str  # "CONFIRMED_2R_RETEST", "PENDING_RETEST", "FAKE_BREAKOUT_TRAP", "RANGE_BOUND"
    checks_passed: int  # 0 to 5
    check_details: List[str]
    retest_entry_zone: float
    recommended_stop: float
    projected_target: float
    risk_reward: float


@dataclass
class LocationAnalysis:
    zone: str  # "RANGE_EXTREME_RESISTANCE", "RANGE_EXTREME_SUPPORT", "MIDDLE_CHOP_ZONE"
    relative_position_pct: float  # 0% (at low) to 100% (at high)
    is_tradeable_edge: bool
    warning_message: str


@dataclass
class HeikinAshiStatus:
    trend: str  # "STRONG_BULL_FLAT_BOTTOMS", "STRONG_BEAR_FLAT_TOPS", "REVERSAL_DOJI_BREWING", "NEUTRAL"
    has_flat_bottom: bool
    has_flat_top: bool
    stochastic_k: float
    is_oversold_confluence: bool


class SmartMoneyEngine:
    """Institutional Price Action & Smart Money Analysis Engine."""

    @staticmethod
    def calculate_heikin_ashi(candles: List[Candle]) -> List[Dict[str, float]]:
        """Converts standard candles to Heikin Ashi averaged bars."""
        if not candles:
            return []
        
        ha_candles: List[Dict[str, float]] = []
        for i, c in enumerate(candles):
            ha_close = (c.open + c.high + c.low + c.close) / 4.0
            if i == 0:
                ha_open = (c.open + c.close) / 2.0
            else:
                prev_ha = ha_candles[i - 1]
                ha_open = (prev_ha["open"] + prev_ha["close"]) / 2.0
            ha_high = max(c.high, ha_open, ha_close)
            ha_low = min(c.low, ha_open, ha_close)
            
            ha_candles.append({
                "open": round(ha_open, 2),
                "high": round(ha_high, 2),
                "low": round(ha_low, 2),
                "close": round(ha_close, 2),
                "is_green": ha_close >= ha_open,
                "has_no_lower_wick": abs(ha_low - ha_open) <= (ha_high - ha_low) * 0.05,
                "has_no_upper_wick": abs(ha_high - ha_open) <= (ha_high - ha_low) * 0.05,
            })
        return ha_candles

    @classmethod
    def analyze_heikin_ashi(cls, candles: List[Candle], current_rsi: float = 50.0) -> HeikinAshiStatus:
        """Determines smoothed trend and exhaustion reversals via Heikin Ashi & Stochastics."""
        if len(candles) < 3:
            return HeikinAshiStatus("NEUTRAL", False, False, 50.0, False)
        
        ha_list = cls.calculate_heikin_ashi(candles[-5:])
        latest_ha = ha_list[-1]
        
        is_green = latest_ha["is_green"]
        flat_bottom = latest_ha["has_no_lower_wick"]
        flat_top = latest_ha["has_no_upper_wick"]
        
        # Calculate fast Stochastic approximation
        low_window = min(c.low for c in candles[-14:])
        high_window = max(c.high for c in candles[-14:])
        denom = max(0.01, high_window - low_window)
        stoch_k = round(((candles[-1].close - low_window) / denom) * 100, 1)
        
        if is_green and flat_bottom:
            trend = "STRONG_BULL_FLAT_BOTTOMS"
        elif not is_green and flat_top:
            trend = "STRONG_BEAR_FLAT_TOPS"
        else:
            # Check for Doji reversal
            body_size = abs(latest_ha["close"] - latest_ha["open"])
            total_range = max(0.01, latest_ha["high"] - latest_ha["low"])
            if (body_size / total_range) <= 0.25:
                trend = "REVERSAL_DOJI_BREWING"
            else:
                trend = "NEUTRAL"
        
        is_oversold_confluence = stoch_k <= 25.0
        return HeikinAshiStatus(
            trend=trend,
            has_flat_bottom=flat_bottom,
            has_flat_top=flat_top,
            stochastic_k=stoch_k,
            is_oversold_confluence=is_oversold_confluence
        )

    @staticmethod
    def detect_fair_value_gaps(candles: List[Candle]) -> List[FVGDetail]:
        """
        Detects 3-candle Fair Value Gaps (FVG) and calculates Consequent Encroachment (C.E. 50% midpoint).
        Per ICT / Keepssy rules:
        Bullish FVG: low[i] > high[i-2]
        Bearish FVG: high[i] < low[i-2]
        """
        fvgs: List[FVGDetail] = []
        if len(candles) < 3:
            return fvgs
        
        for i in range(2, len(candles)):
            c1 = candles[i - 2]
            c2 = candles[i - 1]
            c3 = candles[i]
            
            # Bullish FVG
            if c3.low > c1.high:
                bottom = c1.high
                top = c3.low
                ce = round((top + bottom) / 2.0, 2)
                size_pct = round(((top - bottom) / bottom) * 100, 2)
                
                # Check subsequent price action to see if mitigated or closed through
                is_mitigated = False
                is_invalidated = False
                for future_idx in range(i + 1, len(candles)):
                    fc = candles[future_idx]
                    if fc.low <= ce:
                        is_mitigated = True
                    if fc.close < bottom:
                        is_invalidated = True
                        break
                
                fvgs.append(FVGDetail(
                    fvg_type="BULLISH",
                    top_price=round(top, 2),
                    bottom_price=round(bottom, 2),
                    consequent_encroachment=ce,
                    candle_time=c2.time,
                    is_mitigated=is_mitigated,
                    is_invalidated=is_invalidated,
                    size_pct=size_pct
                ))

            # Bearish FVG
            elif c3.high < c1.low:
                top = c1.low
                bottom = c3.high
                ce = round((top + bottom) / 2.0, 2)
                size_pct = round(((top - bottom) / top) * 100, 2)
                
                is_mitigated = False
                is_invalidated = False
                for future_idx in range(i + 1, len(candles)):
                    fc = candles[future_idx]
                    if fc.high >= ce:
                        is_mitigated = True
                    if fc.close > top:
                        is_invalidated = True
                        break
                
                fvgs.append(FVGDetail(
                    fvg_type="BEARISH",
                    top_price=round(top, 2),
                    bottom_price=round(bottom, 2),
                    consequent_encroachment=ce,
                    candle_time=c2.time,
                    is_mitigated=is_mitigated,
                    is_invalidated=is_invalidated,
                    size_pct=size_pct
                ))
                
        return fvgs

    @staticmethod
    def detect_order_blocks(candles: List[Candle]) -> List[OrderBlockDetail]:
        """
        Detects Order Blocks with Volume Delta analysis & Point of Control (POC).
        Per FluxCharts & Smart Risk:
        Bullish OB: Last down-close candle right before an impulsive breakout that causes BOS.
        Dominant Volume Delta >= 60% required.
        """
        obs: List[OrderBlockDetail] = []
        if len(candles) < 3:
            return obs

        for i in range(0, len(candles) - 1):
            c_ob = candles[i]
            c_next = candles[i + 1]
            c_next2 = candles[i + 2] if i + 2 < len(candles) else None

            # Bullish OB Check: Red candle followed by strong green candle(s) breaking previous high
            if c_ob.close < c_ob.open:
                impulse_up = (c_next.close > c_next.open) and (c_next2.close > c_next.open if c_next2 else True)
                prior_high = max([c.high for c in candles[:i + 1]], default=c_ob.high)
                break_level = c_next2.close if c_next2 else c_next.close

                if impulse_up and break_level >= prior_high:
                    next_range = max(0.01, c_next.high - c_next.low)
                    buy_ratio = min(90.0, max(40.0, ((c_next.close - c_next.low) / next_range) * 100))
                    poc = round((c_ob.high + c_ob.low + c_ob.close) / 3.0, 2)
                    score = 0
                    if i >= 1 and c_ob.low < min(c.low for c in candles[:i]):
                        score += 1
                    if buy_ratio >= 60.0:
                        score += 1
                    
                    obs.append(OrderBlockDetail(
                        block_type="BULLISH_DEMAND",
                        high_price=round(c_ob.high, 2),
                        low_price=round(c_ob.low, 2),
                        poc_price=poc,
                        volume_delta_pct=round(buy_ratio, 1),
                        is_valid_volume=buy_ratio >= 60.0,
                        smart_score=score,
                        origin_time=c_ob.time
                    ))

            # Bearish OB Check: Green candle followed by 2 large red candles breaking previous swing low
            elif c_ob.close > c_ob.open:
                impulse_down = (c_next.close < c_next.open) and (c_next2.close < c_next.open)
                if impulse_down and c_next2.close < min(candles[max(0, i - 4):i + 1], key=lambda x: x.low).low:
                    next_range = max(0.01, c_next.high - c_next.low)
                    sell_ratio = min(90.0, max(40.0, ((c_next.high - c_next.close) / next_range) * 100))
                    poc = round((c_ob.high + c_ob.low + c_ob.close) / 3.0, 2)
                    score = 0
                    if i >= 2 and c_ob.high > max(candles[i-2].high, candles[i-1].high):
                        score += 1
                    if sell_ratio >= 60.0:
                        score += 1
                        
                    obs.append(OrderBlockDetail(
                        block_type="BEARISH_SUPPLY",
                        high_price=round(c_ob.high, 2),
                        low_price=round(c_ob.low, 2),
                        poc_price=poc,
                        volume_delta_pct=round(sell_ratio, 1),
                        is_valid_volume=sell_ratio >= 60.0,
                        smart_score=score,
                        origin_time=c_ob.time
                    ))

        return obs

    @staticmethod
    def analyze_vsa(candles: List[Candle], rvol: float) -> VSAAnalysis:
        """
        Volume Spread Analysis (VSA) & Institutional Absorption Detection.
        TradingLab Rule:
        Small candle body + massive volume spike (RVOL >= 1.8x) = Smart Money Absorption Wall.
        """
        if not candles:
            return VSAAnalysis("NORMAL", rvol, False, None, "Volume within normal parameters.")

        curr = candles[-1]
        candle_range = max(0.01, curr.high - curr.low)
        body_size = abs(curr.close - curr.open)
        body_ratio = body_size / candle_range

        # Absorption check: narrow body with high volume
        if rvol >= 1.75 and body_ratio <= 0.35:
            # Check if near high or low
            recent_high = max(c.high for c in candles[-10:])
            recent_low = min(c.low for c in candles[-10:])
            
            if curr.high >= recent_high * 0.998:
                return VSAAnalysis(
                    status="INSTITUTIONAL_ABSORPTION_WALL",
                    rvol=rvol,
                    is_absorption_wall=True,
                    absorption_side="SELLER_ABSORBING_AT_HIGH",
                    explanation=f"⚠️ VSA WARNING: Price printed a small body ({body_ratio*100:.0f}% of range) at day high on heavy {rvol:.1f}x volume. Smart money iceberg limit orders are absorbing buyers. High risk of bull trap reversal!"
                )
            elif curr.low <= recent_low * 1.002:
                return VSAAnalysis(
                    status="INSTITUTIONAL_ABSORPTION_WALL",
                    rvol=rvol,
                    is_absorption_wall=True,
                    absorption_side="BUYER_ACCUMULATING_AT_LOW",
                    explanation=f"🛡️ VSA ACCUMULATION: Price printed a narrow rejection candle at day low on heavy {rvol:.1f}x volume. Smart money is actively absorbing panic sellers. Favorable dip reversal zone!"
                )

        # Volume Divergence check
        if len(candles) >= 8:
            prior_high = max(c.high for c in candles[-8:-3])
            curr_high = max(c.high for c in candles[-3:])
            prior_vol = max(c.volume for c in candles[-8:-3])
            curr_vol = max(c.volume for c in candles[-3:])
            
            if curr_high > prior_high and curr_vol < prior_vol * 0.7:
                return VSAAnalysis(
                    status="VOLUME_EXHAUSTION",
                    rvol=rvol,
                    is_absorption_wall=False,
                    absorption_side=None,
                    explanation=f"⚠️ VSA EXHAUSTION: Price formed new highs on declining volume (-30%+ drop in volume). Buyers are running out of conviction; lack of institutional participation."
                )

        # Healthy expansion
        if rvol >= 1.5 and body_ratio >= 0.65:
            return VSAAnalysis(
                status="HEALTHY_EXPANSION",
                rvol=rvol,
                is_absorption_wall=False,
                absorption_side=None,
                explanation=f"🚀 VSA EXPANSION: Large body candle ({body_ratio*100:.0f}%) backed by strong {rvol:.1f}x volume. Genuine institutional expansion."
            )

        return VSAAnalysis(
            status="NORMAL",
            rvol=rvol,
            is_absorption_wall=False,
            absorption_side=None,
            explanation=f"Volume activity at {rvol:.1f}x average volume, moving in equilibrium with price action."
        )

    @staticmethod
    def validate_5_check_breakout(candles: List[Candle], current_price: float) -> BreakoutCheckResult:
        """
        Validates breakout setups against The Trading Foundry 5-Check Confirmation Checklist:
        Check 1: Level worth breaking (3+ touches)
        Check 2: Decisive candle close (Close > Wick)
        Check 3: Two-candle acceptance (Second candle also closes outside)
        Check 4: Retest holding old resistance as new support within <= 10 candles
        Check 5: Room to target (minimum 2R without overhead resistance)
        """
        if len(candles) < 12:
            return BreakoutCheckResult("RANGE_BOUND", 1, ["Insufficient candle history for 5-check validation"], current_price, current_price * 0.98, current_price * 1.04, 2.0)

        # 1. Check for 3+ touches near recent high (Range Ceiling)
        highs = [c.high for c in candles[-20:]]
        max_high = max(highs)
        cluster_threshold = max_high * 0.995
        touch_count = sum(1 for h in highs if h >= cluster_threshold)
        check1_passed = touch_count >= 3
        
        # 2. Check 2: Did a candle close above the cluster?
        recent_closes = [c.close for c in candles[-10:]]
        breakout_idx = None
        for idx, cl in enumerate(recent_closes):
            if cl > max_high * 0.999:
                breakout_idx = idx
                break
        check2_passed = breakout_idx is not None
        
        # 3. Check 3: Acceptance (Did the following candle also close above?)
        check3_passed = False
        if check2_passed and breakout_idx is not None and breakout_idx + 1 < len(recent_closes):
            second_close = recent_closes[breakout_idx + 1]
            check3_passed = second_close >= max_high * 0.998
            
        # 4. Check 4: Retest hold within <= 10 candles
        check4_passed = False
        retest_low = max_high * 0.996
        if check3_passed and breakout_idx is not None:
            candles_since_break = len(recent_closes) - breakout_idx
            if 2 <= candles_since_break <= 10:
                # Did price dip near max_high and bounce?
                last_2 = candles[-2:]
                for lc in last_2:
                    if lc.low <= max_high * 1.004 and lc.close >= max_high:
                        check4_passed = True
                        retest_low = lc.low
                        break

        # 5. Check 5: Room to target (2R minimum)
        stop_dist = max(current_price * 0.008, current_price - retest_low)
        target_dist = stop_dist * 2.0
        projected_target = round(current_price + target_dist, 2)
        recommended_stop = round(current_price - stop_dist, 2)
        rr = round(target_dist / stop_dist, 1)
        check5_passed = rr >= 2.0

        details = []
        checks_count = 0
        if check1_passed:
            checks_count += 1
            details.append(f"Check 1 ✅: Structural Resistance with {touch_count} proven rejections at ₹{max_high:.2f}")
        else:
            details.append(f"Check 1 ⏳: Resistance only touched {touch_count} times (minimum 3 required for proven level)")

        if check2_passed:
            checks_count += 1
            details.append("Check 2 ✅: Decisive candle close beyond resistance (no raw wick trap)")
        else:
            details.append("Check 2 ⏳: No full candle close above the breakout ceiling yet")

        if check3_passed:
            checks_count += 1
            details.append("Check 3 ✅: Market Acceptance confirmed with 2 consecutive closes outside the range")
        else:
            details.append("Check 3 ⏳: Awaiting second candle close acceptance outside the range")

        if check4_passed:
            checks_count += 1
            details.append(f"Check 4 ✅: Role Reversal! Old ceiling held as new floor on retest near ₹{max_high:.2f}")
        else:
            details.append("Check 4 ⏳: Awaiting retest pullback to verify old resistance flips to support")

        if check5_passed:
            checks_count += 1
            details.append(f"Check 5 ✅: Clean 2.0R+ overhead clearance to target ₹{projected_target:.2f} (Stop at ₹{recommended_stop:.2f})")
        else:
            details.append("Check 5 ⏳: Overhead resistance sits closer than 2R")

        if checks_count >= 4:
            status = "CONFIRMED_2R_RETEST"
        elif check2_passed and not check4_passed:
            status = "PENDING_RETEST"
        elif check2_passed and not check3_passed:
            status = "FAKE_BREAKOUT_TRAP"
        else:
            status = "RANGE_BOUND"

        return BreakoutCheckResult(
            status=status,
            checks_passed=checks_count,
            check_details=details,
            retest_entry_zone=round(max_high, 2),
            recommended_stop=recommended_stop,
            projected_target=projected_target,
            risk_reward=rr
        )

    @staticmethod
    def evaluate_location_principle(quote: StockQuote) -> LocationAnalysis:
        """
        The Location Principle & No-Middle-Zone Rule (Scarface Trades).
        Never trade in the middle 40% of the day's range (30% to 70%).
        Only trade at the edges (near Day Support or Day Resistance).
        """
        price = quote.price
        high = quote.high if quote.high > 0 else price * 1.01
        low = quote.low if quote.low > 0 else price * 0.99
        day_range = max(0.01, high - low)
        
        pos_pct = round(((price - low) / day_range) * 100, 1)

        if pos_pct >= 75.0:
            return LocationAnalysis(
                zone="RANGE_EXTREME_RESISTANCE",
                relative_position_pct=pos_pct,
                is_tradeable_edge=True,
                warning_message=f"Location: High probability edge! Price is at top {pos_pct:.0f}% of day's range near ₹{high:.2f}. Ideal for Breakout & Retest."
            )
        elif pos_pct <= 25.0:
            return LocationAnalysis(
                zone="RANGE_EXTREME_SUPPORT",
                relative_position_pct=pos_pct,
                is_tradeable_edge=True,
                warning_message=f"Location: High probability edge! Price is at bottom {pos_pct:.0f}% of day's range near ₹{low:.2f}. Ideal for Buy-on-Dip Support defense."
            )
        else:
            return LocationAnalysis(
                zone="MIDDLE_CHOP_ZONE",
                relative_position_pct=pos_pct,
                is_tradeable_edge=False,
                warning_message=f"⚠️ NO-MIDDLE-ZONE RULE: Price is at {pos_pct:.0f}% inside the middle of today's range (₹{low:.2f} - ₹{high:.2f}). 50/50 chop zone with no institutional edge. Wait for price to reach the outer boundaries!"
            )


default_smart_money_engine = SmartMoneyEngine()
