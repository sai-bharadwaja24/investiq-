from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.chat_engine.trading_bot import default_trading_copilot

router = APIRouter(prefix="/chat", tags=["Smart Trading Chatbot"])

@router.post("", response_model=ChatResponse)
def chat_with_copilot(req: ChatRequest):
    """
    Real-time, context-aware AI Trading Copilot endpoint.
    Accepts conversation history and active stock context (price, VWAP, Senior Analyst verdict, 5x margin).
    """
    if not req.messages:
        raise HTTPException(status_code=400, detail="At least one message is required.")
    
    return default_trading_copilot.process_chat(
        messages=req.messages,
        context=req.context,
        api_key=req.api_key
    )
