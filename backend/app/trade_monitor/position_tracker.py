import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.models.schemas import ActiveTradeRequest

class PositionTracker:
    def __init__(self):
        self._positions: Dict[str, Dict] = {}

    def add_trade(self, req: ActiveTradeRequest) -> Dict:
        trade_id = str(uuid.uuid4())[:8]
        trade = {
            "id": trade_id,
            "symbol": req.symbol.upper(),
            "entry_price": req.entry_price,
            "entry_time": req.entry_time,
            "target_price": req.target_price or round(req.entry_price * 1.015, 2),
            "stop_loss": req.stop_loss or round(req.entry_price * 0.992, 2),
            "quantity": req.quantity,
            "side": (req.side or "BUY").upper(),
            "created_at": datetime.now().isoformat()
        }
        self._positions[trade_id] = trade
        return trade

    def get_trade(self, trade_id: str) -> Optional[Dict]:
        return self._positions.get(trade_id)

    def get_all_trades(self) -> List[Dict]:
        return list(self._positions.values())

    def close_trade(self, trade_id: str) -> bool:
        if trade_id in self._positions:
            del self._positions[trade_id]
            return True
        return False

position_tracker = PositionTracker()
