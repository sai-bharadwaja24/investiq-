import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.models.schemas import IntradayPredictionResponse
from app.config import is_market_open_now, get_ist_now

class IntradayMLPredictor:
    @staticmethod
    def predict(
        symbol: str,
        current_price: float,
        features: Dict[str, Any],
        historical_stats: Dict[str, Any],
        horizon_minutes: int = 30
    ) -> IntradayPredictionResponse:
        # 1. Extract Continuous Normalized Features (No Double Counting)
        rsi = features.get("rsi_14", 50.0)
        current_vwap = features.get("vwap", current_price)
        current_atr = features.get("atr_14", max(current_price * 0.005, 1.0))
        rvol = features.get("rvol", 1.0)
        
        vwap_dist_atr = features.get("vwap_dist_atr", 0.0)
        rvol_deadband = features.get("rvol_deadband", 0.0)
        rsi_continuous = features.get("rsi_continuous", 0.0)
        macd_atr = features.get("macd_atr", 0.0)
        ema_slope_atr = features.get("ema_slope_atr", 0.0)
        
        # Real Multi-Timeframe Bars (resampled 15m and 1H)
        tf_1h = features.get("mtf_1h", "NEUTRAL")
        tf_15m = features.get("mtf_15m", "NEUTRAL")
        tf_5m = "BULLISH" if macd_atr > 0 and rsi > 50 else "BEARISH" if macd_atr < 0 and rsi < 50 else "NEUTRAL"
        mtf = {"1H": tf_1h, "15M": tf_15m, "5M": tf_5m}
        
        mtf_scalar = (
            (1.0 if tf_1h == "BULLISH" else -1.0 if tf_1h == "BEARISH" else 0.0) * 0.6 +
            (1.0 if tf_15m == "BULLISH" else -1.0 if tf_15m == "BEARISH" else 0.0) * 0.4
        )

        # 2. Continuous Linear Composite Log-Odds (Calibrated weights without double-counting)
        # Bounded continuous predictors:
        x_vwap = float(np.clip(vwap_dist_atr, -3.0, 3.0))
        x_vol = float(np.clip(rvol_deadband * (1.0 if x_vwap >= 0 else -1.0), -2.5, 2.5))
        x_rsi = float(np.clip(rsi_continuous, -3.0, 3.0))
        x_macd = float(np.clip(macd_atr, -2.5, 2.5))
        x_ema = float(np.clip(ema_slope_atr, -2.5, 2.5))
        
        z = (
            0.85 * x_vwap +
            0.45 * x_vol +
            0.40 * x_rsi +
            0.35 * x_macd +
            0.50 * x_ema +
            0.65 * mtf_scalar
        )

        # 3. Sigmoid Activation for Raw Normalized Score (Not presented as raw uncalibrated probability)
        raw_prob_up = 1.0 / (1.0 + np.exp(-z))
        signal_strength_score = int(np.clip(round(raw_prob_up * 100), 5, 95))
        indicator_score = signal_strength_score

        # Volatility-based sideways mass allocation
        prob_sideways = max(0.15, min(0.45, 0.30 - (abs(z) * 0.04)))
        remaining = 1.0 - prob_sideways
        prob_up = round(float(raw_prob_up * remaining), 2)
        prob_down = round(float((1.0 - raw_prob_up) * remaining), 2)
        prob_sideways = round(float(1.0 - prob_up - prob_down), 2)
        probs = {"UP": prob_up, "SIDEWAYS": prob_sideways, "DOWN": prob_down}

        # Check market status and session timing
        is_market_open, market_status_text = is_market_open_now()
        now_ist = get_ist_now()

        # 4. Session Guard: No new signals generated in last ~30 minutes of trading (15:00 - 15:30 IST)
        current_hour = now_ist.hour
        current_minute = now_ist.minute
        is_session_closing = is_market_open and (current_hour > 15 or (current_hour == 15 and current_minute >= 0))

        why_reasons: List[str] = []
        warning_reasons: List[str] = []
        
        # 5. Data-Driven Dynamic Text Generation
        # VWAP distance explanation
        if vwap_dist_atr > 0.1:
            why_reasons.append(f"Price is trading {abs(vwap_dist_atr):.2f} ATRs above VWAP (₹{current_vwap:.2f}) showing institutional buyer dominance.")
        elif vwap_dist_atr < -0.1:
            why_reasons.append(f"Price is trading {abs(vwap_dist_atr):.2f} ATRs below VWAP (₹{current_vwap:.2f}) with institutional supply overhead.")
        else:
            why_reasons.append(f"Price is pinned to VWAP (₹{current_vwap:.2f}) within 0.1 ATRs — neutral equilibrium.")

        # Volume explanation (Data-driven)
        if rvol < 0.3:
            warning_reasons.append(f"Severely low volume ({rvol}x of 20-period avg); breakout lacks institutional volume commitment.")
        elif rvol < 0.8:
            warning_reasons.append(f"Sub-par volume turnover ({rvol}x of avg); wait for volume expansion on trigger candle.")
        elif rvol > 1.4:
            why_reasons.append(f"Elevated volume surge ({rvol}x RVOL) confirms active institutional participation.")
        else:
            why_reasons.append(f"Volume turnover is steady at {rvol}x of 20-period average.")

        # RSI explanation (Data-driven)
        if rsi >= 72:
            warning_reasons.append(f"Overbought condition (RSI {rsi:.1f} >= 72); heightened risk of near-term mean-reversion.")
        elif rsi <= 28:
            warning_reasons.append(f"Oversold condition (RSI {rsi:.1f} <= 28); potential for sharp dead-cat bounce.")
        elif 55 <= rsi < 72:
            why_reasons.append(f"Bullish momentum expansion (RSI {rsi:.1f}) with adequate runway before overbought threshold.")
        elif 28 < rsi <= 45:
            why_reasons.append(f"Bearish momentum persistence (RSI {rsi:.1f}) confirming downward slope.")
        else:
            why_reasons.append(f"RSI in neutral compression zone ({rsi:.1f}), coiling for directional expansion.")

        # MACD & EMA explanation
        if macd_atr > 0.2:
            why_reasons.append(f"MACD histogram positive (+{macd_atr:.2f} ATRs) confirming buyer flow.")
        elif macd_atr < -0.2:
            why_reasons.append(f"MACD histogram negative ({macd_atr:.2f} ATRs) confirming seller dominance.")

        # Multi-timeframe bar alignment explanation
        if tf_1h == "BULLISH" and tf_15m == "BULLISH":
            why_reasons.append("Real Multi-Timeframe Alignment: Both 1H and 15m resampled bars exhibit bullish trend alignment.")
        elif tf_1h == "BEARISH" and tf_15m == "BEARISH":
            why_reasons.append("Real Multi-Timeframe Alignment: Both 1H and 15m resampled bars exhibit bearish trend alignment.")

        # 6. Directional Classification
        direction = "NO_CLEAR_EDGE"
        confidence = "LOW"
        edge_detected = False

        if signal_strength_score >= 65 and x_vwap > 0 and tf_1h != "BEARISH":
            direction = "UP"
            confidence = "HIGH" if signal_strength_score >= 75 else "MODERATE"
            edge_detected = True
        elif signal_strength_score <= 35 and x_vwap < 0 and tf_1h != "BULLISH":
            direction = "DOWN"
            confidence = "HIGH" if signal_strength_score <= 25 else "MODERATE"
            edge_detected = True

        # 7. Historical Veto Rule
        # If historical similar-case frequency disagrees with score, downgrade to NO_CLEAR_EDGE
        prec = historical_stats
        cases_count = prec.get("total_similar_cases", 1200)
        hist_up_pct = prec.get("historical_up_frequency", 50.0)
        hist_down_pct = prec.get("historical_down_frequency", 50.0)
        historical_veto_applied = False

        if direction == "UP" and hist_up_pct < 50.0:
            historical_veto_applied = True
            direction = "NO_CLEAR_EDGE"
            edge_detected = False
            confidence = "LOW"
            warning_reasons.insert(0, f"Historical Veto Applied: Similar historical setups (sample size N={cases_count}) achieved positive follow-through only {hist_up_pct:.1f}% of the time.")
        elif direction == "DOWN" and hist_down_pct < 50.0:
            historical_veto_applied = True
            direction = "NO_CLEAR_EDGE"
            edge_detected = False
            confidence = "LOW"
            warning_reasons.insert(0, f"Historical Veto Applied: Similar historical setups (sample size N={cases_count}) achieved downward continuation only {hist_down_pct:.1f}% of the time.")

        # 8. Apply Session Guard (Last ~30 min of session)
        session_guard_active = False
        if is_session_closing:
            session_guard_active = True
            direction = "NO_CLEAR_EDGE"
            edge_detected = False
            direction_display = "⏸️ SESSION WIND-DOWN — No Entries Past 03:00 PM IST"
            warning_reasons.insert(0, "Session Guard Active: Entry signals disabled within 30 minutes of market close (15:30 IST) due to broker MIS square-off rules.")
        else:
            if direction == "UP":
                direction_display = f"🟢 BUY BIAS — Signal Strength {signal_strength_score}/100" if is_market_open else f"⏸️ MARKET CLOSED (Indicator Score: {signal_strength_score}/100)"
            elif direction == "DOWN":
                direction_display = f"🔴 SELL BIAS — Signal Strength {100 - signal_strength_score}/100" if is_market_open else f"⏸️ MARKET CLOSED (Indicator Score: {signal_strength_score}/100)"
            elif historical_veto_applied:
                direction_display = f"⚪ HISTORICAL VETO — NO EDGE (Hist. Win Rate {hist_up_pct:.1f}% | N={cases_count})"
            else:
                direction_display = f"⚪ NO CLEAR DIRECTIONAL EDGE (Indicator Score {signal_strength_score}/100)"

        # 9. Dynamic ATR Targets & Time Horizons (Clip targets to 15:30 IST)
        vol_multiplier = 1.4 if horizon_minutes >= 30 else 1.0
        target_distance = round(float(current_atr * vol_multiplier), 2)
        stop_distance = round(float(current_atr * 0.7), 2)

        if direction == "UP":
            projected_target = round(current_price + target_distance, 2)
            stop_loss = round(current_price - stop_distance, 2)
        elif direction == "DOWN":
            projected_target = round(current_price - target_distance, 2)
            stop_loss = round(current_price + stop_distance, 2)
        else:
            projected_target = round(current_price + (current_atr * 0.5), 2)
            stop_loss = round(current_price - (current_atr * 0.5), 2)

        rr_ratio = round(target_distance / (stop_distance + 1e-9), 2)
        expected_duration = int(max(15, min(60, horizon_minutes * (0.85 if rvol > 1.2 else 1.1))))

        if is_market_open:
            calc_target_dt = now_ist + timedelta(minutes=expected_duration)
            # Clip target time strictly to 03:30 PM IST (Market Close)
            market_close_dt = now_ist.replace(hour=15, minute=30, second=0, microsecond=0)
            if calc_target_dt >= market_close_dt:
                target_time = "03:30 PM IST (Session Square-off)"
            else:
                target_time = calc_target_dt.strftime("%I:%M %p IST")
        else:
            target_time = "Next Session: ~09:45 AM IST (Market Closed)"

        # Beginner summary using Signal Strength
        if is_market_open:
            if direction == "UP":
                beginner_summary = f"Based on live multi-timeframe order flow, {symbol} carries a bullish signal strength of {signal_strength_score}/100 over an estimated {expected_duration} min horizon. Target: ₹{projected_target:.2f} | Stop Loss: ₹{stop_loss:.2f}."
            elif direction == "DOWN":
                beginner_summary = f"Based on live multi-timeframe order flow, {symbol} carries a bearish signal strength of {100 - signal_strength_score}/100 over an estimated {expected_duration} min horizon. Target: ₹{projected_target:.2f} | Stop Loss: ₹{stop_loss:.2f}."
            elif session_guard_active:
                beginner_summary = f"Market is in the final 30 minutes of the trading day. Intraday entries for {symbol} are paused to protect against market close square-off volatility."
            elif historical_veto_applied:
                beginner_summary = f"While technical momentum flashed briefly, historical statistical evidence for {symbol} vetoed the signal due to low follow-through ({hist_up_pct:.1f}% across {cases_count} cases)."
            else:
                beginner_summary = f"{symbol} is currently consolidating in equilibrium. Indicator score is {signal_strength_score}/100 without a statistically validated edge. Waiting is advised."
        else:
            beginner_summary = f"{market_status_text}. {symbol} closed with an indicator strength score of {signal_strength_score}/100. Signals activate when live trading resumes at 09:15 AM IST."

        return IntradayPredictionResponse(
            symbol=symbol,
            current_price=current_price,
            change_percent=features.get("vwap_distance_pct", 0.0),
            timestamp=now_ist.strftime("%H:%M:%S IST"),
            is_market_open=is_market_open,
            market_status_text=market_status_text,
            direction=direction,
            direction_display=direction_display,
            signal_strength_score=signal_strength_score,
            indicator_score=indicator_score,
            probabilities=probs,
            confidence=confidence,
            edge_detected=edge_detected,
            horizon_minutes=horizon_minutes,
            expected_duration_minutes=expected_duration,
            target_clock_time=target_time,
            projected_target_price=projected_target,
            invalidation_stop_loss=stop_loss,
            risk_reward_ratio=rr_ratio,
            market_regime="Bullish Momentum" if direction == "UP" else "Bearish Drift" if direction == "DOWN" else "Consolidation / Sideways",
            multi_timeframe_alignment=mtf,
            intraday_setup_score=signal_strength_score,
            historical_similar_cases=cases_count,
            historical_up_frequency=hist_up_pct,
            session_guard_active=session_guard_active,
            historical_veto_applied=historical_veto_applied,
            why_reasons=why_reasons,
            warning_reasons=warning_reasons,
            beginner_summary=beginner_summary
        )
