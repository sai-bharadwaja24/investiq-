import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  AreaData,
  Time,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  createSeriesMarkers
} from 'lightweight-charts';
import { Candle, CandlePatternMatch } from '../types';
import { BarChart2, Activity, TrendingUp, Maximize2, Sparkles, Layers } from 'lucide-react';

interface LiveCandlestickChartProps {
  candles: Candle[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  patterns?: CandlePatternMatch[];
  activePattern?: CandlePatternMatch | null;
}

export const LiveCandlestickChart: React.FC<LiveCandlestickChartProps> = ({
  candles,
  timeframe,
  setTimeframe,
  patterns = [],
  activePattern
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);

  const [chartMode, setChartMode] = useState<'area' | 'candlestick'>('candlestick');
  const [hoveredCandle, setHoveredCandle] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: string;
    change: number;
    changePct: number;
  } | null>(null);

  // Latest candle fallback for legend
  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const activeLegend = hoveredCandle || (latestCandle ? {
    open: latestCandle.open,
    high: latestCandle.high,
    low: latestCandle.low,
    close: latestCandle.close,
    volume: latestCandle.volume,
    time: latestCandle.time,
    change: latestCandle.close - latestCandle.open,
    changePct: latestCandle.open > 0 ? ((latestCandle.close - latestCandle.open) / latestCandle.open) * 100 : 0
  } : null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0E131F' },
        textColor: '#8C9BAE',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#182030' },
        horzLines: { color: '#182030' },
      },
      crosshair: {
        vertLine: {
          color: '#3B4B68',
          width: 1,
          style: 1, // LineStyle.Dotted
          labelBackgroundColor: '#232D42',
        },
        horzLine: {
          color: '#3B4B68',
          width: 1,
          style: 1,
          labelBackgroundColor: '#232D42',
        },
      },
      rightPriceScale: {
        borderColor: '#1E2638',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves 25% space at bottom for volume bars
        },
      },
      timeScale: {
        borderColor: '#1E2638',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // 1. Normal Graph: Area Series (Smooth line with gradient fill)
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(0, 208, 156, 0.35)',
      bottomColor: 'rgba(0, 208, 156, 0.01)',
      lineColor: '#00D09C',
      lineWidth: 2,
      priceLineVisible: true,
      visible: chartMode === 'area',
    });
    areaSeriesRef.current = areaSeries;

    // 2. Candlestick Series (OHLC bars with wicks)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00D09C',
      downColor: '#EF4444',
      borderUpColor: '#00D09C',
      borderDownColor: '#EF4444',
      wickUpColor: '#00D09C',
      wickDownColor: '#EF4444',
      visible: chartMode === 'candlestick',
    });
    candleSeriesRef.current = candleSeries;

    // 3. Volume Series at bottom
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume_scale',
    });
    chart.priceScale('volume_scale').applyOptions({
      scaleMargins: {
        top: 0.75, // Volume occupies bottom 25%
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle mouse hover crosshair tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as any;
      const areaData = param.seriesData.get(areaSeries) as any;
      const volData = param.seriesData.get(volumeSeries) as any;

      if (candleData) {
        const o = candleData.open;
        const h = candleData.high;
        const l = candleData.low;
        const c = candleData.close;
        const chg = c - o;
        const chgPct = o > 0 ? (chg / o) * 100 : 0;
        setHoveredCandle({
          open: o,
          high: h,
          low: l,
          close: c,
          volume: volData?.value || 0,
          time: String(param.time),
          change: chg,
          changePct: chgPct,
        });
      } else if (areaData) {
        const c = areaData.value;
        setHoveredCandle({
          open: c,
          high: c,
          low: c,
          close: c,
          volume: volData?.value || 0,
          time: String(param.time),
          change: 0,
          changePct: 0,
        });
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 340,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Toggle series visibility when chartMode changes
  useEffect(() => {
    if (areaSeriesRef.current && candleSeriesRef.current) {
      areaSeriesRef.current.applyOptions({ visible: chartMode === 'area' });
      candleSeriesRef.current.applyOptions({ visible: chartMode === 'candlestick' });
    }
  }, [chartMode]);

  // Update chart data whenever candles or patterns change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    // Format candlestick data
    const baseTime = Math.floor(Date.now() / 1000) - candles.length * 300;
    
    const formattedCandles: CandlestickData<Time>[] = [];
    const formattedArea: AreaData<Time>[] = [];
    const formattedVolumes: HistogramData<Time>[] = [];

    candles.forEach((c, idx) => {
      const timeVal = (baseTime + idx * 300) as unknown as Time;
      const isUp = c.close >= c.open;

      formattedCandles.push({
        time: timeVal,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });

      formattedArea.push({
        time: timeVal,
        value: c.close,
      });

      formattedVolumes.push({
        time: timeVal,
        value: c.volume || 10000,
        color: isUp ? 'rgba(0, 208, 156, 0.45)' : 'rgba(239, 68, 68, 0.45)',
      });
    });

    candleSeriesRef.current.setData(formattedCandles);
    if (areaSeriesRef.current) {
      areaSeriesRef.current.setData(formattedArea);
    }
    volumeSeriesRef.current.setData(formattedVolumes);

    // Set Candlestick Pattern Markers on chart
    if (patterns && patterns.length > 0) {
      const markers: any[] = [];
      patterns.forEach((p) => {
        const targetCandleIdx = Math.min(candles.length - 1, Math.max(0, p.candle_index));
        const timeVal = (baseTime + targetCandleIdx * 300) as unknown as Time;
        const isBullish = p.sentiment === 'BULLISH';

        markers.push({
          time: timeVal,
          position: isBullish ? 'belowBar' : 'aboveBar',
          color: isBullish ? '#00D09C' : '#EF4444',
          shape: isBullish ? 'arrowUp' : 'arrowDown',
          text: p.pattern_name.split(' ')[0] || 'Pattern',
          size: 1.5,
        });
      });

      try {
        createSeriesMarkers(candleSeriesRef.current as any, markers);
      } catch (err) {}
    }

    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, patterns]);

  return (
    <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 shadow-lg space-y-4">
      {/* Top Header: Title, Graph Type Mode Switcher & Timeframes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2436] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            {chartMode === 'area' ? 'NORMAL PRICE GRAPH' : 'CANDLESTICK CHART'}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {chartMode === 'area' ? '📈 Smooth Line + Volume' : '🕯️ Japanese OHLC + Wicks'}
            </span>
          </h3>
        </div>

        {/* Graph Mode Toggle & Timeframe selector buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Normal vs Candlestick Mode Switcher */}
          <div className="flex items-center bg-[#141A26] border border-[#20293C] rounded-xl p-1 gap-1">
            <button
              onClick={() => setChartMode('area')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Normal Graph</span>
            </button>
            <button
              onClick={() => setChartMode('candlestick')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'candlestick'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Candlestick</span>
            </button>
          </div>

          {/* Timeframe buttons */}
          <div className="flex items-center bg-[#151B28] border border-[#232D42] rounded-xl p-1">
            {['1m', '5m', '15m', '30m', '1h', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Information Legend (O, H, L, C, Vol, Change) */}
      {activeLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono bg-[#141A26] px-3 py-2 rounded-xl border border-[#20293C]">
          <div>
            <span className="text-slate-500 mr-1">O</span>
            <span className="text-slate-200 font-bold">₹{activeLegend.open.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">H</span>
            <span className="text-emerald-400 font-bold">₹{activeLegend.high.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">L</span>
            <span className="text-rose-400 font-bold">₹{activeLegend.low.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">C</span>
            <span className="text-white font-bold">₹{activeLegend.close.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Vol</span>
            <span className="text-slate-300">{(activeLegend.volume / 1000).toFixed(1)}k</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Change</span>
            <span
              className={`font-bold ${
                activeLegend.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {activeLegend.change >= 0 ? '+' : ''}
              {activeLegend.change.toFixed(2)} ({activeLegend.change >= 0 ? '+' : ''}
              {activeLegend.changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      {/* Lightweight Chart Canvas Container */}
      <div
        ref={chartContainerRef}
        className="w-full h-[340px] rounded-xl overflow-hidden relative cursor-crosshair"
      />

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-3">
          {chartMode === 'candlestick' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00D09C]"></span>
                Bullish Candle (Up)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
                Bearish Candle (Down)
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]"></span>
              Live Price Flow (Area Gradient)
            </span>
          )}
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600"></span>
            Bottom Volume
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Drag to pan • Scroll to zoom in/out
        </span>
      </div>
    </div>
  );
};
