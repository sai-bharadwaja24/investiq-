from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import ActiveTradeRequest, TimedExitResponse
from app.trade_monitor.position_tracker import position_tracker
from app.trade_monitor.timed_exit import TimedExitAdvisor
from app.data_engine.yahoo_provider import YahooDataProvider
from app.technical.indicators import TechnicalAnalyzer

router = APIRouter(prefix="/trades", tags=["Trade Monitor"])
provider = YahooDataProvider()

@router.post("/track")
def track_trade(req: ActiveTradeRequest):
    return position_tracker.add_trade(req)

@router.get("/active", response_model=List[Dict[str, Any]])
def get_active_trades():
    trades = position_tracker.get_all_trades()
    results = []
    for t in trades:
        quote = provider.get_quote(t["symbol"])
        is_sell = t.get("side", "BUY") == "SELL"
        price_diff = (t["entry_price"] - quote.price) if is_sell else (quote.price - t["entry_price"])
        pnl = round(price_diff * t.get("quantity", 1), 2)
        pnl_pct = round((price_diff / t["entry_price"]) * 100, 2)
        t_copy = dict(t)
        t_copy["current_price"] = quote.price
        t_copy["pnl"] = pnl
        t_copy["pnl_percent"] = pnl_pct
        results.append(t_copy)
    return results

@router.get("/evaluate/{symbol}", response_model=TimedExitResponse)
def evaluate_trade_by_symbol(symbol: str, entry_price: float, entry_time: str = "10:00 AM"):
    quote = provider.get_quote(symbol)
    candles = provider.get_candles(symbol, timeframe="5m", count=80)
    features = TechnicalAnalyzer.extract_features(candles)
    
    evaluation = TimedExitAdvisor.evaluate_active_trade(
        symbol=quote.symbol,
        entry_price=entry_price,
        entry_time_str=entry_time,
        current_price=quote.price,
        features=features
    )
    return evaluation

@router.delete("/{trade_id}")
def close_trade(trade_id: str):
    success = position_tracker.close_trade(trade_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"status": "closed", "trade_id": trade_id}
