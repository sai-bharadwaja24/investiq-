"""
Senior Market Analyst Consensus Engine.
Synthesizes macro institutional order flow (VWAP, EMAs, RSI, RVOL, ML Predictor)
and micro candlestick patterns into ONE authoritative, coherent, intelligent market opinion.
Eliminates contradictory advice and provides institutional-grade market context.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.models.schemas import (
    StockQuote,
    Candle,
    IntradayPredictionResponse,
    CandlePatternAnalysisResponse,
    CandlePatternMatch,
    SeniorAnalystVerdictResponse
)


from app.prediction_engine.smart_money_engine import (
    default_smart_money_engine,
    SmartMoneyEngine,
    FVGDetail,
    OrderBlockDetail,
    VSAAnalysis,
    BreakoutCheckResult,
    LocationAnalysis,
    HeikinAshiStatus
)


class SeniorMarketAnalystEngine:
    @staticmethod
    def evaluate(
        quote: StockQuote,
        features: Dict[str, Any],
        ml_prediction: IntradayPredictionResponse,
        candlestick_analysis: CandlePatternAnalysisResponse,
        candles: Optional[List[Candle]] = None
    ) -> SeniorAnalystVerdictResponse:
        current_price = round(quote.price, 2)
        trend_dir = ml_prediction.direction  # "UP", "DOWN", "NO_CLEAR_EDGE", "SIDEWAYS"
        down_prob = ml_prediction.probabilities.get("DOWN", 0.0)
        up_prob = ml_prediction.probabilities.get("UP", 0.0)
        
        is_above_vwap = features.get("is_above_vwap", False)
        vwap_dist = features.get("vwap_distance_pct", 0.0)
        vwap_val = features.get("vwap", current_price)
        rsi = features.get("rsi_14", 50.0)
        rvol = features.get("rvol", 1.0)
        is_ema_bearish = features.get("is_ema_aligned_bearish", False)
        is_ema_bullish = features.get("is_ema_aligned_bullish", False)
        atr = max(current_price * 0.008, features.get("atr_14", current_price * 0.008))
        
        active_pattern: Optional[CandlePatternMatch] = candlestick_analysis.active_pattern
        pattern_sentiment = active_pattern.sentiment if active_pattern else "NEUTRAL"
        pattern_name = active_pattern.pattern_name if active_pattern else "Consolidation"
        
        now_str = datetime.now().strftime("%H:%M:%S IST")

        # =========================================================================
        # INSTITUTIONAL SMART MONEY ANALYSIS (From 11 YouTube Strategies)
        # =========================================================================
        candle_list = candles or []
        vsa_info: VSAAnalysis = default_smart_money_engine.analyze_vsa(candle_list, rvol)
        fvg_list: List[FVGDetail] = default_smart_money_engine.detect_fair_value_gaps(candle_list)
        ob_list: List[OrderBlockDetail] = default_smart_money_engine.detect_order_blocks(candle_list)
        breakout_checks: BreakoutCheckResult = default_smart_money_engine.validate_5_check_breakout(candle_list, current_price)
        loc_analysis: LocationAnalysis = default_smart_money_engine.evaluate_location_principle(quote)
        ha_status: HeikinAshiStatus = default_smart_money_engine.analyze_heikin_ashi(candle_list, rsi)

        # Active FVG and Order Block
        active_fvg = fvg_list[-1] if fvg_list else None
        active_ob = ob_list[-1] if ob_list else None

        # Build Confluence Checklist
        confluence_checklist = []
        if is_above_vwap:
            confluence_checklist.append({
                "label": "Institutional Flow",
                "status": "positive",
                "text": f"Price is trading {abs(vwap_dist):.1f}% above institutional VWAP (₹{vwap_val:.2f}) — buyers in control."
            })
        else:
            confluence_checklist.append({
                "label": "Institutional Flow",
                "status": "negative",
                "text": f"Price is pinned {abs(vwap_dist):.1f}% below institutional VWAP (₹{vwap_val:.2f}) — institutional selling pressure."
            })
            
        if is_ema_bullish:
            confluence_checklist.append({
                "label": "Trend Structure",
                "status": "positive",
                "text": "Bullish moving average alignment: EMA 9 > EMA 21 > EMA 50 confirming sustained upward slope."
            })
        elif is_ema_bearish:
            confluence_checklist.append({
                "label": "Trend Structure",
                "status": "negative",
                "text": "Bearish moving average alignment: EMA 9 < EMA 21 < EMA 50 confirming downward slope."
            })
        else:
            confluence_checklist.append({
                "label": "Trend Structure",
                "status": "neutral",
                "text": "Moving averages are converging flat — market is rangebound."
            })
            
        confluence_checklist.append({
            "label": "Momentum Strength",
            "status": "positive" if rsi > 55 else "negative" if rsi < 45 else "neutral",
            "text": f"RSI 14 at {rsi:.1f}: {'Strong buyer momentum' if rsi > 55 else 'Weak momentum with persistent selling' if rsi < 45 else 'Neutral equilibrium between buyers and sellers'}."
        })
        
        if active_pattern:
            confluence_checklist.append({
                "label": "Candlestick Pattern",
                "status": "positive" if pattern_sentiment == "BULLISH" else "negative" if pattern_sentiment == "BEARISH" else "neutral",
                "text": f"{pattern_name} detected at {active_pattern.candle_time}."
            })

        # Smart Money Check 1: VSA Institutional Volume Profile
        if vsa_info.is_absorption_wall:
            confluence_checklist.append({
                "label": "Volume Spread (VSA)",
                "status": "negative" if vsa_info.absorption_side == "SELLER_ABSORBING_AT_HIGH" else "positive",
                "text": vsa_info.explanation
            })
        elif vsa_info.status == "VOLUME_EXHAUSTION":
            confluence_checklist.append({
                "label": "Volume Spread (VSA)",
                "status": "negative",
                "text": vsa_info.explanation
            })
        elif vsa_info.status == "HEALTHY_EXPANSION":
            confluence_checklist.append({
                "label": "Volume Spread (VSA)",
                "status": "positive",
                "text": vsa_info.explanation
            })

        # Smart Money Check 2: Fair Value Gap & Consequent Encroachment (50% C.E.)
        if active_fvg:
            confluence_checklist.append({
                "label": "Fair Value Gap (FVG)",
                "status": "positive" if active_fvg.fvg_type == "BULLISH" else "negative",
                "text": f"{active_fvg.fvg_type.title()} FVG ({active_fvg.size_pct:.1f}% gap). 50% Consequent Encroachment entry at ₹{active_fvg.consequent_encroachment:.2f}."
            })

        # Smart Money Check 3: Order Block & Volume Delta
        if active_ob:
            ob_status = "positive" if (active_ob.block_type == "BULLISH_DEMAND" and active_ob.is_valid_volume) else "neutral"
            confluence_checklist.append({
                "label": "Order Block & Delta",
                "status": ob_status,
                "text": f"{active_ob.block_type.replace('_', ' ').title()} with {active_ob.volume_delta_pct:.0f}% volume dominance. POC at ₹{active_ob.poc_price:.2f}."
            })

        # Smart Money Check 4: The Location Principle (No-Middle-Zone)
        confluence_checklist.append({
            "label": "Location Principle",
            "status": "positive" if loc_analysis.is_tradeable_edge else "neutral",
            "text": loc_analysis.warning_message
        })

        # Smart Money Check 5: Heikin Ashi Smoothed Trend
        ha_text = (
            "Heikin Ashi green candles with flat bottoms (zero lower wicks) — institutional upward thrust."
            if ha_status.trend == "STRONG_BULL_FLAT_BOTTOMS"
            else "Heikin Ashi red candles with flat tops (zero upper wicks) — persistent selling pressure."
            if ha_status.trend == "STRONG_BEAR_FLAT_TOPS"
            else "Heikin Ashi Doji candle — trend momentum losing steam, reversal brewing."
            if ha_status.trend == "REVERSAL_DOJI_BREWING"
            else "Heikin Ashi candles in neutral transition."
        )
        confluence_checklist.append({
            "label": "Heikin Ashi Flow",
            "status": "positive" if ha_status.trend == "STRONG_BULL_FLAT_BOTTOMS" else "negative" if ha_status.trend == "STRONG_BEAR_FLAT_TOPS" else "neutral",
            "text": ha_text
        })

        # =========================================================================
        # SENIOR ANALYST SYNTHESIS & RECONCILIATION LOGIC
        # =========================================================================

        # CASE 1: BEARISH MACRO TREND WITH A COUNTER-TREND BULLISH CANDLE (THE ZAGGLE CASE!)
        if (trend_dir == "DOWN" or down_prob >= 0.55 or not is_above_vwap) and pattern_sentiment == "BULLISH":
            verdict = "AVOID_SELL"
            conviction_pct = int(max(75, down_prob * 100))
            verdict_display = f"🔴 AVOID / SELL ON RISE — BEARISH BREAKDOWN ({conviction_pct}% Down Conviction)"
            verdict_badge_color = "rose"
            market_regime = "BEARISH_BREAKDOWN"
            
            # Downside support target
            target_price = round(min(current_price * 0.985, ml_prediction.projected_target_price), 2)
            if target_price >= current_price:
                target_price = round(current_price - (atr * 1.5), 2)
            stop_loss = round(max(current_price * 1.008, vwap_val * 1.003, ml_prediction.invalidation_stop_loss), 2)
            
            risk = max(0.1, stop_loss - current_price)
            reward = max(0.1, current_price - target_price)
            rr_ratio = round(reward / risk, 1) if risk > 0 else 2.0
            expected_gain_pct = round(((current_price - target_price) / current_price) * 100, 2)
            time_horizon = f"~{ml_prediction.expected_duration_minutes or 30} mins"

            candlestick_context = (
                f"⚠️ Counter-Trend Trap Alert: A {pattern_name} formed on the 5m chart, but {quote.symbol} is trapped firmly "
                f"below VWAP (₹{vwap_val:.2f}) with {conviction_pct}% institutional sell volume. In senior technical analysis, "
                f"buying single-candle patterns against an active institutional downtrend has an over 72% failure rate. "
                f"Do not mistake this for a reliable bottom."
            )
            
            senior_analyst_take = (
                f"Senior Analyst Take: Do NOT buy {quote.symbol}. Despite the minor {pattern_name} shape, institutional selling dominates "
                f"the tape ({abs(vwap_dist):.1f}% below VWAP with downward EMA slope and RSI at {rsi:.1f}). Smart money algorithms "
                f"routinely use minor retail bounces to distribute and sell at higher prices. The dominant directional pressure is DOWN "
                f"towards support at ₹{target_price:.2f}. Safe buying is strictly invalid until price decisively reclaims above ₹{stop_loss:.2f}."
            )
            
            action_advice = (
                f"1. Fresh Buying: STRICTLY AVOID. Do not try to catch a falling knife.\n"
                f"2. Existing Holders: Use any intraday bounce toward VWAP to exit or tighten your protective stop to ₹{stop_loss:.2f}.\n"
                f"3. Intraday Short Traders: Sell on pullbacks with target ₹{target_price:.2f} and stop-loss at ₹{stop_loss:.2f}."
            )

        # CASE 2: BULLISH CONFLUENCE (TREND IS UP AND CANDLE PATTERN AGREES)
        elif (trend_dir == "UP" or up_prob >= 0.55 or is_above_vwap) and pattern_sentiment in ["BULLISH", "NEUTRAL"]:
            verdict = "STRONG_BUY"
            conviction_pct = int(min(95, max(75, up_prob * 100 + (5 if pattern_sentiment == 'BULLISH' else 0))))
            verdict_display = f"🟢 HIGH-CONVICTION BUY — MOMENTUM EXPANSION ({conviction_pct}% Up Conviction)"
            verdict_badge_color = "emerald"
            market_regime = "BULLISH_EXPANSION"
            
            # Upside target
            target_price = round(max(current_price * 1.018, ml_prediction.projected_target_price), 2)
            if target_price <= current_price:
                target_price = round(current_price + (atr * 1.6), 2)
            stop_loss = round(min(current_price * 0.992, vwap_val * 0.997, ml_prediction.invalidation_stop_loss), 2)
            
            risk = max(0.1, current_price - stop_loss)
            reward = max(0.1, target_price - current_price)
            rr_ratio = round(reward / risk, 1) if risk > 0 else 2.5
            expected_gain_pct = round(((target_price - current_price) / current_price) * 100, 2)
            time_horizon = f"~{ml_prediction.expected_duration_minutes or 30} mins"

            candlestick_context = (
                f"✅ Full Technical Confluence: The {pattern_name} confirms aggressive buyer absorption above institutional VWAP "
                f"(₹{vwap_val:.2f}), aligning with strong multi-timeframe momentum."
            )
            
            senior_analyst_take = (
                f"Senior Analyst Take: High-probability buy setup for {quote.symbol}. Buyers are in complete control above VWAP "
                f"with expanding volume (RVOL {rvol:.1f}x) and healthy RSI ({rsi:.1f}). The {pattern_name} confirms smart money "
                f"is actively absorbing any dips. Excellent risk-to-reward ratio for upside continuation toward ₹{target_price:.2f}."
            )
            
            action_advice = (
                f"1. Entry: Buy near current market price ₹{current_price:.2f}.\n"
                f"2. Profit Target: Sell 70% of shares at ₹{target_price:.2f} (+{expected_gain_pct:.1f}%).\n"
                f"3. Emergency Stop: Place a hard stop-loss order at ₹{stop_loss:.2f} to keep total portfolio risk strictly limited."
            )

        # CASE 3: BULLISH MACRO TREND WITH A BEARISH PULLBACK CANDLE (PROFIT-TAKING WARNING)
        elif (trend_dir == "UP" or is_above_vwap) and pattern_sentiment == "BEARISH":
            verdict = "WAIT_CONSOLIDATION"
            conviction_pct = 75
            verdict_display = f"🟡 CAUTION / TAKE PROFIT — PULLBACK EXPECTED"
            verdict_badge_color = "amber"
            market_regime = "OVEREXTENDED_PULLBACK"
            
            target_price = round(max(vwap_val, current_price - (atr * 1.0)), 2)
            stop_loss = round(max(current_price * 1.008, quote.high * 1.002), 2)
            expected_gain_pct = round(abs((current_price - target_price) / current_price) * 100, 2)
            rr_ratio = 1.8
            time_horizon = "~20 mins"

            candlestick_context = (
                f"⚠️ Exhaustion Warning: A {pattern_name} formed at intraday highs, signaling sudden profit-taking by institutional "
                f"traders even though the macro trend is positive."
            )
            
            senior_analyst_take = (
                f"Senior Analyst Take: {quote.symbol} is currently overextended. While the macro trend is bullish, the {pattern_name} "
                f"shows sellers rejecting higher prices. Do NOT chase at the top! Existing buyers should protect their capital by locking in "
                f"partial gains. New buyers should wait for a healthy pullback toward VWAP (₹{vwap_val:.2f}) before entering."
            )
            
            action_advice = (
                f"1. New Buyers: Do NOT chase at current highs. Wait for price to pull back to ₹{target_price:.2f}.\n"
                f"2. Existing Holders: Book partial profits now and trail your stop-loss higher to protect gains.\n"
                f"3. Wait for consolidation: Only enter when support near VWAP is confirmed."
            )

        # CASE 4: PURE BEARISH CONFLUENCE (TREND IS DOWN AND CANDLE PATTERN IS BEARISH)
        elif trend_dir == "DOWN" or not is_above_vwap:
            verdict = "AVOID_SELL"
            conviction_pct = int(max(80, down_prob * 100))
            verdict_display = f"🔴 AVOID / SELL ON RISE — BEARISH DISTRIBUTION ({conviction_pct}% Conviction)"
            verdict_badge_color = "rose"
            market_regime = "BEARISH_DISTRIBUTION"
            
            target_price = round(min(current_price * 0.985, ml_prediction.projected_target_price), 2)
            if target_price >= current_price:
                target_price = round(current_price - (atr * 1.5), 2)
            stop_loss = round(max(current_price * 1.008, vwap_val * 1.003), 2)
            
            risk = max(0.1, stop_loss - current_price)
            reward = max(0.1, current_price - target_price)
            rr_ratio = round(reward / risk, 1) if risk > 0 else 2.0
            expected_gain_pct = round(((current_price - target_price) / current_price) * 100, 2)
            time_horizon = f"~{ml_prediction.expected_duration_minutes or 30} mins"

            candlestick_context = (
                f"🔴 Full Bearish Confluence: The {pattern_name} confirms active institutional dumping below VWAP (₹{vwap_val:.2f})."
            )
            
            senior_analyst_take = (
                f"Senior Analyst Take: Strong avoidance signal for {quote.symbol}. Price is heavily rejected below VWAP with downward-sloping "
                f"moving averages and negative momentum. Sellers are aggressively in charge. Expecting further downside pressure toward ₹{target_price:.2f}."
            )
            
            action_advice = (
                f"1. Fresh Buying: AVOID. High risk of capital loss.\n"
                f"2. Existing Holders: Exit positions or set a strict trailing stop at ₹{stop_loss:.2f}.\n"
                f"3. Do not attempt counter-trend bottom fishing until a clear double bottom forms."
            )

        # CASE 5: CONSOLIDATION / NO DIRECTIONAL EDGE
        else:
            verdict = "WAIT_CONSOLIDATION"
            conviction_pct = 50
            verdict_display = "⚪ NO CLEAR DIRECTIONAL EDGE (Consolidation — Wait for Breakout)"
            verdict_badge_color = "slate"
            market_regime = "RANGEBOUND_CONSOLIDATION"
            
            target_price = round(current_price + (atr * 1.2), 2)
            stop_loss = round(current_price - (atr * 1.0), 2)
            rr_ratio = 1.2
            expected_gain_pct = round(((target_price - current_price) / current_price) * 100, 2)
            time_horizon = "~45 mins"

            candlestick_context = (
                f"⚖️ Rangebound Consolidation: The {pattern_name} reflects indecision near VWAP (₹{vwap_val:.2f})."
            )
            
            senior_analyst_take = (
                f"Senior Analyst Take: {quote.symbol} is currently oscillating tightly around VWAP with no institutional edge. "
                f"Buying inside choppy consolidation results in whipsaws and unnecessary broker commissions. Smart traders remain patient "
                f"and wait for a high-volume breakout above resistance or breakdown below support."
            )
            
            action_advice = (
                f"1. Stay on the sidelines. Protect your capital while the market decides direction.\n"
                f"2. Set alerts: Buy only if price breaks above ₹{target_price:.2f} with heavy volume.\n"
                f"3. Never trade inside low-volatility chop."
            )

        # Smart Money Guard 1: Institutional Absorption Wall at High (Jim Cramer / TradingLab VSA Rule)
        if vsa_info.is_absorption_wall and vsa_info.absorption_side == "SELLER_ABSORBING_AT_HIGH" and verdict == "STRONG_BUY":
            verdict = "WAIT_CONSOLIDATION"
            verdict_display = "🟡 CAUTION — INSTITUTIONAL ABSORPTION WALL (Potential Bull Trap)"
            verdict_badge_color = "amber"
            senior_analyst_take = (
                f"Senior Analyst Alert: Heavy institutional iceberg orders are absorbing buyers at day high ({rvol:.1f}x volume with narrow candle spread). "
                f"Per Volume Spread Analysis (VSA), large operators frequently let retail bid up before pulling liquidity. "
                f"Avoid buying the breakout candle; wait for a confirmed pullback and retest."
            )

        # Smart Money Optimization: If 5-Check Retest Confirmed, enforce minimum 2R setup
        if breakout_checks.status == "CONFIRMED_2R_RETEST" and is_above_vwap:
            target_price = breakout_checks.projected_target
            stop_loss = breakout_checks.recommended_stop
            rr_ratio = max(2.0, breakout_checks.risk_reward)
            expected_gain_pct = round(((target_price - current_price) / current_price) * 100, 2)

        smart_money_insights = {
            "vsa_status": vsa_info.status,
            "is_absorption_wall": vsa_info.is_absorption_wall,
            "vsa_explanation": vsa_info.explanation,
            "fvg_consequent_encroachment": active_fvg.consequent_encroachment if active_fvg else None,
            "fvg_type": active_fvg.fvg_type if active_fvg else None,
            "order_block": {
                "type": active_ob.block_type,
                "poc": active_ob.poc_price,
                "volume_delta_pct": active_ob.volume_delta_pct,
                "is_valid_volume": active_ob.is_valid_volume
            } if active_ob else None,
            "breakout_5check_status": breakout_checks.status,
            "breakout_checks_passed": breakout_checks.checks_passed,
            "location_zone": loc_analysis.zone,
            "is_tradeable_edge": loc_analysis.is_tradeable_edge,
            "heikin_ashi_trend": ha_status.trend
        }

        return SeniorAnalystVerdictResponse(
            symbol=quote.symbol,
            current_price=current_price,
            timestamp=now_str,
            is_market_open=ml_prediction.is_market_open or False,
            verdict=verdict,
            verdict_display=verdict_display,
            verdict_badge_color=verdict_badge_color,
            conviction_percent=conviction_pct,
            target_price=target_price,
            stop_loss=stop_loss,
            expected_gain_percent=expected_gain_pct,
            risk_reward_ratio=rr_ratio,
            time_horizon_text=time_horizon,
            senior_analyst_take=senior_analyst_take,
            candlestick_context=candlestick_context,
            action_advice=action_advice,
            confluence_checklist=confluence_checklist,
            active_candlestick_pattern=active_pattern,
            market_regime=market_regime,
            smart_money_insights=smart_money_insights
        )


default_senior_analyst = SeniorMarketAnalystEngine()
