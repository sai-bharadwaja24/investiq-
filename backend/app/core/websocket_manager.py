from typing import Dict, Set, Any
from fastapi import WebSocket
import json
import asyncio

class WebSocketManager:
    def __init__(self):
        # Map symbol -> set of active WebSockets
        self._subscriptions: Dict[str, Set[WebSocket]] = {}
        self._all_clients: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._all_clients.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self._all_clients.discard(websocket)
        for symbol, clients in list(self._subscriptions.items()):
            clients.discard(websocket)
            if not clients:
                del self._subscriptions[symbol]

    def subscribe(self, websocket: WebSocket, symbol: str):
        s = symbol.upper().strip()
        if s not in self._subscriptions:
            self._subscriptions[s] = set()
        self._subscriptions[s].add(websocket)

    def unsubscribe(self, websocket: WebSocket, symbol: str):
        s = symbol.upper().strip()
        if s in self._subscriptions:
            self._subscriptions[s].discard(websocket)

    def get_subscribed_symbols(self) -> Set[str]:
        return set(self._subscriptions.keys())

    async def broadcast_tick(self, symbol: str, data: Dict[str, Any]):
        s = symbol.upper().strip()
        if s in self._subscriptions:
            message = json.dumps({"type": "TICK", "symbol": s, "data": data})
            dead_clients = set()
            for client in self._subscriptions[s]:
                try:
                    await client.send_text(message)
                except Exception:
                    dead_clients.add(client)
            for dead in dead_clients:
                self.disconnect(dead)

    async def broadcast_all(self, event_type: str, data: Dict[str, Any]):
        message = json.dumps({"type": event_type, "data": data})
        dead_clients = set()
        for client in self._all_clients:
            try:
                await client.send_text(message)
            except Exception:
                dead_clients.add(client)
        for dead in dead_clients:
            self.disconnect(dead)

ws_manager = WebSocketManager()
