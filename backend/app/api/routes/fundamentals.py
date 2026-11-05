from fastapi import APIRouter
from app.models.schemas import FundamentalAnalysis
from app.data_engine.yahoo_provider import default_provider
from app.fundamental.scoring import FundamentalAnalyzer

router = APIRouter(prefix="/stocks", tags=["Fundamentals"])
provider = default_provider

@router.get("/{symbol}/fundamentals", response_model=FundamentalAnalysis)
def get_fundamentals(symbol: str):
    raw_data = provider.get_fundamentals(symbol)
    quote = provider.get_quote(symbol)
    raw_data["name"] = quote.name
    analysis = FundamentalAnalyzer.analyze(quote.symbol, raw_data)
    return analysis
