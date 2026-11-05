# InvestIQ — Real-Time Stock Market Intelligence & Intraday Direction Platform

InvestIQ is a beginner-friendly stock market analysis and decision engine inspired by Groww's clean interface. Its sole purpose is to provide clear, data-backed answers to:
1. **"Should I buy this stock for the Long Term?"** (Fundamental Quality Score & Verdict)
2. **"Which direction will it move Intraday, with what probability, and till how much time?"** (High-precision direction & target duration)
3. **"I bought at 10:00 AM — what is the live prediction NOW, and at what exact clock time should I exit?"** (Active in-trade position monitor & Timed Exit Advisor)

---

## Key Features

- **Groww-Style Home Interface**: Live ticking **NIFTY 50**, **SENSEX**, and **BANK NIFTY** with mini sparklines, Top Gainers, Top Losers, Most Active, and High-Probability Intraday Setups.
- **Pure Decision Intelligence**: No broker logins, KYC, or accidental order buttons. 100% focused on research and prediction accuracy.
- **Dual Investment Horizons**:
  - **INVEST**: 0–100 Fundamental Score (Quality, Financial Health, Valuation, Growth, Risk) with positive/warning factors and plain English explanations.
  - **INTRADAY**: Candlesticks, VWAP, Multi-Timeframe Alignment (1H, 15M, 5M), ATR velocity duration, and Calibrated Machine Learning probabilities.
- **Timed Exit Advisor (`TimedExitAdvisor`)**:
  - 🟢 **STILL BULLISH (HOLD)**: Target profit-taking clock time (e.g. 10:30 AM – 10:35 AM IST) + dynamic trailing stop-loss.
  - 🟡 **STALLING (SIDEWAYS)**: Maximum timeout deadline (e.g. Exit by 10:45 AM if no breakout).
  - 🔴 **REVERSAL WARNING (EXIT)**: Urgent countdown timer (e.g. ⚠️ 02:45 mins remaining) before breakdown accelerates.
- **Zero Data Leakage**: Future candles never contaminate feature engineering or predictions at timestamp $T$.
- **Compare & Learn**: Multi-stock comparison matrix and 7+ foundational lessons.

---

## Architecture & Math Formulas

### 1. Vectorized Technical Indicators
- **Exponential Moving Average (EMA)**:
  $$\text{EMA}_t = \alpha \cdot P_t + (1 - \alpha) \cdot \text{EMA}_{t-1}, \quad \alpha = \frac{2}{N + 1}$$
- **Volume-Weighted Average Price (VWAP)**:
  $$\text{VWAP} = \frac{\sum (P_{\text{typical}} \times V)}{\sum V}, \quad P_{\text{typical}} = \frac{H + L + C}{3}$$
- **Relative Strength Index (RSI)**:
  $$\text{RSI} = 100 - \frac{100}{1 + \text{RS}}, \quad \text{RS} = \frac{\text{EMA}(\text{Gain}, 14)}{\text{EMA}(\text{Loss}, 14)}$$
- **Average True Range (ATR)**:
  $$\text{TR} = \max(H - L, |H - C_{\text{prev}}|, |L - C_{\text{prev}}|)$$

### 2. Time-to-Target & Exit Duration
$$\Delta t_{\text{target}} = \frac{|\text{Target Price} - P_{\text{current}}|}{\text{ATR}_{14} / 15\text{min}} \times \text{Volatility Factor}$$

### 3. Transparent Fundamental Scoring
$$\text{Overall Score} = 0.25 Q + 0.25 H + 0.20 V + 0.15 G + 0.15 R$$

---

## Running the Application

### 1. Backend (FastAPI + Uvicorn)
```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- WebSocket: `ws://localhost:8000/ws/live`

### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm run dev -- --port 5173
```
- Web Application: `http://localhost:5173/`

### 3. Automated Tests
```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/
```
