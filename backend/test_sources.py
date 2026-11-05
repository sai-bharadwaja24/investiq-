import urllib.request
import json
import time
import re

def check_yahoo(ticker):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1m&range=1d"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=3.0) as r:
            data = json.loads(r.read().decode())
            meta = data["chart"]["result"][0]["meta"]
            return meta.get("regularMarketPrice"), meta.get("regularMarketTime")
    except Exception as e:
        return None, str(e)

def check_google(sym):
    url = f"https://www.google.com/finance/quote/{sym}:NSE"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"})
    try:
        with urllib.request.urlopen(req, timeout=3.0) as r:
            html = r.read().decode("utf-8", errors="ignore")
            # Google Finance puts price in div with class "YMlKec fxKbKc"
            match = re.search(r'class="[^"]*YMlKec fxKbKc[^"]*">₹?([0-9,]+\.[0-9]+)', html)
            if match:
                return float(match.group(1).replace(",", ""))
            # Or data-last-price attribute
            match2 = re.search(r'data-last-price="([0-9\.]+)"', html)
            if match2:
                return float(match2.group(1))
    except Exception as e:
        return str(e)
    return None

if __name__ == "__main__":
    for s in ["TATASTEEL", "TCS", "RELIANCE", "INFY"]:
        yp, yt = check_yahoo(s + ".NS")
        gp = check_google(s)
        t_str = time.strftime("%H:%M:%S", time.localtime(yt)) if isinstance(yt, (int, float)) else str(yt)
        print(f"{s:10} | Yahoo: {yp} (updated: {t_str}) | Google: {gp}")
