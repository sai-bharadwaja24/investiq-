from fastapi import APIRouter, Query
from app.models.schemas import IntradayPredictionResponse
from app.data_engine.yahoo_provider import default_provider
from app.technical.indicators import TechnicalAnalyzer
from app.math_engine.pattern_matcher import PatternMatcher
from app.ml_engine.models import IntradayMLPredictor

router = APIRouter(prefix="/stocks", tags=["Predictions"])
provider = default_provider

@router.get("/{symbol}/prediction", response_model=IntradayPredictionResponse)
def get_intraday_prediction(symbol: str, horizon: int = Query(30, description="Horizon in minutes (15, 30, 45, 60)")):
    quote = provider.get_quote(symbol)
    candles = provider.get_candles(symbol, timeframe="5m", count=80)
    features = TechnicalAnalyzer.extract_features(candles)
    precedents = PatternMatcher.find_historical_precedents(features)
    
    prediction = IntradayMLPredictor.predict(
        symbol=quote.symbol,
        current_price=quote.price,
        features=features,
        historical_stats=precedents,
        horizon_minutes=horizon
    )
    return prediction
