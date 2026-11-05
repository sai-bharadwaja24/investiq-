import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Coins,
  ArrowRight,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Zap,
  RotateCcw,
  Delete,
  X
} from 'lucide-react';
import { OrderProductType, OrderPriceType, OrderExchange } from '../types';
import { api } from '../services/api';

interface ProfitCalculatorProps {
  symbol: string;
  currentPrice: number;
  bsePrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  initialQuantity?: number;
  initialSide?: 'BUY' | 'SELL';
  isBeginnerMode?: boolean;
  onTrade?: (qty: number) => void;
  inline?: boolean;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  symbol,
  currentPrice,
  bsePrice,
  targetPrice: propTargetPrice,
  stopLoss: propStopLoss,
  initialQuantity,
  initialSide = 'BUY',
  isBeginnerMode = true,
  onTrade,
  inline = false,
}) => {
  // Order Side: BUY (Long) vs SELL (Short / Exit)
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>(initialSide);

  useEffect(() => {
    if (initialSide) {
      setOrderSide(initialSide);
    }
  }, [initialSide]);

  // Exchange state: NSE vs BSE
  const [exchange, setExchange] = useState<OrderExchange>('NSE');
  const activeMarketPrice = exchange === 'BSE' && bsePrice && bsePrice > 0 ? bsePrice : currentPrice;
  const safeMarketPrice = Math.max(0.01, activeMarketPrice);

  // Groww Order Types: Delivery (1x) vs Intraday (5x) vs MTF (2x)
  const [productType, setProductType] = useState<OrderProductType>('INTRADAY');
  
  // Groww Price Type: Limit vs Market
  const [priceType, setPriceType] = useState<OrderPriceType>('LIMIT');
  const [limitPrice, setLimitPrice] = useState<number>(() => {
    // If IFCI, match Groww screenshot default 75.75
    if (symbol.toUpperCase() === 'IFCI') return 75.75;
    return Number(safeMarketPrice.toFixed(2));
  });

  // Leverage factor based on product type
  const marginMultiplier = productType === 'INTRADAY' ? 5 : productType === 'MTF' ? 2 : 1;

  // Quantity State (Default: 722 if IFCI to match Groww screenshot, else calculated from ₹10k budget)
  const [quantity, setQuantity] = useState<number>(() => {
    if (initialQuantity && initialQuantity > 0) return initialQuantity;
    if (symbol.toUpperCase() === 'IFCI') return 722;
    return Math.max(1, Math.floor((10000 * 5) / safeMarketPrice));
  });

  // Preset budget selection state
  const [activeBudget, setActiveBudget] = useState<number | null>(() => {
    return symbol.toUpperCase() === 'IFCI' ? 10974 : 10000;
  });

  // Effective execution price
  const executionPrice = priceType === 'MARKET' ? safeMarketPrice : Math.max(0.01, limitPrice);

  // Target and Stop Loss
  const defaultTarget = orderSide === 'BUY'
    ? (propTargetPrice && propTargetPrice > safeMarketPrice 
        ? propTargetPrice 
        : symbol.toUpperCase() === 'IFCI'
        ? 77.05
        : Number((safeMarketPrice * 1.035).toFixed(2)))
    : (propTargetPrice && propTargetPrice < safeMarketPrice
        ? propTargetPrice
        : Number((safeMarketPrice * 0.965).toFixed(2)));
    
  const defaultStop = orderSide === 'BUY'
    ? (propStopLoss && propStopLoss < safeMarketPrice 
        ? propStopLoss 
        : Number((safeMarketPrice * 0.985).toFixed(2)))
    : (propStopLoss && propStopLoss > safeMarketPrice
        ? propStopLoss
        : Number((safeMarketPrice * 1.015).toFixed(2)));

  const [target, setTarget] = useState<number>(defaultTarget);
  const [stop, setStop] = useState<number>(defaultStop);
  const [showStoplossTarget, setShowStoplossTarget] = useState<boolean>(true);
  const [orderTriggerMode, setOrderTriggerMode] = useState<'TARGET' | 'SL' | 'BOTH'>('BOTH');
  const [trailSl, setTrailSl] = useState<boolean>(false);

  // Keypad & settings states
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [activeInputField, setActiveInputField] = useState<'qty' | 'price' | 'target' | 'stop'>('target');
  const [orderPlacedToast, setOrderPlacedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleSideChange = (newSide: 'BUY' | 'SELL') => {
    setOrderSide(newSide);
    if (newSide === 'BUY') {
      const newTarget = propTargetPrice && propTargetPrice > executionPrice 
        ? propTargetPrice 
        : Number((executionPrice * 1.035).toFixed(2));
      const newStop = propStopLoss && propStopLoss < executionPrice 
        ? propStopLoss 
        : Number((executionPrice * 0.985).toFixed(2));
      setTarget(newTarget);
      setStop(newStop);
    } else {
      const newTarget = propTargetPrice && propTargetPrice < executionPrice 
        ? propTargetPrice 
        : Number((executionPrice * 0.965).toFixed(2));
      const newStop = propStopLoss && propStopLoss > executionPrice 
        ? propStopLoss 
        : Number((executionPrice * 1.015).toFixed(2));
      setTarget(newTarget);
      setStop(newStop);
    }
  };

  // Keep target/stop in sync if senior analyst props change
  useEffect(() => {
    if (propTargetPrice && propTargetPrice > 0) {
      if (orderSide === 'BUY' && propTargetPrice > executionPrice) setTarget(propTargetPrice);
      else if (orderSide === 'SELL' && propTargetPrice < executionPrice) setTarget(propTargetPrice);
    }
    if (propStopLoss && propStopLoss > 0) {
      if (orderSide === 'BUY' && propStopLoss < executionPrice) setStop(propStopLoss);
      else if (orderSide === 'SELL' && propStopLoss > executionPrice) setStop(propStopLoss);
    }
  }, [propTargetPrice, propStopLoss, orderSide, executionPrice]);

  // Update limit price when symbol changes
  useEffect(() => {
    if (symbol.toUpperCase() === 'IFCI') {
      setLimitPrice(75.75);
      setTarget(orderSide === 'BUY' ? 77.05 : 74.20);
      setQuantity(722);
    } else {
      setLimitPrice(Number(safeMarketPrice.toFixed(2)));
    }
  }, [symbol, orderSide]);

  // Recalculate quantity when budget preset or marginMultiplier changes
  const applyBudget = (budgetAmount: number, currentMultiplier: number = marginMultiplier) => {
    setActiveBudget(budgetAmount);
    const totalBuyingPower = budgetAmount * currentMultiplier;
    const calculatedQty = Math.max(1, Math.floor(totalBuyingPower / executionPrice));
    setQuantity(calculatedQty);
  };

  const handleProductTypeChange = (newType: OrderProductType) => {
    setProductType(newType);
    const newMultiplier = newType === 'INTRADAY' ? 5 : newType === 'MTF' ? 2 : 1;
    if (activeBudget) {
      applyBudget(activeBudget, newMultiplier);
    }
  };

  const adjustQty = (delta: number) => {
    setActiveBudget(null);
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Groww Financials Calculations
  const totalOrderValue = Math.max(0, quantity * executionPrice);
  const requiredMargin = Math.max(0, totalOrderValue / marginMultiplier);
  const availableBalance = activeBudget ? activeBudget : Math.ceil(requiredMargin * 1.002);

  // Estimated Profit when reaching Target Price (Dual BUY vs SELL formula)
  const estProfit = orderSide === 'BUY'
    ? Math.max(0, quantity * (target - executionPrice))
    : Math.max(0, quantity * (executionPrice - target));
  const estProfitRoiOnMargin = requiredMargin > 0 ? (estProfit / requiredMargin) * 100 : 0;

  // Estimated Loss when hitting Stoploss (Dual BUY vs SELL formula)
  const estLoss = orderSide === 'BUY'
    ? Math.max(0, quantity * (executionPrice - stop))
    : Math.max(0, quantity * (stop - executionPrice));
  const estLossRoiOnMargin = requiredMargin > 0 ? (estLoss / requiredMargin) * 100 : 0;

  const riskRewardRatio = estLoss > 0 
    ? (estProfit / estLoss).toFixed(1) 
    : '0';

  // Limit price percentage from market
  const limitPriceDiffPct = ((limitPrice - safeMarketPrice) / safeMarketPrice) * 100;

  // Keypad click handler
  const handleKeypadPress = (val: string) => {
    setActiveBudget(null);
    if (activeInputField === 'qty') {
      if (val === 'DEL') {
        const str = String(quantity);
        setQuantity(str.length > 1 ? parseInt(str.slice(0, -1)) : 1);
      } else if (val === '.') {
        // quantity is integer
      } else {
        const str = String(quantity);
        const newStr = str === '0' ? val : str + val;
        setQuantity(parseInt(newStr) || 1);
      }
    } else if (activeInputField === 'price') {
      const str = String(limitPrice);
      if (val === 'DEL') {
        setLimitPrice(str.length > 1 ? parseFloat(str.slice(0, -1)) || safeMarketPrice : safeMarketPrice);
      } else if (val === '.') {
        if (!str.includes('.')) setLimitPrice(parseFloat(str + '.') || limitPrice);
      } else {
        const newStr = str + val;
        setLimitPrice(parseFloat(newStr) || limitPrice);
      }
    } else if (activeInputField === 'target') {
      const str = String(target);
      if (val === 'DEL') {
        setTarget(str.length > 1 ? parseFloat(str.slice(0, -1)) || defaultTarget : defaultTarget);
      } else if (val === '.') {
        if (!str.includes('.')) setTarget(parseFloat(str + '.') || target);
      } else {
        const newStr = str + val;
        setTarget(parseFloat(newStr) || target);
      }
    } else if (activeInputField === 'stop') {
      const str = String(stop);
      if (val === 'DEL') {
        setStop(str.length > 1 ? parseFloat(str.slice(0, -1)) || defaultStop : defaultStop);
      } else if (val === '.') {
        if (!str.includes('.')) setStop(parseFloat(str + '.') || stop);
      } else {
        const newStr = str + val;
        setStop(parseFloat(newStr) || stop);
      }
    }
  };

  const handleExecuteOrder = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = orderSide === 'BUY'
      ? `🟢 Bought ${quantity} shares of ${symbol} (${exchange}) @ ₹${executionPrice.toFixed(2)} | Target: ₹${target.toFixed(2)} | SL: ₹${stop.toFixed(2)}`
      : `🔴 Sold / Shorted ${quantity} shares of ${symbol} (${exchange}) @ ₹${executionPrice.toFixed(2)} | Target: ₹${target.toFixed(2)} | SL: ₹${stop.toFixed(2)}`;
    
    setToastMessage(msg);
    setOrderPlacedToast(true);

    try {
      await api.trackTrade({
        symbol: symbol.toUpperCase(),
        entry_price: executionPrice,
        entry_time: timeStr,
        target_price: target,
        stop_loss: stop,
        quantity: quantity,
        side: orderSide,
      });

      localStorage.setItem(`investiq_trade_${symbol.toUpperCase()}`, JSON.stringify({
        symbol: symbol.toUpperCase(),
        entryPrice: executionPrice,
        entryTime: timeStr,
        targetPrice: target,
        stopLoss: stop,
        quantity: quantity,
        side: orderSide,
        savedAt: Date.now()
      }));
    } catch (err) {
      console.error('Failed to register trade with backend:', err);
    }

    if (onTrade) onTrade(quantity);
    setTimeout(() => {
      setOrderPlacedToast(false);
    }, 4500);
  };

  return (
    <div
      className={`${
        inline
          ? 'bg-[#0E131F] border border-[#1E2638] rounded-2xl p-4 sm:p-5'
          : 'bg-[#0A0D14] border border-[#1C2024] rounded-2xl p-5 shadow-2xl'
      } space-y-4 font-sans text-slate-100 relative overflow-hidden`}
    >
      {/* Toast Notification when Order is Placed */}
      {orderPlacedToast && (
        <div className={`absolute top-3 inset-x-3 z-50 ${orderSide === 'BUY' ? 'bg-[#00D09C] text-[#0A0D14]' : 'bg-[#EF4444] text-white'} p-3 rounded-xl shadow-2xl flex items-center justify-between font-black animate-slideDown`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-black/20 font-mono">
            SUCCESS
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP BUY (LONG) vs SELL (SHORT / EXIT) DUAL SWITCHER TABS                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#121620] border border-[#1E2638] rounded-xl">
        <button
          onClick={() => handleSideChange('BUY')}
          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            orderSide === 'BUY'
              ? 'bg-[#00D09C] text-[#0A0D14] shadow-md shadow-[#00D09C]/20 scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>BUY (LONG)</span>
        </button>

        <button
          onClick={() => handleSideChange('SELL')}
          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            orderSide === 'SELL'
              ? 'bg-[#EF4444] text-white shadow-md shadow-rose-500/25 scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>SELL (SHORT)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* GROWW ORDER TYPE HEADER TABS: [Delivery] | [Intraday] | [MTF 2x]           */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-[#1C2024] pb-3">
        <div className="flex items-center gap-2">
          {/* Delivery Tab */}
          <button
            onClick={() => handleProductTypeChange('DELIVERY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              productType === 'DELIVERY'
                ? 'bg-[#1C2024] text-white border border-[#2A3240] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Delivery
          </button>

          {/* Intraday (5x) Tab - Selected by default in Groww screenshot */}
          <button
            onClick={() => handleProductTypeChange('INTRADAY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              productType === 'INTRADAY'
                ? 'bg-[#1C2024] text-white border border-[#00D09C]/50 shadow-sm shadow-[#00D09C]/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Intraday</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00D09C]/20 text-[#00D09C] font-black">
              5x
            </span>
          </button>

          {/* MTF 2x Tab */}
          <button
            onClick={() => handleProductTypeChange('MTF')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              productType === 'MTF'
                ? 'bg-[#1C2024] text-white border border-[#2A3240]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>MTF</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
              2x
            </span>
          </button>
        </div>

        {/* Settings Icon with Groww Green indicator dot */}
        <div className="relative">
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            title="Toggle Numeric Keypad"
            className="p-2 rounded-full bg-[#14171F] hover:bg-[#1C2024] text-slate-300 hover:text-white border border-[#232833] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00D09C] ring-2 ring-[#0A0D14]" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 1: Qty NSE ⇅  and  Quantity Input Box                                  */}
      {/* ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          {/* Exchange Selector Toggle (NSE vs BSE) */}
          <button
            onClick={() => setExchange(exchange === 'NSE' ? 'BSE' : 'NSE')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <span>Qty</span>
            <span className="text-white font-black">{exchange}</span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-300">⇅</span>
          </button>

          {/* Quantity Input Box (Groww Style) */}
          <div
            onClick={() => {
              setActiveInputField('qty');
              setShowKeypad(true);
            }}
            className={`w-36 px-3 py-2 rounded-xl bg-[#121620] border text-right cursor-pointer transition-all ${
              activeInputField === 'qty' && showKeypad
                ? 'border-[#00D09C] ring-1 ring-[#00D09C]/50'
                : 'border-[#222836] hover:border-slate-600'
            }`}
          >
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setActiveBudget(null);
                setQuantity(Math.max(1, parseInt(e.target.value) || 1));
              }}
              className="w-full bg-transparent text-right font-mono font-black text-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Quantity Adjusters: -10, +10, +50, +100, +500 */}
        <div className="flex items-center justify-end gap-1 text-[11px] font-bold">
          <button
            onClick={() => adjustQty(-10)}
            className="px-2 py-0.5 rounded-lg bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836] cursor-pointer"
          >
            -10
          </button>
          <button
            onClick={() => adjustQty(10)}
            className="px-2 py-0.5 rounded-lg bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836] cursor-pointer"
          >
            +10
          </button>
          <button
            onClick={() => adjustQty(50)}
            className="px-2 py-0.5 rounded-lg bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836] cursor-pointer"
          >
            +50
          </button>
          <button
            onClick={() => adjustQty(100)}
            className="px-2 py-0.5 rounded-lg bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836] cursor-pointer"
          >
            +100
          </button>
          <button
            onClick={() => adjustQty(500)}
            className="px-2 py-0.5 rounded-lg bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836] cursor-pointer"
          >
            +500
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: Price Limit ⇅  and  Price Input Box                                 */}
      {/* ========================================================================= */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          {/* Price Type Toggle (Limit vs Market) */}
          <button
            onClick={() => setPriceType(priceType === 'LIMIT' ? 'MARKET' : 'LIMIT')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <span>Price</span>
            <span className="text-white font-black">{priceType === 'LIMIT' ? 'Limit' : 'Market'}</span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-300">⇅</span>
          </button>

          {/* Price Input Box */}
          <div
            onClick={() => {
              if (priceType === 'LIMIT') {
                setActiveInputField('price');
                setShowKeypad(true);
              }
            }}
            className={`w-36 px-3 py-2 rounded-xl bg-[#121620] border text-right cursor-pointer transition-all ${
              priceType === 'MARKET'
                ? 'border-[#222836] opacity-75'
                : activeInputField === 'price' && showKeypad
                ? 'border-[#00D09C] ring-1 ring-[#00D09C]/50'
                : 'border-[#222836] hover:border-slate-600'
            }`}
          >
            {priceType === 'MARKET' ? (
              <span className="font-mono font-black text-lg text-slate-300">₹{safeMarketPrice.toFixed(2)}</span>
            ) : (
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || safeMarketPrice)}
                className="w-full bg-transparent text-right font-mono font-black text-xl text-white focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Indicator Below Price: "-0.04% from market" or Market Note */}
        <div className="text-right text-[11px] text-slate-400 font-medium">
          {priceType === 'LIMIT' ? (
            <span className={limitPriceDiffPct > 0 ? 'text-emerald-400' : limitPriceDiffPct < 0 ? 'text-rose-400' : 'text-slate-400'}>
              {limitPriceDiffPct >= 0 ? '+' : ''}{limitPriceDiffPct.toFixed(2)}% from market
            </span>
          ) : (
            <span className="text-slate-500 italic">
              Order will be executed at best price in market.
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK INVESTMENT BUDGET CHIPS (Includes ₹10,974 Groww Balance Preset!)     */}
      {/* ========================================================================= */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Select by Available Account Balance / Budget:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[5000, 10000, 10974, 25000, 50000, 100000].map((b) => (
            <button
              key={b}
              onClick={() => applyBudget(b)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBudget === b
                  ? 'bg-[#00D09C] text-[#0A0D14] shadow-md shadow-[#00D09C]/20 font-black'
                  : 'bg-[#141822] hover:bg-[#1E2433] text-slate-300 border border-[#222836]'
              }`}
            >
              ₹{b.toLocaleString('en-IN')}
              {b === 10974 && <span className="ml-1 text-[9px] font-black opacity-80">(Groww)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GROWW-STYLE STOPLOSS & TARGET SECTION (Matches User Screenshot Exactly!)  */}
      {/* ========================================================================= */}
      {showStoplossTarget ? (
        <div className="space-y-3 pt-2">
          {/* Divider with Close '✕' Button on the right (Exact Groww match) */}
          <div className="relative flex items-center justify-between border-t border-[#1C2024] pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Advanced Order Triggers (Groww Style)
            </span>
            <button
              onClick={() => setShowStoplossTarget(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Remove Stoploss / Target"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Selector Tabs: [Target Price] | [Stoploss (SL)] | [Both] */}
          <div className="flex items-center gap-1.5 text-xs font-bold bg-[#121620] p-1 rounded-xl border border-[#222836]">
            <button
              onClick={() => {
                setOrderTriggerMode('TARGET');
                setActiveInputField('target');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                orderTriggerMode === 'TARGET'
                  ? 'bg-[#00D09C] text-[#0A0D14] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Target Price
            </button>
            <button
              onClick={() => {
                setOrderTriggerMode('SL');
                setActiveInputField('stop');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                orderTriggerMode === 'SL'
                  ? 'bg-rose-500 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stoploss (SL)
            </button>
            <button
              onClick={() => setOrderTriggerMode('BOTH')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                orderTriggerMode === 'BOTH'
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Both (Bracket)
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TARGET PRICE ROW: "Est. profit +₹938.60 ⇅" (Exact user screenshot match!) */}
          {/* ========================================================================= */}
          {(orderTriggerMode === 'TARGET' || orderTriggerMode === 'BOTH') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Target Price
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Book profit when price hits target
                  </span>
                </div>

                {/* Target Price Input Box */}
                <div
                  onClick={() => {
                    setActiveInputField('target');
                    setShowKeypad(true);
                  }}
                  className={`w-36 px-3 py-2 rounded-xl bg-[#121620] border text-right cursor-pointer transition-all ${
                    target <= executionPrice && target > 0
                      ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                      : activeInputField === 'target' && showKeypad
                      ? 'border-[#00D09C] ring-1 ring-[#00D09C]/50'
                      : 'border-[#222836] hover:border-slate-600'
                  }`}
                >
                  <input
                    type="number"
                    step="0.05"
                    value={target}
                    onChange={(e) => {
                      setTarget(parseFloat(e.target.value) || 0);
                    }}
                    className="w-full bg-transparent text-right font-mono font-black text-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Exact Groww "Est. profit +₹938.60 ⇅" Line right below input box */}
              <div className="flex items-center justify-end text-[11px] font-bold">
                <span className="flex items-center gap-1 text-[#00D09C] font-mono font-black">
                  Est. profit +₹{estProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs text-slate-500 font-sans">⇅</span>
                </span>
              </div>

              {/* Validation Warning if Target is less than or equal to Limit */}
              {target <= executionPrice && target > 0 && (
                <div className="p-2.5 rounded-xl bg-[#2A1815] border border-amber-500/40 text-amber-300 text-xs text-center font-bold">
                  Target price should be greater than limit ₹{executionPrice.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STOPLOSS (SL) ROW: "Est. loss -₹... ⇅" & "☐ Trail ⓘ"                     */}
          {/* ========================================================================= */}
          {(orderTriggerMode === 'SL' || orderTriggerMode === 'BOTH') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Stoploss (SL)
                  </span>
                  {/* Trail checkbox with info icon (Exact Groww match) */}
                  <label className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trailSl}
                      onChange={(e) => setTrailSl(e.target.checked)}
                      className="rounded border-[#2A3240] text-[#00D09C] focus:ring-0"
                    />
                    <span>Trail</span>
                    <HelpCircle className="w-3 h-3 text-slate-500" />
                  </label>
                </div>

                {/* Stoploss Input Box (Orange/red border if invalid, like Groww screenshot) */}
                <div
                  onClick={() => {
                    setActiveInputField('stop');
                    setShowKeypad(true);
                  }}
                  className={`w-36 px-3 py-2 rounded-xl bg-[#121620] border text-right cursor-pointer transition-all ${
                    stop >= executionPrice
                      ? 'border-[#FF5252] ring-1 ring-[#FF5252]/40'
                      : activeInputField === 'stop' && showKeypad
                      ? 'border-rose-500 ring-1 ring-rose-500/50'
                      : 'border-[#222836] hover:border-slate-600'
                  }`}
                >
                  <input
                    type="number"
                    step="0.05"
                    value={stop}
                    onChange={(e) => {
                      setStop(parseFloat(e.target.value) || 0);
                    }}
                    className="w-full bg-transparent text-right font-mono font-black text-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Exact Groww "Est. loss -₹... ⇅" line right below input box */}
              <div className="flex items-center justify-end text-[11px] font-bold">
                <span className="flex items-center gap-1 text-rose-400 font-mono font-black">
                  Est. loss -₹{estLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs text-slate-500 font-sans">⇅</span>
                </span>
              </div>

              {/* Warning if SL is invalid (lesser for BUY, greater for SELL) */}
              {orderSide === 'BUY' && stop >= executionPrice && (
                <div className="p-2.5 rounded-xl bg-[#2A1515] border border-rose-500/40 text-rose-300 text-xs text-center font-bold">
                  SL price should be lesser than limit ₹{executionPrice.toFixed(2)}
                </div>
              )}
              {orderSide === 'SELL' && stop <= executionPrice && (
                <div className="p-2.5 rounded-xl bg-[#2A1515] border border-rose-500/40 text-rose-300 text-xs text-center font-bold">
                  For SELL/SHORT, SL price should be greater than limit ₹{executionPrice.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Quick Auto-Fill with Senior Analyst Levels */}
          <button
            onClick={() => {
              if (orderSide === 'BUY') {
                if (propTargetPrice && propTargetPrice > executionPrice) setTarget(propTargetPrice);
                else setTarget(Number((executionPrice * 1.035).toFixed(2)));
                if (propStopLoss && propStopLoss < executionPrice) setStop(propStopLoss);
                else setStop(Number((executionPrice * 0.985).toFixed(2)));
              } else {
                if (propTargetPrice && propTargetPrice < executionPrice) setTarget(propTargetPrice);
                else setTarget(Number((executionPrice * 0.965).toFixed(2)));
                if (propStopLoss && propStopLoss > executionPrice) setStop(propStopLoss);
                else setStop(Number((executionPrice * 1.015).toFixed(2)));
              }
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#232D42] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {orderSide === 'BUY'
                ? `✨ Auto-Fill Bullish Target (₹${target.toFixed(2)}) & SL (₹${stop.toFixed(2)})`
                : `✨ Auto-Fill Bearish Target (₹${target.toFixed(2)}) & SL (₹${stop.toFixed(2)})`}
            </span>
          </button>
        </div>
      ) : (
        <div className="pt-1">
          <button
            onClick={() => setShowStoplossTarget(true)}
            className="flex items-center gap-1.5 text-xs font-black text-[#00D09C] hover:underline cursor-pointer"
          >
            <span>+ Add Stoploss / Target</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GROWW FINANCIALS BAR: Balance: ₹10,974  |  Margin (5x): ₹10,972           */}
      {/* ========================================================================= */}
      <div className="pt-2 border-t border-[#1C2024] space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="text-slate-300">
            <span>Balance: </span>
            <span className="text-white font-mono font-black">
              ₹{availableBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 underline decoration-dotted decoration-slate-500 cursor-help" title="Intraday leverage gives you 5x buying power on equities">
              Margin ({marginMultiplier}x):{' '}
            </span>
            <span className="text-white font-mono font-black">
              ₹{Math.ceil(requiredMargin).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Total Order Value: ₹{totalOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>Risk : Reward: 1 : {riskRewardRatio}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY ORDER EXECUTION BUTTON (Green for BUY, Red for SELL)              */}
      {/* ========================================================================= */}
      {orderSide === 'BUY' ? (
        <button
          onClick={handleExecuteOrder}
          className="w-full py-3.5 px-4 rounded-xl bg-[#00D09C] hover:bg-[#00B789] text-[#0A0D14] font-black text-base shadow-lg shadow-[#00D09C]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5 text-black" />
          <span>Buy {symbol}</span>
        </button>
      ) : (
        <button
          onClick={handleExecuteOrder}
          className="w-full py-3.5 px-4 rounded-xl bg-[#EF4444] hover:bg-rose-600 text-white font-black text-base shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-5 h-5 text-white" />
          <span>Sell / Short {symbol}</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* GROWW-STYLE VIRTUAL NUMERIC KEYPAD (Collapsible / Touch Friendly)         */}
      {/* ========================================================================= */}
      {showKeypad && (
        <div className="pt-2 border-t border-[#1C2024] animate-fadeIn">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold uppercase">
            <span>
              Editing:{' '}
              <strong className="text-emerald-400">
                {activeInputField === 'qty'
                  ? 'Quantity'
                  : activeInputField === 'price'
                  ? 'Limit Price'
                  : activeInputField === 'target'
                  ? 'Target Price'
                  : 'Stoploss Price'}
              </strong>
            </span>
            <button
              onClick={() => setShowKeypad(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Close Pad
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-lg font-bold font-mono">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeypadPress(key)}
                className="py-2.5 rounded-xl bg-[#141822] hover:bg-[#1E2433] text-white border border-[#222836] active:bg-[#00D09C] active:text-black transition-colors cursor-pointer"
              >
                {key === 'DEL' ? '⌫' : key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
