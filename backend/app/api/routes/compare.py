from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.data_engine.yahoo_provider import default_provider
from app.fundamental.scoring import FundamentalAnalyzer

router = APIRouter(prefix="/stocks", tags=["Compare"])
provider = default_provider

@router.get("/compare/multiquote")
def compare_stocks(symbols: str = Query("TCS,INFY,RELIANCE", description="Comma-separated list of symbols")):
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()][:5]
    if not sym_list:
        sym_list = ["TCS", "INFY"]
        
    compared = []
    for s in sym_list:
        quote = provider.get_quote(s)
        raw_fund = provider.get_fundamentals(s)
        raw_fund["name"] = quote.name
        fund = FundamentalAnalyzer.analyze(quote.symbol, raw_fund)
        
        compared.append({
            "symbol": quote.symbol,
            "name": quote.name,
            "price": quote.price,
            "change_percent": quote.change_percent,
            "overall_score": fund.overall_score,
            "verdict": fund.verdict,
            "verdict_badge": fund.verdict_badge,
            "roe": raw_fund.get("roe", 20.0),
            "roce": raw_fund.get("roce", 24.0),
            "debt_to_equity": raw_fund.get("debt_to_equity", 0.3),
            "pe_ratio": raw_fund.get("pe_ratio", 25.0),
            "operating_margin": raw_fund.get("operating_margin", 20.0),
            "revenue_growth": raw_fund.get("revenue_growth_1y", 12.0),
            "category_scores": fund.category_scores
        })
        
    # Generate beginner takeaway
    highest_score = max(compared, key=lambda x: x["overall_score"])
    lowest_pe = min(compared, key=lambda x: x["pe_ratio"])
    
    takeaway = (
        f"{highest_score['symbol']} shows the highest overall fundamental quality ({highest_score['overall_score']}/100), "
        f"while {lowest_pe['symbol']} trades at the relatively more attractive P/E valuation ({lowest_pe['pe_ratio']}x). "
        "A balanced investor may consider accumulating the higher-quality company on price dips or looking into the valuation advantage of the peer."
    )
    
    return {
        "stocks": compared,
        "beginner_takeaway": takeaway
    }
