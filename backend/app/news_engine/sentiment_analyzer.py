import re
from typing import Dict, Any, Tuple

class NewsSentimentAnalyzer:
    """
    Financial sentiment & price impact engine specifically tuned for Indian stock market news.
    Determines whether a headline is a Bullish (Price Rise) or Bearish (Price Fall) catalyst,
    with plain-English explanations of why it moves the stock price.
    """

    BULLISH_HIGH = [
        r"\b(?:bags|wins?|awarded)\b.*?\b(?:contract|order|deal|project)\b",
        r"\brecord profit\b",
        r"\bprofit\b.*?\b(?:surges?|jumps?|soars?|rises?|doubles?|beats?)\b",
        r"\bbeats?\b.*?\b(?:profit|earnings?|estimates?|expectations?|views?|forecasts?)\b",
        r"\brevenue\b.*?\b(?:beats?|jumps?|surges?|accelerates?)\b",
        r"\b(?:hikes?|raises?|boosts?)\b.*?\btarget\b",
        r"\btarget\b.*?\b(?:hiked?|raised?|increased?|boosted?)\b",
        r"\bupgrades?\b.*?\b(?:buy|outperform|accumulate)\b",
        r"\bexpansion\b.*?\b(?:capacity|capex|plant|unit)\b",
        r"\bbonus shares?\b",
        r"\bdividend\b.*?\b(?:hike|increase|payout|special)\b",
        r"\bfavorable (?:ruling|verdict|policy)\b",
        r"\bbreakout\b",
        r"\bstrong q[1-4]\b"
    ]

    BULLISH_MOD = [
        r"\bbeats? (?:estimates?|expectations?|forecasts?)\b",
        r"\b(?:rallies|rally|surges?|gains?|climbs?|advances?)\b",
        r"\bpartnership\b",
        r"\bstrong demand\b",
        r"\bguidance (?:raised|upbeat)\b",
        r"\boutperforms?\b",
        r"\bgrowth\b",
        r"\bacquisition\b",
        r"\bturnaround\b",
        r"\bbuyback\b",
        r"\bpositive outlook\b"
    ]

    BEARISH_HIGH = [
        r"\bprofit\b.*?\b(?:drops?|plunges?|slumps?|falls?|tumbles?|declines?|misses?)\b",
        r"\brevenue\b.*?\b(?:misses?|drops?|falls?|slows?)\b",
        r"\b(?:cuts?|lowers?|slashes?|reduces?)\b.*?\btarget\b",
        r"\btarget\b.*?\b(?:cut|lowered|slashed|reduced|downgraded)\b",
        r"\bdowngrades?\b.*?\b(?:sell|underperform|reduce)\b",
        r"\b(?:resigns?|quits?|steps? down)\b",
        r"\b(?:fraud|scam|probe|investigation|scrutiny|raid)\b",
        r"\b(?:penalty|fine|banned|sebi action)\b",
        r"\bdefault(?:s|ed)?\b",
        r"\blosses? widen\b",
        r"\btariff\b.*?\b(?:hit|pressure|impact)\b",
        r"\bstrike\b.*?\b(?:halts?|disrupts?)\b"
    ]

    BEARISH_MOD = [
        r"\bmargin (?:compression|squeeze|pressure|declines?)\b",
        r"\b(?:slides?|slips?|drops?|falls?|tumbles?|retreats?|plunges?)\b",
        r"\bslowdown\b",
        r"\bweak (?:demand|q[1-4]|guidance)\b",
        r"\bdrags?\b",
        r"\bheadwinds?\b",
        r"\bcautious\b",
        r"\binflation (?:pressure|costs?)\b",
        r"\bprofit booking\b",
        r"\brisk\b"
    ]

    @classmethod
    def analyze(cls, title: str, summary: str = "", symbol: str = "") -> Dict[str, Any]:
        text = f"{title} {summary}".lower()

        # Score calculations
        bullish_score = 0
        bearish_score = 0
        reasons = []

        # Check high bullish
        for pattern in cls.BULLISH_HIGH:
            if re.search(pattern, text):
                bullish_score += 3
                if "contract" in pattern or "order" in pattern or "deal" in pattern:
                    reasons.append("Large order wins or contract approvals increase future revenue visibility and cash flows.")
                elif "profit" in pattern or "revenue" in pattern or "q[1-4]" in pattern:
                    reasons.append("Strong quarterly earnings beat consensus forecasts, encouraging institutional buyers.")
                elif "target" in pattern or "upgrade" in pattern:
                    reasons.append("Brokerage target upgrades trigger fund inflows and target re-ratings.")
                elif "dividend" in pattern or "bonus" in pattern:
                    reasons.append("Shareholder rewards boost investor confidence and defensive appeal.")

        # Check moderate bullish
        for pattern in cls.BULLISH_MOD:
            if re.search(pattern, text):
                bullish_score += 1
                if not reasons:
                    reasons.append("Upbeat operational momentum and business growth support higher valuation multiples.")

        # Check high bearish
        for pattern in cls.BEARISH_HIGH:
            if re.search(pattern, text):
                bearish_score += 3
                if "resigns" in pattern or "quits" in pattern or "steps down" in pattern:
                    reasons.append("Key leadership exits create uncertainty around executive continuity, sparking cautious selling.")
                elif "profit" in pattern or "revenue" in pattern or "losses" in pattern:
                    reasons.append("Disappointing bottom-line earnings reduce profit per share and trigger immediate price markdowns.")
                elif "probe" in pattern or "penalty" in pattern or "scrutiny" in pattern:
                    reasons.append("Regulatory scrutiny or fines raise governance red flags and prompt risk-off exits.")
                elif "downgrade" in pattern or "cut" in pattern:
                    reasons.append("Target price cuts by research analysts lower institutional fair-value estimates.")

        # Check moderate bearish
        for pattern in cls.BEARISH_MOD:
            if re.search(pattern, text):
                bearish_score += 1
                if not reasons:
                    reasons.append("Margin pressures and cautious commentary lead to short-term profit booking.")

        # Classify output
        if bullish_score > bearish_score and bullish_score >= 2:
            sentiment = "BULLISH"
            if bullish_score >= 3:
                impact_badge = "🟢 STRONG RISE CATALYST"
                impact_severity = "HIGH"
                expected_impact = "+2.0% ~ +4.5%"
            else:
                impact_badge = "🟢 MODERATE RISE CATALYST"
                impact_severity = "MODERATE"
                expected_impact = "+1.0% ~ +2.0%"
            why_it_matters = reasons[0] if reasons else f"Positive market catalysts are generating fresh buying interest for {symbol or 'the stock'}."

        elif bearish_score > bullish_score and bearish_score >= 2:
            sentiment = "BEARISH"
            if bearish_score >= 3:
                impact_badge = "🔴 CRITICAL FALL RISK"
                impact_severity = "HIGH"
                expected_impact = "-2.0% ~ -4.5%"
            else:
                impact_badge = "🔴 MODERATE FALL RISK"
                impact_severity = "MODERATE"
                expected_impact = "-1.0% ~ -2.0%"
            why_it_matters = reasons[0] if reasons else f"Negative developments are putting downward pressure on {symbol or 'the stock'}."

        else:
            sentiment = "NEUTRAL"
            impact_badge = "⚪ NEUTRAL / WATCHING"
            impact_severity = "LOW"
            expected_impact = "±0.5% (Stable)"
            why_it_matters = "Routine corporate or industry update with minimal immediate impact on core earnings."

        return {
            "sentiment": sentiment,
            "impact_badge": impact_badge,
            "impact_severity": impact_severity,
            "expected_impact_range": expected_impact,
            "why_it_matters": why_it_matters
        }
