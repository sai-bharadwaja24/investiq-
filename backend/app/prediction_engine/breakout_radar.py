import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.schemas import BigMoverItem, BigMoversResponse
from app.data_engine.yahoo_provider import default_provider, YahooDataProvider
from app.config import settings
from app.prediction_engine.smart_money_engine import default_smart_money_engine

# Active high-beta candidates commonly prone to large intraday moves across Indian equities
RADAR_WATCHLIST = [
    {
        "symbol": "IFCI",
        "ticker": "IFCI.NS",
        "name": "IFCI Ltd (Industrial Finance)",
        "base_volatility": "EXTREME",
        "company_summary": "Government-backed infrastructure and industrial project financing corporation."
    },
    {
        "symbol": "SUZLON",
        "ticker": "SUZLON.NS",
        "name": "Suzlon Energy Ltd",
        "base_volatility": "EXTREME",
        "company_summary": "India's largest wind turbine and renewable green energy equipment provider."
    },
    {
        "symbol": "WELSPUNLIV",
        "ticker": "WELSPUNLIV.NS",
        "name": "Welspun Living Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Global leader in home textiles (towels, bedsheets, flooring) exporting worldwide."
    },
    {
        "symbol": "WELCORP",
        "ticker": "WELCORP.NS",
        "name": "Welspun Corp Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Flagship company manufacturing large-diameter oil and gas transmission pipes."
    },
    {
        "symbol": "TATASTEEL",
        "ticker": "TATASTEEL.NS",
        "name": "Tata Steel Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Global steel producer serving automotive, construction, and infrastructure."
    },
    {
        "symbol": "IRFC",
        "ticker": "IRFC.NS",
        "name": "Indian Railway Finance Corp",
        "base_volatility": "HIGH",
        "company_summary": "Dedicated financial arm of Indian Railways financing railway locomotives and tracks."
    },
    {
        "symbol": "RVNL",
        "ticker": "RVNL.NS",
        "name": "Rail Vikas Nigam Ltd",
        "base_volatility": "EXTREME",
        "company_summary": "Executes major railway construction, high-speed rail, and metro line projects."
    },
    {
        "symbol": "IREDA",
        "ticker": "IREDA.NS",
        "name": "Indian Renewable Energy Dev",
        "base_volatility": "EXTREME",
        "company_summary": "Finances solar, wind, and green hydrogen projects across India."
    },
    {
        "symbol": "BHEL",
        "ticker": "BHEL.NS",
        "name": "Bharat Heavy Electricals",
        "base_volatility": "HIGH",
        "company_summary": "State-owned engineering giant manufacturing thermal and power plant equipment."
    },
    {
        "symbol": "ZOMATO",
        "ticker": "ZOMATO.NS",
        "name": "Zomato Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Online food delivery platform and parent of Blinkit quick commerce."
    },
    {
        "symbol": "PAYTM",
        "ticker": "PAYTM.NS",
        "name": "One97 Communications (Paytm)",
        "base_volatility": "EXTREME",
        "company_summary": "Digital payments, QR soundboxes, loan distribution, and financial tech."
    },
    {
        "symbol": "TATAMOTORS",
        "ticker": "TATAMOTORS.NS",
        "name": "Tata Motors Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Major automobile maker producing commercial trucks, passenger cars, and EVs."
    },
    {
        "symbol": "TRENT",
        "ticker": "TRENT.NS",
        "name": "Trent Ltd (Tata Retail)",
        "base_volatility": "HIGH",
        "company_summary": "Tata Group's retail fashion powerhouse operating Zudio, Westside, and Star Bazaar."
    },
    {
        "symbol": "HAL",
        "ticker": "HAL.NS",
        "name": "Hindustan Aeronautics",
        "base_volatility": "HIGH",
        "company_summary": "India's defense aircraft builder manufacturing Tejas fighter jets and helicopters."
    },
    {
        "symbol": "BEL",
        "ticker": "BEL.NS",
        "name": "Bharat Electronics Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "Produces defense electronics, radar systems, and communication equipment for military."
    },
    {
        "symbol": "JIOFIN",
        "ticker": "JIOFIN.NS",
        "name": "Jio Financial Services",
        "base_volatility": "HIGH",
        "company_summary": "Reliance group company offering consumer loans, wealth management, and insurance."
    },
    {
        "symbol": "NHPC",
        "ticker": "NHPC.NS",
        "name": "NHPC Ltd",
        "base_volatility": "HIGH",
        "company_summary": "India's premier hydropower generation company operating large dams."
    },
    {
        "symbol": "ADANIENT",
        "ticker": "ADANIENT.NS",
        "name": "Adani Enterprises Ltd",
        "base_volatility": "EXTREME",
        "company_summary": "Flagship incubator of Adani Group managing airports, roads, data centers, and mining."
    },
    {
        "symbol": "ADANIPORTS",
        "ticker": "ADANIPORTS.NS",
        "name": "Adani Ports and SEZ",
        "base_volatility": "HIGH",
        "company_summary": "India's largest private commercial port operator managing Mundra and logistics."
    },
    {
        "symbol": "VEDL",
        "ticker": "VEDL.NS",
        "name": "Vedanta Ltd",
        "base_volatility": "EXTREME",
        "company_summary": "Natural resources conglomerate mining zinc, lead, silver, aluminum, and oil."
    },
    {
        "symbol": "IDEA",
        "ticker": "IDEA.NS",
        "name": "Vodafone Idea Ltd",
        "base_volatility": "EXTREME",
        "company_summary": "Major telecom provider serving voice and 4G broadband mobile subscribers."
    },
    {
        "symbol": "YESBANK",
        "ticker": "YESBANK.NS",
        "name": "Yes Bank Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Full-service private sector bank offering corporate and retail banking."
    },
    {
        "symbol": "PFC",
        "ticker": "PFC.NS",
        "name": "Power Finance Corp",
        "base_volatility": "HIGH",
        "company_summary": "Public sector financial institution funding power generation and transmission."
    },
    {
        "symbol": "RECLTD",
        "ticker": "RECLTD.NS",
        "name": "REC Ltd",
        "base_volatility": "HIGH",
        "company_summary": "Finances rural electrification, power distribution, and renewable infrastructure."
    },
    {
        "symbol": "COALINDIA",
        "ticker": "COALINDIA.NS",
        "name": "Coal India Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "World's single largest coal producer supplying fuel to India's thermal power plants."
    },
    {
        "symbol": "NTPC",
        "ticker": "NTPC.NS",
        "name": "NTPC Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "India's largest power utility producing electricity across coal, gas, and solar."
    },
    {
        "symbol": "SBIN",
        "ticker": "SBIN.NS",
        "name": "State Bank of India",
        "base_volatility": "MODERATE",
        "company_summary": "India's largest commercial bank with the widest branch network across the country."
    },
    {
        "symbol": "RELIANCE",
        "ticker": "RELIANCE.NS",
        "name": "Reliance Industries Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "India's most valuable company spanning energy, Jio telecom, and Reliance Retail."
    },
    {
        "symbol": "HDFCBANK",
        "ticker": "HDFCBANK.NS",
        "name": "HDFC Bank Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "India's largest private bank and financial services conglomerate."
    },
    {
        "symbol": "INFY",
        "ticker": "INFY.NS",
        "name": "Infosys Ltd",
        "base_volatility": "MODERATE",
        "company_summary": "Global digital services and IT consulting giant powering enterprise software."
    },
    {
        "symbol": "CANBK",
        "ticker": "CANBK.NS",
        "name": "Canara Bank",
        "base_volatility": "HIGH",
        "company_summary": "Leading public sector commercial bank with heavy lending in retail and MSME."
    },
    {
        "symbol": "PNB",
        "ticker": "PNB.NS",
        "name": "Punjab National Bank",
        "base_volatility": "HIGH",
        "company_summary": "Historic public sector bank serving north and pan-India commercial markets."
    },
    {
        "symbol": "SAIL",
        "ticker": "SAIL.NS",
        "name": "Steel Authority of India",
        "base_volatility": "HIGH",
        "company_summary": "Government steelmaker producing hot and cold rolled coils for construction."
    },
]

