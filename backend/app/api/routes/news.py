from fastapi import APIRouter
from typing import List
from app.models.schemas import StockNewsItem, StockNewsResponse
from app.data_engine.yahoo_provider import default_provider

router = APIRouter(tags=["News & Catalysts"])

@router.get("/stocks/{symbol}/news", response_model=StockNewsResponse)
def get_stock_news(symbol: str):
    news_items = default_provider.get_stock_news(symbol)
    clean_symbol = symbol.replace(".NS", "").replace(".BO", "").replace("^", "").upper()
    return StockNewsResponse(
        symbol=clean_symbol,
        count=len(news_items),
        news=news_items
    )

@router.get("/markets/news", response_model=List[StockNewsItem])
def get_market_news():
    return default_provider.get_market_news()
