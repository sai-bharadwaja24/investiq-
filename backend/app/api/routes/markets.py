from fastapi import APIRouter, Depends
from typing import List
from app.models.schemas import MarketIndex, MarketMovers, BigMoversResponse, BudgetStocksResponse
from app.data_engine.yahoo_provider import default_provider
from app.prediction_engine.breakout_radar import default_radar_scanner

router = APIRouter(prefix="/markets", tags=["Markets"])
provider = default_provider
radar = default_radar_scanner

@router.get("/indices", response_model=List[MarketIndex])
def get_indices():
    return provider.get_indices()

@router.get("/movers", response_model=MarketMovers)
def get_movers():
    return provider.get_market_movers()

@router.get("/big-movers", response_model=BigMoversResponse)
def get_big_movers():
    return radar.scan_big_movers()

@router.get("/budget-stocks", response_model=BudgetStocksResponse)
def get_budget_stocks():
    return provider.get_budget_stocks()


