import pytest
from app.models.schemas import ChatMessage, ChatContext, ChatRequest
from app.chat_engine.trading_bot import default_trading_copilot

def test_chat_zaggle_avoid_context():
    messages = [
        ChatMessage(role="user", content="Should I buy right now? Is it safe?")
    ]
    context = ChatContext(
        symbol="ZAGGLE",
        name="Zaggle Prepaid Ocean Services",
        price=179.50,
        vwap=182.80,
        senior_verdict="AVOID_SELL",
        conviction_percent=88,
        active_pattern="Inverted Hammer",
        pattern_sentiment="BULLISH",
        target_price=176.88,
        stop_loss=181.16
    )
    
    res = default_trading_copilot.process_chat(messages, context)
    assert res.context_stock == "ZAGGLE"
    assert "AVOID" in res.reply
    assert "VWAP" in res.reply
    assert "trap" in res.reply.lower()

def test_chat_ifci_profit_calculation():
    messages = [
        ChatMessage(role="user", content="What is my profit on 722 shares if target is 77.05?")
    ]
    context = ChatContext(
        symbol="IFCI",
        name="IFCI Ltd",
        price=75.75,
        target_price=77.05,
        stop_loss=74.80,
        quantity=722,
        product_type="INTRADAY",
        user_balance=10974.0
    )
    
    res = default_trading_copilot.process_chat(messages, context)
    assert res.context_stock == "IFCI"
    # 722 * (77.05 - 75.75) = 938.60
    assert "938.60" in res.reply or "938" in res.reply
    assert "Margin" in res.reply

def test_chat_groww_margin_explanation():
    messages = [
        ChatMessage(role="user", content="How does 5x margin work on Groww?")
    ]
    res = default_trading_copilot.process_chat(messages, None)
    assert "5x" in res.reply
    assert "3:20 PM" in res.reply or "SEBI" in res.reply

def test_chat_stock_suggestions_dashboard_mode():
    messages = [
        ChatMessage(role="assistant", content="Welcome to InvestIQ AI Trading Copilot!"),
        ChatMessage(role="user", content="suggest me some good stocks to buy for intraday")
    ]
    context = ChatContext(timeframe="5m", quantity=722, product_type="INTRADAY", user_balance=10974.0)
    res = default_trading_copilot.process_chat(messages, context)
    assert res.context_stock is None
    assert "Recommendations" in res.reply or "Intraday" in res.reply
    assert "Groww 5x Margin" in res.reply
    assert "Target" in res.reply
    assert "Stop-Loss" in res.reply

def test_chat_budget_stocks_query():
    messages = [
        ChatMessage(role="user", content="Which budget stocks under 500 should I buy for intraday?")
    ]
    context = ChatContext(timeframe="5m", quantity=722, product_type="INTRADAY")
    res = default_trading_copilot.process_chat(messages, context)
    assert "Budget" in res.reply or "500" in res.reply
    assert "Margin" in res.reply

def test_chat_already_near_day_high_breakout_reasoning():
    messages = [
        ChatMessage(role="user", content="suzlon is at 43.40 right now and its todays high is 43.75 how can it go high as it is already high")
    ]
    context = ChatContext(
        symbol="SUZLON",
        name="Suzlon Energy Ltd",
        price=43.40,
        high=43.75,
        low=42.60,
        vwap=43.10
    )
    res = default_trading_copilot.process_chat(messages, context)
    assert "Breakout" in res.reply or "Trap" in res.reply
    assert "43.75" in res.reply
    assert "Short Squeeze" in res.reply or "resistance" in res.reply.lower()
    assert "Risk" in res.reply or "risk" in res.reply.lower()

def test_chat_dip_buying_with_typos():
    messages = [
        ChatMessage(role="user", content="tell those stock in dip which are rready yo rise")
    ]
    res = default_trading_copilot.process_chat(messages, None)
    assert "Buy-on-Dip" in res.reply or "Rebound" in res.reply or "Dip" in res.reply
    assert "TATASTEEL" in res.reply or "Tata Steel" in res.reply
    assert "VWAP" in res.reply
    assert "Groww 5x Margin" in res.reply
    assert "Target" in res.reply
    assert "Stop-Loss" in res.reply
    assert "I hear your thought on" not in res.reply

def test_chat_breakout_setups_query():
    messages = [
        ChatMessage(role="user", content="Which stocks are breaking out today?")
    ]
    res = default_trading_copilot.process_chat(messages, None)
    assert "Breakout" in res.reply or "Momentum" in res.reply
    assert "RVNL" in res.reply or "IREDA" in res.reply
    assert "Target" in res.reply
    assert "Stop" in res.reply

def test_chat_general_query_desk_scan_no_boilerplate():
    messages = [
        ChatMessage(role="user", content="what is your strategy for today's market?")
    ]
    res = default_trading_copilot.process_chat(messages, None)
    assert "I hear your thought on" not in res.reply
    assert "Market Radar" in res.reply or "Senior Market Analyst" in res.reply
    assert "TATASTEEL" in res.reply or "RVNL" in res.reply

def test_chat_live_context_price_sync():
    """Verify that when a stock is on screen, chatbot dynamically uses screen context prices rather than stale baselines."""
    messages = [
        ChatMessage(role="user", content="Stocks in dip ready to rise")
    ]
    context = ChatContext(
        symbol="BEL",
        name="Bharat Electronics Ltd",
        price=398.20,
        high=399.20,
        low=395.15,
        vwap=397.40,
        target_price=405.37,
        stop_loss=391.80,
        change_percent=1.25
    )
    res = default_trading_copilot.process_chat(messages, context)
    # Must use screen context values
    assert "398.20" in res.reply or "398.2" in res.reply
    assert "405.37" in res.reply
    assert "391.80" in res.reply or "391.8" in res.reply
    # Should NOT use old stale mock values like 305.20 or 318.00
    assert "305.20" not in res.reply
    assert "318.00" not in res.reply


