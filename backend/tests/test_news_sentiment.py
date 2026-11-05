import pytest
from app.news_engine.sentiment_analyzer import NewsSentimentAnalyzer

def test_bullish_order_win():
    headline = "Tata Steel bags massive ₹2,400 Cr green steel order in Europe"
    res = NewsSentimentAnalyzer.analyze(headline, "", "TATASTEEL")
    assert res["sentiment"] == "BULLISH"
    assert "RISE CATALYST" in res["impact_badge"]
    assert res["impact_severity"] == "HIGH"
    assert "+" in res["expected_impact_range"]
    assert "revenue visibility" in res["why_it_matters"].lower()

def test_bullish_earnings_beat():
    headline = "TCS Q1 profit surges 18% beating Street estimates; dividend declared"
    res = NewsSentimentAnalyzer.analyze(headline, "", "TCS")
    assert res["sentiment"] == "BULLISH"
    assert "RISE CATALYST" in res["impact_badge"]
    assert "earnings" in res["why_it_matters"].lower()

def test_bearish_executive_exit():
    headline = "Tata Motors slides 4% after Chairman Chandrasekaran quits unexpectedly"
    res = NewsSentimentAnalyzer.analyze(headline, "", "TATAMOTORS")
    assert res["sentiment"] == "BEARISH"
    assert "FALL RISK" in res["impact_badge"]
    assert res["impact_severity"] == "HIGH"
    assert "-" in res["expected_impact_range"]

def test_bearish_target_downgrade():
    headline = "Brokerage downgrades Infosys to sell, cuts target price citing US banking slowdown"
    res = NewsSentimentAnalyzer.analyze(headline, "", "INFY")
    assert res["sentiment"] == "BEARISH"
    assert "FALL RISK" in res["impact_badge"]
    assert "target" in res["why_it_matters"].lower() or "selling" in res["why_it_matters"].lower()

def test_neutral_headline():
    headline = "Reliance Industries holds annual general meeting; discusses operational milestones"
    res = NewsSentimentAnalyzer.analyze(headline, "", "RELIANCE")
    assert res["sentiment"] == "NEUTRAL"
    assert "NEUTRAL" in res["impact_badge"]
