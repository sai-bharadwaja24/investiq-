from typing import Dict, Any, List
from app.models.schemas import FundamentalAnalysis, FundamentalMetric

class FundamentalAnalyzer:
    @staticmethod
    def analyze(symbol: str, raw_data: Dict[str, Any]) -> FundamentalAnalysis:
        pe = raw_data.get("pe_ratio", 25.0)
        pb = raw_data.get("pb_ratio", 3.5)
        roe = raw_data.get("roe", 18.0)
        roce = raw_data.get("roce", 22.0)
        de = raw_data.get("debt_to_equity", 0.4)
        cr = raw_data.get("current_ratio", 1.5)
        ic = raw_data.get("interest_coverage", 8.0)
        opm = raw_data.get("operating_margin", 20.0)
        npm = raw_data.get("profit_margin", 15.0)
        rev_g = raw_data.get("revenue_growth_1y", 12.0)
        prof_g = raw_data.get("profit_growth_1y", 14.0)
        div_y = raw_data.get("dividend_yield", 1.5)

        # 1. Quality Score (ROE, ROCE, Margins)
        q_roe = min(100, max(0, int((roe / 25.0) * 100)))
        q_roce = min(100, max(0, int((roce / 30.0) * 100)))
        q_margin = min(100, max(0, int((npm / 20.0) * 100)))
        quality_score = int((q_roe * 0.4) + (q_roce * 0.35) + (q_margin * 0.25))

        # 2. Financial Health Score (D/E, Current Ratio, Interest Coverage)
        h_de = min(100, max(0, int(100 - (de * 50))))  # 0 debt = 100, 2.0 debt = 0
        h_cr = min(100, max(0, int(min(cr / 2.0, 1.0) * 100)))
        h_ic = min(100, max(0, int(min(ic / 10.0, 1.0) * 100)))
        financial_health_score = int((h_de * 0.45) + (h_cr * 0.25) + (h_ic * 0.30))

        # 3. Valuation Score (PE, PB, Dividend Yield)
        # PE: lower is cheaper relative to 30 benchmark
        v_pe = min(100, max(0, int(max(0, 100 - (pe * 2.2)))))
        v_pb = min(100, max(0, int(max(0, 100 - (pb * 12.0)))))
        v_div = min(100, max(0, int(min(div_y / 3.0, 1.0) * 100)))
        valuation_score = int((v_pe * 0.5) + (v_pb * 0.3) + (v_div * 0.2))

        # 4. Growth Score (Revenue & Profit growth)
        g_rev = min(100, max(0, int(min(rev_g / 20.0, 1.0) * 100)))
        g_prof = min(100, max(0, int(min(prof_g / 25.0, 1.0) * 100)))
        growth_score = int((g_rev * 0.5) + (g_prof * 0.5))

        # 5. Risk / Safety Score
        # Higher score = lower risk / safer
        risk_score = int((financial_health_score * 0.6) + (valuation_score * 0.4))

        # Overall Fundamental Score (0 to 100)
        overall_score = int(
            (quality_score * 0.25) +
            (financial_health_score * 0.25) +
            (valuation_score * 0.20) +
            (growth_score * 0.15) +
            (risk_score * 0.15)
        )

        # Verdict
        if overall_score >= 75:
            verdict = "ATTRACTIVE BUY (STRONG FUNDAMENTALS)"
            verdict_badge = "green"
        elif overall_score >= 55:
            verdict = "HOLD / FAIR VALUE (STABLE)"
            verdict_badge = "yellow"
        else:
            verdict = "AVOID / EXPENSIVE / ELEVATED RISK"
            verdict_badge = "red"

        # Factors
        positive_factors = []
        warning_factors = []

        if roe >= 18:
            positive_factors.append(f"Outstanding Return on Equity ({roe}%), indicating highly efficient shareholder capital deployment.")
        if de <= 0.5:
            positive_factors.append(f"Conservatively managed balance sheet with low Debt-to-Equity ({de}x).")
        if npm >= 14:
            positive_factors.append(f"Robust net profit margins ({npm}%) providing pricing power and moat protection.")
        if rev_g >= 12:
            positive_factors.append(f"Healthy 1-year revenue growth (+{rev_g}%) beating inflation.")

        if pe > 35:
            warning_factors.append(f"P/E ratio of {pe} is elevated compared to historical averages; offers smaller valuation margin of safety.")
        if de > 1.2:
            warning_factors.append(f"Debt-to-Equity is relatively high ({de}x); sensitive to interest rate fluctuations.")
        if rev_g < 5:
            warning_factors.append(f"Revenue growth has slowed down (+{rev_g}%); watch for catalyst revival.")

        if not positive_factors:
            positive_factors.append("Consistent operational history with established industry footprint.")
        if not warning_factors:
            warning_factors.append("No major financial red flags detected on current balance sheet.")

        # Structured beginner metrics
        metrics = {
            "Profitability & Quality": [
                FundamentalMetric(
                    name="ROE (Return on Equity)",
                    value=f"{roe}%",
                    status="positive" if roe >= 15 else "neutral",
                    beginner_explanation="How much profit the company earns for every ₹100 of shareholder money.",
                    why_it_matters="Consistently high ROE (>15%) indicates a high-quality management team creating value.",
                    formula="Net Income / Shareholders' Equity"
                ),
                FundamentalMetric(
                    name="ROCE (Return on Capital Employed)",
                    value=f"{roce}%",
                    status="positive" if roce >= 18 else "neutral",
                    beginner_explanation="Measures profitability on all capital (equity + debt) employed in the business.",
                    why_it_matters="Shows whether the core business generates healthy returns regardless of how it is financed.",
                    formula="EBIT / (Total Assets - Current Liabilities)"
                ),
                FundamentalMetric(
                    name="Net Profit Margin",
                    value=f"{npm}%",
                    status="positive" if npm >= 12 else "neutral",
                    beginner_explanation="The percentage of revenue turned into clean bottom-line profit.",
                    why_it_matters="Higher margins protect the company during economic downturns.",
                    formula="(Net Profit / Total Revenue) * 100"
                )
            ],
            "Financial Health": [
                FundamentalMetric(
                    name="Debt-to-Equity",
                    value=f"{de}x",
                    status="positive" if de <= 0.5 else "warning" if de <= 1.2 else "negative",
                    beginner_explanation="Compares total company borrowing against shareholders' invested capital.",
                    why_it_matters="Lower is safer. A ratio under 0.5x means the company is virtually debt-free or comfortably solvent.",
                    formula="Total Debt / Total Shareholders' Equity"
                ),
                FundamentalMetric(
                    name="Current Ratio",
                    value=f"{cr}x",
                    status="positive" if cr >= 1.3 else "warning",
                    beginner_explanation="Measures ability to pay back short-term debts due within one year.",
                    why_it_matters="A ratio above 1.3x ensures the company will not face cash liquidity crunches.",
                    formula="Current Assets / Current Liabilities"
                ),
                FundamentalMetric(
                    name="Interest Coverage",
                    value=f"{ic}x",
                    status="positive" if ic >= 5.0 else "warning",
                    beginner_explanation="How easily the company pays interest on its existing loans.",
                    why_it_matters="Higher numbers (>5x) mean loan defaults are extremely unlikely.",
                    formula="EBIT / Interest Expense"
                )
            ],
            "Valuation": [
                FundamentalMetric(
                    name="P/E Ratio",
                    value=f"{pe}x",
                    status="positive" if pe <= 22 else "neutral" if pe <= 35 else "warning",
                    beginner_explanation="How many rupees you pay for every ₹1 of annual company profit.",
                    why_it_matters="Helps determine if the stock is a bargain or richly priced.",
                    formula="Current Share Price / Earnings Per Share (EPS)"
                ),
                FundamentalMetric(
                    name="P/B Ratio",
                    value=f"{pb}x",
                    status="neutral",
                    beginner_explanation="Price paid relative to the company's net tangible asset value on paper.",
                    why_it_matters="Useful for asset-heavy businesses and banks.",
                    formula="Current Share Price / Book Value Per Share"
                ),
                FundamentalMetric(
                    name="Dividend Yield",
                    value=f"{div_y}%",
                    status="positive" if div_y >= 1.5 else "neutral",
                    beginner_explanation="Annual cash dividend payout as a percentage of the share price.",
                    why_it_matters="Provides steady passive cash flow while you hold the shares.",
                    formula="(Annual Dividend Per Share / Share Price) * 100"
                )
            ]
        }

        category_scores = {
            "Quality": quality_score,
            "Financial Health": financial_health_score,
            "Valuation": valuation_score,
            "Growth": growth_score,
            "Risk & Safety": risk_score
        }

        beginner_takeaway = (
            f"{symbol} demonstrates a strong fundamental score of {overall_score}/100. "
            f"It boasts high profitability ({roe}% ROE) and a conservative balance sheet ({de}x D/E), "
            f"making it an attractive candidate for long-term compounding."
            if overall_score >= 75 else
            f"{symbol} holds a stable fundamental score of {overall_score}/100. "
            f"While business operations are solid, its valuation ({pe}x P/E) warrants patient accumulation on market dips."
            if overall_score >= 55 else
            f"{symbol} scores {overall_score}/100 with elevated financial risk or stretched valuation. "
            f"Beginners should exercise caution and wait for improved fundamental metrics."
        )

        return FundamentalAnalysis(
            symbol=symbol,
            name=raw_data.get("name", symbol),
            overall_score=overall_score,
            verdict=verdict,
            verdict_badge=verdict_badge,
            category_scores=category_scores,
            positive_factors=positive_factors,
            warning_factors=warning_factors,
            metrics=metrics,
            beginner_takeaway=beginner_takeaway
        )
