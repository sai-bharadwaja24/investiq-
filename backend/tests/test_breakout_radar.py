import pytest
from app.prediction_engine.breakout_radar import BreakoutRadarScanner, default_radar_scanner
from app.models.schemas import StockQuote

class MockProvider:
    def get_quote(self, sym: str) -> StockQuote:
        if sym == "IFCI":
            # Severe breakdown
            return StockQuote(
                symbol="IFCI", ticker="IFCI.NS", name="IFCI Ltd",
                price=92.5, change=-10.0, change_percent=-9.75,
                open=102.0, high=103.5, low=92.2, previous_close=102.5,
                volume=170000000, is_market_open=True, timestamp="14:00:00 IST"
            )
        elif sym == "TATASTEEL":
            # Strong rise
            return StockQuote(
                symbol="TATASTEEL", ticker="TATASTEEL.NS", name="Tata Steel Ltd",
                price=158.0, change=5.5, change_percent=3.6,
                open=152.0, high=159.0, low=151.5, previous_close=152.5,
                volume=45000000, is_market_open=True, timestamp="14:00:00 IST"
            )
        else:
            return StockQuote(
                symbol=sym, ticker=f"{sym}.NS", name=sym,
                price=100.0, change=0.2, change_percent=0.2,
                open=100.0, high=100.5, low=99.5, previous_close=99.8,
                volume=1000000, is_market_open=True, timestamp="14:00:00 IST"
            )

def test_breakout_radar_classification():
    scanner = BreakoutRadarScanner(provider=MockProvider())
    res = scanner.scan_big_movers()
    
    assert res.total_count >= 2
    assert res.fall_candidates_count >= 1
    assert res.rise_candidates_count >= 1

    # Check IFCI classification
    ifci = next((m for m in res.movers if m.symbol == "IFCI"), None)
    assert ifci is not None
    assert ifci.move_type == "GREAT_FALL"
    assert "GREAT FALL" in ifci.badge_text
    assert ifci.confidence_score >= 80
    assert ifci.target_price < ifci.current_price
    assert ifci.risk_level == "EXTREME"
    assert "VWAP" in ifci.technical_catalyst

    # Check TATASTEEL classification
    tata = next((m for m in res.movers if m.symbol == "TATASTEEL"), None)
    assert tata is not None
    assert tata.move_type == "GREAT_RISE"
    assert "GREAT RISE" in tata.badge_text
    assert tata.target_price > tata.current_price
