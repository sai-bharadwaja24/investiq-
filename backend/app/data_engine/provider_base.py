from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.models.schemas import StockQuote, Candle, MarketIndex, MarketMovers

class MarketDataProvider(ABC):
    @abstractmethod
    def get_quote(self, symbol: str) -> StockQuote:
        pass

    @abstractmethod
    def get_candles(self, symbol: str, timeframe: str = "5m", count: int = 100) -> List[Candle]:
        pass

    @abstractmethod
    def get_indices(self) -> List[MarketIndex]:
        pass

    @abstractmethod
    def get_market_movers(self) -> MarketMovers:
        pass

    @abstractmethod
    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        pass
