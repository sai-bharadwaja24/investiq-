import os
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "InvestIQ"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Timezone & Market Hours (NSE/BSE IST)
    TIMEZONE: str = "Asia/Kolkata"
    MARKET_OPEN_TIME: time = time(9, 15)
    MARKET_CLOSE_TIME: time = time(15, 30)
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Supported Major Tickers
    TOP_INDICES: dict[str, str] = {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        "BANK NIFTY": "^NSEBANK",
    }
    
    POPULAR_STOCKS: list[dict[str, str]] = [
        {"symbol": "IFCI", "ticker": "IFCI.NS", "name": "IFCI Ltd (Industrial Finance)", "sector": "Financial Services"},
        {"symbol": "RELIANCE", "ticker": "RELIANCE.NS", "name": "Reliance Industries Ltd", "sector": "Energy / Retail / Telecom"},
        {"symbol": "TCS", "ticker": "TCS.NS", "name": "Tata Consultancy Services", "sector": "Information Technology"},
        {"symbol": "INFY", "ticker": "INFY.NS", "name": "Infosys Ltd", "sector": "Information Technology"},
        {"symbol": "HDFCBANK", "ticker": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "sector": "Banking & Financial Services"},
        {"symbol": "ICICIBANK", "ticker": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "sector": "Banking & Financial Services"},
        {"symbol": "TATAMOTORS", "ticker": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "sector": "Automobile"},
        {"symbol": "TATASTEEL", "ticker": "TATASTEEL.NS", "name": "Tata Steel Ltd", "sector": "Metals & Mining"},
        {"symbol": "ITC", "ticker": "ITC.NS", "name": "ITC Ltd", "sector": "FMCG / Diversified"},
        {"symbol": "BHARTIARTL", "ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd", "sector": "Telecommunications"},
        {"symbol": "SBIN", "ticker": "SBIN.NS", "name": "State Bank of India", "sector": "Banking & Financial Services"},
        {"symbol": "IRFC", "ticker": "IRFC.NS", "name": "Indian Railway Finance Corp", "sector": "Railways / NBFC"},
        {"symbol": "BHEL", "ticker": "BHEL.NS", "name": "Bharat Heavy Electricals", "sector": "Capital Goods"},
        {"symbol": "NHPC", "ticker": "NHPC.NS", "name": "NHPC Ltd", "sector": "Power Generation"},
        {"symbol": "ZOMATO", "ticker": "ZOMATO.NS", "name": "Zomato Ltd", "sector": "Internet / Delivery"},
        {"symbol": "PAYTM", "ticker": "PAYTM.NS", "name": "One97 Communications (Paytm)", "sector": "Fintech"},
        {"symbol": "JIOFIN", "ticker": "JIOFIN.NS", "name": "Jio Financial Services", "sector": "Financial Services"},
        {"symbol": "SUZLON", "ticker": "SUZLON.NS", "name": "Suzlon Energy Ltd", "sector": "Renewable Energy"},
        {"symbol": "BEL", "ticker": "BEL.NS", "name": "Bharat Electronics Ltd", "sector": "Defense / Electronics"},
        {"symbol": "HAL", "ticker": "HAL.NS", "name": "Hindustan Aeronautics", "sector": "Defense / Aerospace"},
        {"symbol": "WELSPUNLIV", "ticker": "WELSPUNLIV.NS", "name": "Welspun Living Ltd", "sector": "Textiles & Home Fashion"},
        {"symbol": "RVNL", "ticker": "RVNL.NS", "name": "Rail Vikas Nigam Ltd", "sector": "Railway Infrastructure"},
        {"symbol": "IREDA", "ticker": "IREDA.NS", "name": "Indian Renewable Energy Dev", "sector": "Renewable Financing"},
        {"symbol": "TRENT", "ticker": "TRENT.NS", "name": "Trent Ltd (Tata Retail)", "sector": "Retail & Fashion"},
        {"symbol": "COALINDIA", "ticker": "COALINDIA.NS", "name": "Coal India Ltd", "sector": "Energy & Mining"},
        {"symbol": "LT", "ticker": "LT.NS", "name": "Larsen & Toubro Ltd", "sector": "Infrastructure / Construction"},
        {"symbol": "WIPRO", "ticker": "WIPRO.NS", "name": "Wipro Ltd", "sector": "Information Technology"},
        {"symbol": "HINDUNILVR", "ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd", "sector": "FMCG"},
    ]

settings = Settings()

def get_ist_now() -> datetime:
    try:
        return datetime.now(ZoneInfo(settings.TIMEZONE))
    except Exception:
        # Fallback if tzdata missing
        return datetime.now()

def is_market_open_now() -> tuple[bool, str]:
    now = get_ist_now()
    weekday = now.weekday()  # Monday is 0, Sunday is 6
    curr_time = now.time()
    
    # Check weekend
    if weekday in (5, 6):
        return False, "Market Closed (Opens Monday at 09:15 AM IST)"
        
    # Check weekday trading hours (09:15 to 15:30 IST)
    if settings.MARKET_OPEN_TIME <= curr_time <= settings.MARKET_CLOSE_TIME:
        return True, "Market Open (Closes at 03:30 PM IST)"
    elif curr_time < settings.MARKET_OPEN_TIME:
        return False, "Market Closed (Opens today at 09:15 AM IST)"
    else:
        return False, "Market Closed (Opens tomorrow at 09:15 AM IST)"
