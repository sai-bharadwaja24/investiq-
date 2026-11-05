import pytest
from app.fundamental.scoring import FundamentalAnalyzer

def test_high_quality_stock_scoring():
    # Strong company: high ROE, low debt, high margins
    raw_data = {
        "roe": 28.0,
        "roce": 32.0,
        "debt_to_equity": 0.1,
        "current_ratio": 2.2,
        "interest_coverage": 25.0,
        "profit_margin": 22.0,
        "operating_margin": 26.0,
        "pe_ratio": 22.0,
        "pb_ratio": 4.5,
        "dividend_yield": 2.1,
        "revenue_growth_1y": 18.0,
        "profit_growth_1y": 20.0
    }
    analysis = FundamentalAnalyzer.analyze("TCS", raw_data)
    assert 0 <= analysis.overall_score <= 100
    assert analysis.overall_score >= 75, f"High quality stock should score >= 75, got {analysis.overall_score}"
    assert "ATTRACTIVE BUY" in analysis.verdict
    assert analysis.verdict_badge == "green"
    assert len(analysis.positive_factors) > 0

def test_distressed_stock_scoring():
    # Weak company: negative margins, high debt
    raw_data = {
        "roe": 2.0,
        "roce": 4.0,
        "debt_to_equity": 2.5,
        "current_ratio": 0.8,
        "interest_coverage": 1.1,
        "profit_margin": 1.5,
        "operating_margin": 3.0,
        "pe_ratio": 85.0,
        "pb_ratio": 8.0,
        "dividend_yield": 0.0,
        "revenue_growth_1y": -5.0,
        "profit_growth_1y": -15.0
    }
    analysis = FundamentalAnalyzer.analyze("DISTRESSED", raw_data)
    assert 0 <= analysis.overall_score <= 100
    assert analysis.overall_score < 55, f"Distressed stock should score < 55, got {analysis.overall_score}"
    assert "AVOID" in analysis.verdict
    assert analysis.verdict_badge == "red"
