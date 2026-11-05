from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.models.schemas import TimedExitResponse
from app.config import is_market_open_now, get_ist_now

class TimedExitAdvisor:
    @staticmethod
    def evaluate_active_trade(
        symbol: str,
        entry_price: float,
        entry_time_str: str,
        current_price: float,
        features: Dict[str, Any],
        initial_horizon_minutes: int = 30
    ) -> TimedExitResponse:
        # Calculate PnL
        pnl = round(current_price - entry_price, 2)
        pnl_pct = round((pnl / (entry_price + 1e-9)) * 100, 2)
        
        # Check market hours
        is_market_open, market_status_text = is_market_open_now()
        now = get_ist_now()
        
        try:
            clean_time = entry_time_str.upper().replace("IST", "").strip()
            if "AM" in clean_time or "PM" in clean_time:
                entry_dt = datetime.strptime(clean_time, "%I:%M %p")
            else:
                entry_dt = datetime.strptime(clean_time, "%H:%M")
            entry_dt = now.replace(hour=entry_dt.hour, minute=entry_dt.minute, second=0)
            if entry_dt > now:
                elapsed = 5
            else:
                elapsed = max(1, int((now - entry_dt).total_seconds() // 60))
        except Exception:
            elapsed = 10  # fallback default elapsed
            
        tech_score = features.get("technical_score", 50)
        rsi = features.get("rsi_14", 50.0)
        is_above_vwap = features.get("is_above_vwap", True)
        macd_hist = features.get("macd_hist", 0.0)
        rvol = features.get("rvol", 1.0)
        atr = features.get("atr_14", current_price * 0.008)
        target_price = round(entry_price + (atr * 1.5), 2)
        
        # Trailing stop calculation: 0.6 * ATR below current price or breakeven
        if pnl > 0:
            suggested_trail_stop = round(max(entry_price + (pnl * 0.35), current_price - (atr * 0.55)), 2)
        else:
            suggested_trail_stop = round(entry_price - (atr * 0.7), 2)
            
        # Determine State: STILL_BULLISH vs STALLING vs REVERSAL
        if not is_above_vwap and (tech_score < 40 or rsi < 45 or macd_hist < -0.5 or current_price < suggested_trail_stop):
            # Case C: REVERSAL DETECTED
            state = "REVERSAL"
            state_display = "🔴 REVERSAL DETECTED (EXIT NOW)"
            recommended_action = "IMMEDIATE_EXIT"
            urgency = "CRITICAL"
            countdown_seconds = 180
            remaining_mins = 3
            exit_time = (now + timedelta(minutes=3)).strftime("%I:%M %p IST") if is_market_open else "Next Open: 09:18 AM IST"
            action_guidance = f"RECOMMENDATION: EXIT TRADE NOW! Strong selling pressure detected below VWAP. Close position around ₹{current_price} to protect your capital."
            reason = "Price dropped below VWAP with rising selling momentum and bearish MACD rollover. Protect your capital."
            probs = {"UP": 0.10, "SIDEWAYS": 0.20, "DOWN": 0.70}
            
        elif (elapsed >= initial_horizon_minutes and (pnl_pct < 0.5 or tech_score < 55 or rsi < 55)) or (48 <= rsi <= 54 and abs(pnl_pct) < 0.3 and rvol < 0.9):
            # Case B: STALLING / CONSOLIDATING
            state = "STALLING"
            state_display = "🟡 STALLING / CONSOLIDATING (SIDEWAYS)"
            recommended_action = "TIMEOUT_EXIT"
            urgency = "WARNING"
            countdown_seconds = None
            remaining_mins = max(5, 15 - (elapsed % 15))
            exit_time = (now + timedelta(minutes=remaining_mins)).strftime("%I:%M %p IST") if is_market_open else "Next Open: ~09:30 AM IST"
            action_guidance = f"RECOMMENDATION: TIGHTEN STOP / PREPARE TO EXIT. Momentum is flattening near ₹{current_price}. Move stop-loss to ₹{suggested_trail_stop}. If price does not break above ₹{round(current_price + (atr*0.4), 2)} by {exit_time}, EXIT to avoid time decay."
            reason = f"Momentum is flattening (RSI: {rsi:.1f}) and volume is drying up. Risk of choppy sideways consolidation."
            probs = {"UP": 0.25, "SIDEWAYS": 0.55, "DOWN": 0.20}
            
        else:
            # Case A: STILL BULLISH
            state = "STILL_BULLISH"
            state_display = "🟢 STILL BULLISH (HOLD POSITION)"
            recommended_action = "HOLD"
            urgency = "NORMAL"
            countdown_seconds = None
            remaining_mins = max(10, initial_horizon_minutes - elapsed)
            exit_time = (now + timedelta(minutes=remaining_mins)).strftime("%I:%M %p IST") if is_market_open else "Next Open: ~09:45 AM IST"
            if pnl >= 0:
                action_guidance = f"RECOMMENDATION: HOLD POSITION. You are in profit (+₹{pnl:.2f}, +{pnl_pct:.2f}%). Target is ₹{target_price}. Move trailing stop to ₹{suggested_trail_stop} to lock in your gains."
            else:
                action_guidance = f"RECOMMENDATION: HOLD WITH STRICT STOP. Position is currently at -₹{abs(pnl):.2f} ({pnl_pct:.2f}%). Bullish setup is still intact. Keep your stop-loss firmly at ₹{suggested_trail_stop}."
            reason = f"Bullish structure intact: price trading above VWAP with healthy upward momentum (RSI: {rsi:.1f})."
            probs = {"UP": 0.74, "SIDEWAYS": 0.16, "DOWN": 0.10}

        if not is_market_open:
            action_guidance = f"🔴 {market_status_text}. " + action_guidance
            state_display = f"⏸️ {state_display} (Market Closed)"

        return TimedExitResponse(
            symbol=symbol,
            entry_price=entry_price,
            entry_time=entry_time_str,
            current_price=current_price,
            current_pnl=pnl,
            current_pnl_percent=pnl_pct,
            elapsed_minutes=elapsed,
            state=state,
            state_display=state_display,
            current_probability=probs,
            recommended_action=recommended_action,
            recommended_exit_clock_time=exit_time,
            remaining_expected_minutes=remaining_mins,
            recommended_trailing_stop=suggested_trail_stop,
            urgency=urgency,
            countdown_seconds=countdown_seconds,
            action_guidance=action_guidance,
            reason=reason
        )
