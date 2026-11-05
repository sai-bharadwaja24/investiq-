from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/learn", tags=["Learn Center"])

LESSONS: List[Dict[str, Any]] = [
    {
        "id": "what-is-a-stock",
        "title": "What is a Stock?",
        "category": "Foundations",
        "difficulty": "Beginner",
        "reading_time": "3 min",
        "summary": "Owning a fractional piece of a real company and participating in its profits.",
        "content": "When you buy a share of a company like Reliance or TCS, you become a part-owner (shareholder). If the company grows its revenues and profits, the value of your shares increases, and you may also receive regular cash dividends.",
        "key_takeaway": "Think like a business owner, not a gambler. Price follows business earnings over the long run."
    },
    {
        "id": "understanding-nifty-sensex",
        "title": "What is NIFTY 50 and SENSEX?",
        "category": "Foundations",
        "difficulty": "Beginner",
        "reading_time": "3 min",
        "summary": "Barometers measuring the overall pulse and direction of the Indian economy.",
        "content": "NIFTY 50 represents the top 50 largest and most actively traded companies on the National Stock Exchange (NSE). SENSEX represents 30 bellwether companies on the Bombay Stock Exchange (BSE). When news says 'the market is up 1%', they mean NIFTY or SENSEX went up 1%.",
        "key_takeaway": "Indices give you the macroeconomic backdrop. When the market is in a strong uptrend, individual stocks have higher probability of succeeding."
    },
    {
        "id": "pe-ratio-explained",
        "title": "What is P/E Ratio (Price-to-Earnings)?",
        "category": "Fundamental Analysis",
        "difficulty": "Beginner",
        "reading_time": "4 min",
        "summary": "Understanding whether a stock is cheap, fair, or overpriced.",
        "content": "P/E tells you how much money investors are willing to pay for every ₹1 of profit the company generates. If a company earns ₹10 per share and its stock trades at ₹250, its P/E is 25x. A lower P/E relative to industry peers can indicate good value, while a high P/E means high expectations are already priced in.",
        "key_takeaway": "Never buy based on P/E alone. A low P/E might be a value trap if the business is dying, and a high P/E might be justified by hyper-growth."
    },
    {
        "id": "roe-and-roce",
        "title": "Why ROE and ROCE are the Gold Standard",
        "category": "Fundamental Analysis",
        "difficulty": "Beginner",
        "reading_time": "4 min",
        "summary": "Measuring how effectively management generates profit from invested capital.",
        "content": "ROE (Return on Equity) measures net profit generated on shareholders' equity. ROCE (Return on Capital Employed) evaluates profit on both equity and debt capital. Companies that consistently deliver ROCE above 20% year after year possess a competitive advantage ('moat').",
        "key_takeaway": "Warren Buffett considers sustained high ROE with low debt to be the single most important hallmark of exceptional companies."
    },
    {
        "id": "candlestick-basics",
        "title": "How to Read a Candlestick Chart",
        "category": "Technical Analysis",
        "difficulty": "Beginner",
        "reading_time": "4 min",
        "summary": "The battle between buyers and sellers visualized over time.",
        "content": "Every candle summarizes 4 key prices: Open, High, Low, and Close (OHLC). A Green candle means buyers pushed the close above the open. A Red candle means sellers pushed the close below the open. The thin lines ('wicks' or 'shadows') reveal price rejection.",
        "key_takeaway": "Candlesticks reveal psychology. A long bottom wick shows buyers aggressively rejected lower prices and stepped in to buy."
    },
    {
        "id": "vwap-intraday-anchor",
        "title": "VWAP: The Institutional Benchmark",
        "category": "Intraday Analysis",
        "difficulty": "Intermediate",
        "reading_time": "4 min",
        "summary": "The true fair price of a stock weighted by every traded share.",
        "content": "Volume-Weighted Average Price (VWAP) represents the average price big institutions bought and sold throughout the trading day. When price is above VWAP, buyers are in control. When price breaks below VWAP, sellers dominate.",
        "key_takeaway": "In intraday trading, buying when the stock is cleanly holding above VWAP dramatically increases your odds of catching an upward move."
    },
    {
        "id": "stop-loss-and-position-sizing",
        "title": "Stop-Loss & Risk Management (The Rule of 1%)",
        "category": "Risk Management",
        "difficulty": "Beginner",
        "reading_time": "5 min",
        "summary": "How professional traders protect capital and survive any market storm.",
        "content": "Never risk more than 1% to 2% of your total trading capital on any single trade. If your capital is ₹50,000, your maximum monetary loss on a trade should never exceed ₹500. Always calculate your exact position size before entering: Quantity = Max Monetary Risk / (Entry Price - Stop-Loss Price).",
        "key_takeaway": "The secret to stock market longevity is not predicting every move right; it's losing very little when you are wrong and making multiples when you are right."
    }
]

@router.get("/lessons")
def get_all_lessons():
    return LESSONS

@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: str):
    for l in LESSONS:
        if l["id"] == lesson_id:
            return l
    return LESSONS[0]
