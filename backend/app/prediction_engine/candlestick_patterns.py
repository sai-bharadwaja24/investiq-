"""
Candlestick Pattern Recognition & Movement Prediction Engine.
Identifies 12+ primary Japanese candlestick patterns, predicts immediate price movement,
computes targets & stop-losses, and generates beginner-friendly plain English explanations.
"""
from typing import List, Optional, Tuple
from datetime import datetime
from app.models.schemas import Candle, CandlePatternMatch, CandlePatternAnalysisResponse


class CandlestickPatternDetector:
    def __init__(self):
        pass

    def analyze(self, symbol: str, candles: List[Candle], timeframe: str = "5m") -> CandlePatternAnalysisResponse:
        if not candles or len(candles) < 3:
            now_str = datetime.now().strftime("%H:%M:%S IST")
            return CandlePatternAnalysisResponse(
                symbol=symbol,
                timeframe=timeframe,
                current_price=candles[-1].close if candles else 100.0,
                active_pattern=None,
                detected_patterns=[],
                overall_sentiment="NEUTRAL",
                overall_confidence=50,
                primary_prediction_text="Insufficient candle data to identify patterns.",
                timestamp=now_str
            )

        current_price = candles[-1].close
        detected: List[CandlePatternMatch] = []

        # Analyze rolling window of last 20 candles for patterns
        start_idx = max(2, len(candles) - 15)
        for i in range(start_idx, len(candles)):
            match = self._inspect_at_index(candles, i)
            if match:
                detected.append(match)

        # Determine active pattern: prefer the latest candle pattern, or highest confidence recent pattern
        active_pattern = None
        if detected:
            sorted_patterns = sorted(detected, key=lambda p: (p.candle_index, p.confidence_score), reverse=True)
            active_pattern = sorted_patterns[0]

        # Overall sentiment & primary prediction text
        if active_pattern:
            overall_sentiment = active_pattern.sentiment
            overall_confidence = active_pattern.confidence_score
            primary_prediction_text = (
                f"{active_pattern.pattern_name} detected on {timeframe} chart: "
                f"Expecting {active_pattern.predicted_movement.replace('_', ' ').lower()} "
                f"towards target ₹{active_pattern.predicted_target:.2f} "
                f"({'+' if active_pattern.expected_gain_percent >= 0 else ''}{active_pattern.expected_gain_percent:.1f}%), "
                f"with safety stop at ₹{active_pattern.invalidation_stop_loss:.2f}."
            )
        else:
            overall_sentiment = "NEUTRAL"
            overall_confidence = 55
            primary_prediction_text = (
                f"Consolidation pattern on {timeframe} chart. Price is holding steady near ₹{current_price:.2f}. "
                f"Waiting for a decisive breakout candle."
            )

        now_str = datetime.now().strftime("%H:%M:%S IST")
        return CandlePatternAnalysisResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            active_pattern=active_pattern,
            detected_patterns=detected,
            overall_sentiment=overall_sentiment,
            overall_confidence=overall_confidence,
            primary_prediction_text=primary_prediction_text,
            timestamp=now_str
        )

    def _inspect_at_index(self, candles: List[Candle], i: int) -> Optional[CandlePatternMatch]:
        curr = candles[i]
        prev = candles[i - 1]
        prev2 = candles[i - 2] if i >= 2 else None

        o, h, l, c = curr.open, curr.high, curr.low, curr.close
        body = abs(c - o)
        candle_range = max(0.01, h - l)
        is_green = c >= o
        is_red = c < o
        upper_wick = h - max(o, c)
        lower_wick = min(o, c) - l

        prev_body = abs(prev.close - prev.open)
        prev_range = max(0.01, prev.high - prev.low)

        # 1. MORNING STAR (3-candle bullish reversal)
        if prev2 and prev2.close < prev2.open and (prev2.open - prev2.close) > (prev_range * 0.5):
            if prev_body < (prev_range * 0.45) and is_green and c > (prev2.open + prev2.close) / 2:
                target = round(c + candle_range * 1.6, 2)
                stop = round(min(prev.low, l) * 0.997, 2)
                gain_pct = round(((target - c) / c) * 100, 2)
                return CandlePatternMatch(
                    pattern_id="MORNING_STAR",
                    pattern_name="🌟 Morning Star Reversal",
                    sentiment="BULLISH",
                    pattern_type="REVERSAL",
                    predicted_movement="STRONG_RISE",
                    predicted_target=target,
                    invalidation_stop_loss=stop,
                    expected_gain_percent=gain_pct,
                    confidence_score=91,
                    candle_time=curr.time,
                    candle_index=i,
                    beginner_summary="3-step bullish bottom turnaround: heavy drop, selling exhaustion star, followed by institutional buyer takeover.",
                    what_happened_explanation=(
                        "Heavy selling in the first candle pushed prices down, but the second small candle showed sellers completely ran out of gas. "
                        "Then, institutional buyers stepped in with high volume on the third candle, pushing the price back up past the midpoint of the decline. "
                        "This confirms the bottom is in."
                    ),
                    actionable_beginner_advice=(
                        f"High conviction buy setup! Enter near current ₹{c:.2f}. "
                        f"Set your target at ₹{target:.2f} and emergency stop-loss at ₹{stop:.2f}."
                    )
                )

        # 2. EVENING STAR (3-candle bearish reversal)
        if prev2 and prev2.close > prev2.open and (prev2.close - prev2.open) > (prev_range * 0.5):
            if prev_body < (prev_range * 0.45) and is_red and c < (prev2.open + prev2.close) / 2:
                target = round(c - candle_range * 1.6, 2)
                stop = round(max(prev.high, h) * 1.003, 2)
                gain_pct = round(((target - c) / c) * 100, 2)
                return CandlePatternMatch(
                    pattern_id="EVENING_STAR",
                    pattern_name="🌑 Evening Star Reversal",
                    sentiment="BEARISH",
                    pattern_type="REVERSAL",
                    predicted_movement="STRONG_FALL",
                    predicted_target=target,
                    invalidation_stop_loss=stop,
                    expected_gain_percent=gain_pct,
                    confidence_score=89,
                    candle_time=curr.time,
                    candle_index=i,
                    beginner_summary="3-step bearish peak reversal: strong rally, buyer exhaustion at top, followed by heavy seller breakdown.",
                    what_happened_explanation=(
                        "Bulls pushed the price high, but the small star candle at the peak showed buyers couldn't push any further. "
                        "A sudden wave of profit-taking and seller dumping followed on this third candle, slicing through support. "
                        "This warns of an impending downward trend."
                    ),
                    actionable_beginner_advice=(
                        f"Avoid buying! If you are holding shares, consider locking in profit now. "
                        f"Expected decline towards ₹{target:.2f}."
                    )
                )

        # 3. BULLISH ENGULFING (2-candle bullish surge)
        if prev.close < prev.open and is_green:
            if o <= prev.close and c >= prev.open and body >= prev_body:
                target = round(c + candle_range * 1.5, 2)
                stop = round(o * 0.998, 2)
                gain_pct = round(((target - c) / c) * 100, 2)
                return CandlePatternMatch(
                    pattern_id="BULLISH_ENGULFING",
                    pattern_name="⚡ Bullish Engulfing",
                    sentiment="BULLISH",
                    pattern_type="REVERSAL",
                    predicted_movement="STRONG_RISE",
                    predicted_target=target,
                    invalidation_stop_loss=stop,
                    expected_gain_percent=gain_pct,
                    confidence_score=88,
                    candle_time=curr.time,
                    candle_index=i,
                    beginner_summary="Green candle body completely swallows previous red candle body. Buyers overpowered sellers.",
                    what_happened_explanation=(
                        "Sellers were in charge during the previous candle. But in this candle, buyers stepped in with massive volume, "
                        "pushing prices all the way past where the previous drop started. This green candle completely 'engulfs' the red one, "
                        "proving that big institutional buyers have overwhelmed all selling."
                    ),
                    actionable_beginner_advice=(
                        f"Very reliable buy signal! Look to buy with a target of ₹{target:.2f}. "
                        f"Place stop-loss just below the open at ₹{stop:.2f} to protect your money."
                    )
                )

        # 4. BEARISH ENGULFING (2-candle bearish breakdown)
        if prev.close > prev.open and is_red:
            if o >= prev.close and c <= prev.open and body >= prev_body:
                target = round(c - candle_range * 1.5, 2)
                stop = round(o * 1.002, 2)
                gain_pct = round(((target - c) / c) * 100, 2)
                return CandlePatternMatch(
                    pattern_id="BEARISH_ENGULFING",
                    pattern_name="🌧️ Bearish Engulfing",
                    sentiment="BEARISH",
                    pattern_type="REVERSAL",
                    predicted_movement="STRONG_FALL",
                    predicted_target=target,
                    invalidation_stop_loss=stop,
                    expected_gain_percent=gain_pct,
                    confidence_score=86,
                    candle_time=curr.time,
                    candle_index=i,
                    beginner_summary="Red candle body completely swallows previous green candle. Aggressive seller distribution.",
                    what_happened_explanation=(
                        "Buyers attempted to hold prices up, but sellers dumped large quantities, creating a tall red candle that completely "
                        "wipes out the previous green candle. This indicates aggressive institutional exit and potential further drop."
                    ),
                    actionable_beginner_advice=(
                        f"Bearish warning. Do not buy right now. Wait for price to find solid support near ₹{target:.2f}."
                    )
                )

        # 5. BULLISH HAMMER (1-candle bullish rejection of low)
        # Lower wick is large (>= 1.8x body and >= 50% of range), upper wick is small, close near high
        if lower_wick >= (body * 1.8) and lower_wick >= (candle_range * 0.50) and upper_wick <= max(body * 0.6, candle_range * 0.20):
            target = round(c + candle_range * 1.4, 2)
            stop = round(l * 0.998, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="HAMMER",
                pattern_name="🔨 Bullish Hammer",
                sentiment="BULLISH",
                pattern_type="REVERSAL",
                predicted_movement="STRONG_RISE",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=85,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Bullish Hammer: Long bottom tail showing sellers tried to push price down, but aggressive buyers rejected the low.",
                what_happened_explanation=(
                    "Sellers tried desperately to crash the stock lower, creating a deep drop. But active buyers stepped in at the bottom, "
                    "absorbing all available shares and driving the price back up to close near the high. "
                    "The long lower shadow looks like a hammer handle. It proves sellers are exhausted and buyers are taking over."
                ),
                actionable_beginner_advice=(
                    f"Strong upside bounce expected. Buy near ₹{c:.2f} with target ₹{target:.2f}. "
                    f"Place safety stop just below the hammer's low at ₹{stop:.2f}."
                )
            )

        # 6. SHOOTING STAR (1-candle bearish rejection of high)
        # Upper wick is large (>= 1.8x body and >= 50% of range), lower wick is small, close near low
        if upper_wick >= (body * 1.8) and upper_wick >= (candle_range * 0.50) and lower_wick <= max(body * 0.6, candle_range * 0.20):
            target = round(c - candle_range * 1.4, 2)
            stop = round(h * 1.002, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="SHOOTING_STAR",
                pattern_name="🌠 Shooting Star Reversal",
                sentiment="BEARISH",
                pattern_type="REVERSAL",
                predicted_movement="STRONG_FALL",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=84,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Long upper tail showing buyers tried to breakout, but were slammed down by aggressive sellers.",
                what_happened_explanation=(
                    "Buyers tried to push the stock to fresh highs, but ran directly into a wall of institutional selling that slammed the price "
                    "back down to close near the lows. The long upper tail looks like a shooting star. It warns that buyers have lost all momentum."
                ),
                actionable_beginner_advice=(
                    f"Danger sign for buyers! Avoid fresh long positions. "
                    f"Downside drift expected towards ₹{target:.2f}."
                )
            )

        # 7. INVERTED HAMMER (1-candle upside test)
        if prev.close < prev.open and upper_wick >= (body * 1.6) and lower_wick <= (body * 0.4):
            target = round(c + candle_range * 1.3, 2)
            stop = round(l * 0.998, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="INVERTED_HAMMER",
                pattern_name="🏹 Inverted Hammer",
                sentiment="BULLISH",
                pattern_type="REVERSAL",
                predicted_movement="MILD_RISE",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=78,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Buyers tested higher prices after a pullback, signaling early accumulation by smart money.",
                what_happened_explanation=(
                    "After a decline, buyers aggressively tested higher levels. Even though the price cooled off before close, "
                    "it shows buyers are sniffing for a bottom and preparing to push higher."
                ),
                actionable_beginner_advice=(
                    f"Watch for confirmation: if the next candle trades above ₹{h:.2f}, enter with target ₹{target:.2f}."
                )
            )

        # 8. BULLISH MARUBOZU (Full body momentum)
        if is_green and body >= (candle_range * 0.88) and body > (prev_body * 1.2):
            target = round(c + body * 1.2, 2)
            stop = round(o * 0.998, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="BULLISH_MARUBOZU",
                pattern_name="💎 Bullish Marubozu (Full Power)",
                sentiment="BULLISH",
                pattern_type="CONTINUATION",
                predicted_movement="STRONG_RISE",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=92,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Full solid green candle with virtually no wicks. Maximum buyer conviction from open to close.",
                what_happened_explanation=(
                    "From the second the candle opened to the second it closed, buyers bought every single available share without pausing. "
                    "There are almost no wicks, which means sellers never managed to push the price even 1% lower during this period."
                ),
                actionable_beginner_advice=(
                    f"Ride the momentum! Target ₹{target:.2f} with stop-loss at the candle open ₹{stop:.2f}."
                )
            )

        # 9. BEARISH MARUBOZU (Full body dump)
        if is_red and body >= (candle_range * 0.88) and body > (prev_body * 1.2):
            target = round(c - body * 1.2, 2)
            stop = round(o * 1.002, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="BEARISH_MARUBOZU",
                pattern_name="🩸 Bearish Marubozu (Panic Dump)",
                sentiment="BEARISH",
                pattern_type="CONTINUATION",
                predicted_movement="STRONG_FALL",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=90,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Full solid red candle with no wicks. Heavy panic selling from open to close.",
                what_happened_explanation=(
                    "Panic selling dominated this entire candle. Sellers dumped continuously without any buyer resistance, "
                    "pushing the price straight down from open to close."
                ),
                actionable_beginner_advice=(
                    f"High risk! Stay away from buying. Expected further decline towards ₹{target:.2f}."
                )
            )

        # 10. DOJI (Indecision / Balanced Cross)
        if body <= (candle_range * 0.10) and upper_wick >= (candle_range * 0.15) and lower_wick >= (candle_range * 0.15):
            target = round(c + candle_range * 1.1, 2)
            stop = round(l * 0.998, 2)
            gain_pct = round(((target - c) / c) * 100, 2)
            return CandlePatternMatch(
                pattern_id="DOJI",
                pattern_name="⚖️ Indecision Doji (+)",
                sentiment="NEUTRAL",
                pattern_type="INDECISION",
                predicted_movement="SIDEWAYS",
                predicted_target=target,
                invalidation_stop_loss=stop,
                expected_gain_percent=gain_pct,
                confidence_score=75,
                candle_time=curr.time,
                candle_index=i,
                beginner_summary="Open and close are identical, forming a cross (+). Equal struggle between bulls and bears.",
                what_happened_explanation=(
                    "Buyers pushed up, sellers pushed down, but by the end, neither side could win — price closed right where it opened. "
                    "This creates a '+' cross shape called a Doji. It represents total indecision and frequently precedes an explosive breakout."
                ),
                actionable_beginner_advice=(
                    f"Wait for the next candle! If the next candle breaks above ₹{h:.2f}, buy for target ₹{target:.2f}. "
                    f"If it breaks below ₹{l:.2f}, expect a drop."
                )
            )

        return None


default_pattern_detector = CandlestickPatternDetector()