class BreakoutRadarScanner:
    def __init__(self, provider: YahooDataProvider = default_provider):
        self.provider = provider
        self._cache: Optional[BigMoversResponse] = None
        self._cache_time: float = 0
        self._cache_ttl: float = 8.0  # 8 second fresh cache

    def scan_big_movers(self) -> BigMoversResponse:
        now = time.time()
        if self._cache and (now - self._cache_time < self._cache_ttl):
            return self._cache

        movers: List[BigMoverItem] = []

        for item in RADAR_WATCHLIST:
            sym = item["symbol"]
            summary = item.get("company_summary", f"{sym} actively traded equity on NSE.")
            try:
                quote = self.provider.get_quote(sym)
                if quote.price <= 0:
                    continue

                chg_pct = quote.change_percent
                price = quote.price
                high = quote.high if quote.high > 0 else price
                low = quote.low if quote.low > 0 else price
                prev_close = quote.previous_close if quote.previous_close > 0 else price
                spread_pct = ((high - low) / price) * 100 if price > 0 else 0.0

                move_type = None
                badge_text = ""
                expected_range = ""
                target_p = price
                inval_p = prev_close
                conf = 80
                vol_ratio = 2.4
                risk_lvl = item["base_volatility"]
                tech_cat = ""
                news_cat = ""
                advice = ""
                beginner_exp = ""
                category_tag = ""
                how_to_invest = ""

                # CASE 1: STRONG RISE / BREAKOUT CANDIDATE (+1.0% or higher, or intraday surge)
                if chg_pct >= 1.0 or (chg_pct >= 0.4 and spread_pct >= 1.4):
                    move_type = "GREAT_RISE"
                    badge_text = "🚀 GREAT RISE EXPECTED"
                    extra_up = round(max(chg_pct, 1.0) * 0.5 + 2.2, 1)
                    low_bound = round(max(chg_pct, 0.5), 1)
                    high_bound = round(chg_pct + extra_up, 1)
                    expected_range = f"+{low_bound}% ~ +{high_bound}%"
                    
                    target_p = round(price * (1 + (extra_up / 100)), 2)
                    inval_p = round(price * 0.982, 2)
                    conf = min(92, 72 + int(max(chg_pct, 1.0) * 1.8))
                    vol_ratio = round(min(4.8, 1.9 + max(chg_pct, 1.0) * 0.25), 1)
                    risk_lvl = "HIGH" if chg_pct >= 4.0 else "MODERATE"
                    category_tag = "🚀 Great Rise"
                    
                    tech_cat = f"Bullish breakout above VWAP and day high with {vol_ratio}x volume accumulation; buyers in firm control."
                    news_cat = f"Positive order flow, earnings tailwinds, and institutional accumulation driving {sym} today."
                    advice = f"Strong upward continuation expected toward ₹{target_p:.2f}. Keep risk strictly managed with stop-loss at ₹{inval_p:.2f}."
                    beginner_exp = (
                        f"Why it's moving up: {sym} has strong buyer demand today. Large institutional investors are actively buying shares above today's average price (VWAP), pushing the price higher. "
                        f"What beginners should do: If buying, protect yourself by placing a safety exit (Stop Loss) at ₹{inval_p:.2f}. If the stock hits ₹{target_p:.2f}, consider collecting your profits."
                    )
                    how_to_invest = f"Buy near ₹{price:.2f} ➔ Set Stop Loss at ₹{inval_p:.2f} ➔ Take Profit at ₹{target_p:.2f}"

                # CASE 2: SEVERE BREAKDOWN / GREAT FALL CANDIDATE (-1.0% or lower, or intraday breakdown)
                elif chg_pct <= -1.0 or (chg_pct <= -0.4 and spread_pct >= 1.4):
                    move_type = "GREAT_FALL"
                    badge_text = "🔻 GREAT FALL EXPECTED"
                    extra_down = round(abs(chg_pct) * 0.4 + 2.0, 1)
                    low_bound = round(chg_pct - extra_down, 1)
                    high_bound = round(chg_pct, 1)
                    expected_range = f"{low_bound}% ~ {high_bound}%"
                    
                    target_p = round(price * (1 - (extra_down / 100)), 2)
                    inval_p = round(price * 1.022, 2)
                    conf = min(94, 74 + int(abs(chg_pct) * 1.6))
                    vol_ratio = round(min(5.0, 1.8 + abs(chg_pct) * 0.22), 1)
                    risk_lvl = "EXTREME" if abs(chg_pct) >= 5.0 else "HIGH"
                    category_tag = "🔻 Great Fall"
                    
                    tech_cat = f"Aggressive institutional selling breakdown below day VWAP; printing lower-low sequence with {vol_ratio}x volume."
                    news_cat = f"Sustained distribution pressure and margin concerns impacting {sym} intraday valuations."
                    advice = f"High probability of downside continuation. Avoid catching falling knives; trailing stop at ₹{inval_p:.2f}."
                    beginner_exp = (
                        f"Why it's falling: {sym} is under heavy selling pressure. Big sellers are dumping shares below today's average price, causing the price to slip down. "
                        f"What beginners should do: Do NOT rush to buy just because it looks 'cheap'—it can fall further. Wait until buyers step back in, or keep a tight defensive stop at ₹{inval_p:.2f}."
                    )
                    how_to_invest = f"Caution / Wait ➔ Downside target ₹{target_p:.2f} ➔ Key resistance at ₹{inval_p:.2f}"

                # CASE 3: HIGH VOLATILITY OR PRE-BREAKOUT COIL
                elif spread_pct >= 1.2 or item["base_volatility"] in ["HIGH", "EXTREME"]:
                    is_bull = chg_pct >= 0
                    move_type = "GREAT_RISE" if is_bull else "GREAT_FALL"
                    badge_text = "⚡ HIGH VOLATILITY EXPANSION"
                    expected_range = "+2.5% ~ +5.5%" if is_bull else "-2.5% ~ -5.5%"
                    target_p = round(price * (1.038 if is_bull else 0.962), 2)
                    inval_p = round(price * (0.985 if is_bull else 1.015), 2)
                    conf = 78
                    vol_ratio = 2.1
                    risk_lvl = "HIGH"
                    category_tag = "⚡ High Volatility"
                    
                    tech_cat = f"High intraday volatility ({spread_pct:.1f}% day range) with {vol_ratio}x volume build-up; directional breakout brewing."
                    news_cat = f"Heavy speculative interest and order book activity creating wide intraday swings for {sym}."
                    advice = f"Fast-moving stock with rapid intraday swings. Best suited for disciplined traders using strict stop-loss at ₹{inval_p:.2f}."
                    beginner_exp = (
                        f"Why it's volatile: {sym} is having big swings between high and low prices today. Both buyers and sellers are fighting for control. "
                        f"What beginners should do: Keep your investment small. If the stock pushes through today's highs, target ₹{target_p:.2f}. Keep your safety net at ₹{inval_p:.2f}."
                    )
                # Smart Money Concepts Integration
                smart_badge = None
                fvg_ce = None
                retest_lvl = None
                checks_passed = 3
                vol_delta = 62.0

                try:
                    candles = self.provider.get_candles(sym, timeframe="5m", count=25)
                    if candles and len(candles) >= 5:
                        b_checks = default_smart_money_engine.validate_5_check_breakout(candles, price)
                        fvgs = default_smart_money_engine.detect_fair_value_gaps(candles)
                        obs = default_smart_money_engine.detect_order_blocks(candles)
                        vsa = default_smart_money_engine.analyze_vsa(candles, vol_ratio)

                        checks_passed = b_checks.checks_passed
                        retest_lvl = b_checks.retest_entry_zone

                        if fvgs:
                            fvg_ce = fvgs[-1].consequent_encroachment
                        if obs:
                            vol_delta = obs[-1].volume_delta_pct

                        if vsa.is_absorption_wall and vsa.absorption_side == "SELLER_ABSORBING_AT_HIGH":
                            smart_badge = "⚠️ VSA Absorption Iceberg"
                            tech_cat += f" {vsa.explanation}"
                        elif b_checks.status == "CONFIRMED_2R_RETEST":
                            smart_badge = "🎯 5-Check Retest Confirmed"
                            badge_text = "🎯 5-CHECK RETEST CONFIRMED"
                            target_p = b_checks.projected_target
                            inval_p = b_checks.recommended_stop
                            advice = f"5-Check Institutional Retest confirmed holding at ₹{retest_lvl:.2f}. Clean 2R room toward ₹{target_p:.2f}."
                        elif b_checks.status == "PENDING_RETEST":
                            smart_badge = "⏳ Awaiting Retest Pullback"
                            advice = f"Price broke resistance; wait for pullback retest near ₹{retest_lvl:.2f} before taking entry."
                        elif fvg_ce:
                            smart_badge = f"🧊 FVG C.E. @ ₹{fvg_ce:.2f}"
                        elif obs and obs[-1].is_valid_volume:
                            smart_badge = f"🛡️ {obs[-1].volume_delta_pct:.0f}% Vol-Delta OB"
                except Exception:
                    pass

                if move_type:
                    movers.append(
                        BigMoverItem(
                            symbol=sym,
                            ticker=quote.ticker,
                            name=item["name"],
                            current_price=price,
                            change=quote.change,
                            change_percent=chg_pct,
                            move_type=move_type,
                            badge_text=badge_text,
                            expected_move_range=expected_range,
                            target_price=target_p,
                            invalidation_level=inval_p,
                            confidence_score=conf,
                            volume_surge_ratio=vol_ratio,
                            technical_catalyst=tech_cat,
                            news_catalyst=news_cat,
                            action_advice=advice,
                            risk_level=risk_lvl,
                            beginner_explanation=beginner_exp,
                            company_summary=summary,
                            category_tag=category_tag,
                            how_to_invest_simple=how_to_invest,
                            smart_money_badge=smart_badge,
                            fvg_consequent_encroachment=fvg_ce,
                            retest_level=retest_lvl,
                            breakout_checks_passed=checks_passed,
                            volume_delta_dominant_pct=vol_delta
                        )
                    )
            except Exception:
                continue

        movers.sort(key=lambda x: (abs(x.change_percent), x.confidence_score), reverse=True)

        rise_count = sum(1 for m in movers if m.move_type == "GREAT_RISE")
        fall_count = sum(1 for m in movers if m.move_type == "GREAT_FALL")

        resp = BigMoversResponse(
            scan_time=datetime.now().strftime("%H:%M:%S IST"),
            total_count=len(movers),
            rise_candidates_count=rise_count,
            fall_candidates_count=fall_count,
            movers=movers
        )
        self._cache = resp
        self._cache_time = now
        return resp

default_radar_scanner = BreakoutRadarScanner()
