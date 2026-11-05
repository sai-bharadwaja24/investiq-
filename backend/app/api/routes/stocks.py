from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from app.models.schemas import StockQuote, Candle
from app.data_engine.yahoo_provider import default_provider
from app.technical.indicators import TechnicalAnalyzer
from app.config import settings

router = APIRouter(prefix="/stocks", tags=["Stocks"])
provider = default_provider

import urllib.request
import urllib.parse
import json
from app.data_engine.nse_stocks_master import search_nse_directory

@router.get("/search", response_model=List[Dict[str, Any]])
def search_stocks(q: str = Query("", min_length=1)):
    query = q.upper().strip()
    results = []
    seen = set()

    # 1. Search comprehensive in-memory NSE stocks directory (sub-millisecond)
    nse_matches = search_nse_directory(query, limit=10)
    for s in nse_matches:
        sym = s["symbol"]
        if sym in seen:
            continue
        seen.add(sym)

        # Check instant quote cache
        cached_entry = provider._quote_cache.get(s["ticker"]) or provider._quote_cache.get(sym)
        price = cached_entry[1].price if cached_entry else None
        change = cached_entry[1].change if cached_entry else 0.0
        change_pct = cached_entry[1].change_percent if cached_entry else 0.0

        results.append({
            "symbol": sym,
            "ticker": s["ticker"],
            "name": s["name"],
            "sector": s.get("sector", "Equities"),
            "price": price,
            "change": change,
            "change_percent": change_pct,
        })

    # 2. If fewer than 4 results, query Yahoo Finance search API (fallback for any unlisted or global stock)
    if len(results) < 4:
        try:
            url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(query)}&quotesCount=8&newsCount=0"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for qitem in data.get("quotes", []):
                    ticker = qitem.get("symbol", "")
                    clean_sym = ticker.replace(".NS", "").replace(".BO", "")
                    if clean_sym in seen:
                        continue
                    seen.add(clean_sym)
                    
                    name = qitem.get("shortname") or qitem.get("longname") or clean_sym
                    sector = qitem.get("sector") or qitem.get("industry") or ("NSE" if ".NS" in ticker else "Equities")
                    
                    results.append({
                        "symbol": clean_sym,
                        "ticker": ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{clean_sym}.NS",
                        "name": name,
                        "sector": sector,
                        "price": None,
                        "change": 0.0,
                        "change_percent": 0.0,
                    })
                    if len(results) >= 8:
                        break
        except Exception:
            pass

    # 3. If exact query itself wasn't found, insert it at the very top as a custom NSE ticker
    if not any(r["symbol"] == query for r in results):
        results.insert(0, {
            "symbol": query,
            "ticker": f"{query}.NS",
            "name": f"{query} (NSE)",
            "sector": "Equities",
            "price": None,
            "change": 0.0,
            "change_percent": 0.0,
        })

    return results[:8]

@router.get("/{symbol}/quote", response_model=StockQuote)
def get_stock_quote(symbol: str):
    return provider.get_quote(symbol)

@router.get("/{symbol}/candles", response_model=List[Candle])
def get_stock_candles(symbol: str, timeframe: str = "5m", count: int = 100):
    return provider.get_candles(symbol, timeframe=timeframe, count=count)

@router.get("/{symbol}/technical")
def get_technical_analysis(symbol: str):
    candles = provider.get_candles(symbol, timeframe="5m", count=80)
    features = TechnicalAnalyzer.extract_features(candles)
    return features

from app.prediction_engine.candlestick_patterns import default_pattern_detector
from app.models.schemas import CandlePatternAnalysisResponse

@router.get("/{symbol}/candlestick-patterns", response_model=CandlePatternAnalysisResponse)
def get_candlestick_patterns(symbol: str, timeframe: str = "5m"):
    candles = provider.get_candles(symbol, timeframe=timeframe, count=80)
    return default_pattern_detector.analyze(symbol, candles, timeframe=timeframe)

from app.prediction_engine.senior_analyst import default_senior_analyst
from app.models.schemas import SeniorAnalystVerdictResponse
from app.math_engine.pattern_matcher import PatternMatcher
from app.ml_engine.models import IntradayMLPredictor

@router.get("/{symbol}/senior-analyst", response_model=SeniorAnalystVerdictResponse)
def get_senior_analyst_verdict(symbol: str, timeframe: str = "5m", horizon: int = 30):
    quote = provider.get_quote(symbol)
    candles = provider.get_candles(symbol, timeframe=timeframe, count=80)
    features = TechnicalAnalyzer.extract_features(candles)
    precedents = PatternMatcher.find_historical_precedents(features)
    ml_prediction = IntradayMLPredictor.predict(
        symbol=quote.symbol,
        current_price=quote.price,
        features=features,
        historical_stats=precedents,
        horizon_minutes=horizon
    )
    candle_analysis = default_pattern_detector.analyze(symbol, candles, timeframe=timeframe)
    return default_senior_analyst.evaluate(
        quote=quote,
        features=features,
        ml_prediction=ml_prediction,
        candlestick_analysis=candle_analysis,
        candles=candles
    )


