import asyncio
import time
from datetime import datetime
from app.core.websocket_manager import ws_manager
from app.data_engine.yahoo_provider import YahooDataProvider, default_provider
from app.config import settings

class LiveMarketStreamer:
    def __init__(self, provider: YahooDataProvider = default_provider):
        self.provider = provider
        self.is_running = False
        self._task = None

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_loop())

    def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()

    async def _run_loop(self):
        base_symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "TATASTEEL", "ITC", "SBIN"]
        while self.is_running:
            try:
                # Prioritize currently viewed symbols from any connected user
                active_symbols = list(ws_manager.get_subscribed_symbols())
                # If no user is actively viewing a specific stock, stream the base watchlist
                symbols_to_stream = active_symbols if active_symbols else base_symbols

                for sym in symbols_to_stream:
                    # Get 100% real live quote from exchange via provider
                    quote = self.provider.get_quote(sym)
                    
                    tick_data = {
                        "symbol": sym,
                        "price": quote.price,
                        "change": quote.change,
                        "change_percent": quote.change_percent,
                        "volume": quote.volume,
                        "timestamp": datetime.now().strftime("%H:%M:%S IST")
                    }
                    
                    await ws_manager.broadcast_tick(sym, tick_data)
                
                await asyncio.sleep(1.5)  # Stream fresh ticks every 1.5s
            except asyncio.CancelledError:
                break
            except Exception:
                await asyncio.sleep(3.0)
