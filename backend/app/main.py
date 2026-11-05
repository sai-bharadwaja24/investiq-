import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.websocket_manager import ws_manager
from app.data_engine.yahoo_provider import default_provider
from app.data_engine.live_streamer import LiveMarketStreamer
from app.api.routes import markets, stocks, predictions, trade_monitor, fundamentals, compare, learn, news, chat

provider = default_provider
streamer = LiveMarketStreamer(provider)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: start live background streamer
    streamer.start()
    yield
    # Shutdown
    streamer.stop()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="InvestIQ: Real-Time Stock Market Intelligence & Intraday Direction Decision Platform",
    lifespan=lifespan
)

from urllib.parse import parse_qs, urlencode
from starlette.types import ASGIApp, Scope, Receive, Send

class VercelPathRewriteMiddleware:
    """Unwraps Vercel rewrite capture groups so FastAPI routes match cleanly."""
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            query_string = scope.get("query_string", b"").decode("utf-8")
            if "_raw_path" in query_string:
                params = parse_qs(query_string, keep_blank_values=True)
                if "_raw_path" in params:
                    raw_path = params.pop("_raw_path")[0].lstrip("/")
                    scope["path"] = f"/api/{raw_path}" if raw_path else "/api"
                    scope["raw_path"] = scope["path"].encode("utf-8")
                    new_qs = []
                    for k, vals in params.items():
                        for v in vals:
                            new_qs.append(f"{k}={v}")
                    scope["query_string"] = "&".join(new_qs).encode("utf-8")
        await self.app(scope, receive, send)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(VercelPathRewriteMiddleware)

# Include Routers
app.include_router(markets.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(trade_monitor.router, prefix="/api")
app.include_router(fundamentals.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(learn.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health_check():
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "investiq-backend",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
        "market_provider": "Yahoo Finance (FastInfo) + Live Synthesizer",
        "environment": "production"
    }

from app.prediction_engine.performance_tracker import PerformanceTracker

@app.get("/performance")
@app.get("/api/performance")
def get_performance_metrics():
    """Public credibility endpoint logging predictions against outcomes, Brier score, and reliability curves."""
    return PerformanceTracker.get_public_performance()

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/api/index.py")
    @app.get("/api/debug-path")
    @app.get("/debug-path")
    def debug_path(request: Request):
        return {
            "url": str(request.url),
            "path": request.url.path,
            "scope": {k: str(v) for k, v in request.scope.items() if k not in ("app",)},
            "headers": dict(request.headers)
        }

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(
                status_code=404,
                content={"detail": f"API route not found: /{full_path}"}
            )
        target = frontend_dist / full_path
        if target.is_file():
            return FileResponse(target)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def read_root():
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "market_provider": "Yahoo Finance (FastInfo) + Live Synthesizer",
            "description": "Stock Market Intelligence & Intraday Direction Decision Platform"
        }

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                action = msg.get("action")
                symbol = msg.get("symbol")
                if action == "subscribe" and symbol:
                    ws_manager.subscribe(websocket, symbol)
                    # Send immediate current quote
                    quote = provider.get_quote(symbol)
                    await websocket.send_text(json.dumps({
                        "type": "INITIAL_QUOTE",
                        "symbol": quote.symbol,
                        "data": quote.dict()
                    }))
                elif action == "unsubscribe" and symbol:
                    ws_manager.unsubscribe(websocket, symbol)
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
