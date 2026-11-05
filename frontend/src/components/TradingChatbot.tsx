import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  HelpCircle,
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  Key,
  Settings,
  Check
} from 'lucide-react';
import {
  ChatMessage,
  ChatContext,
  StockQuote,
  SeniorAnalystVerdict,
  IntradayPrediction
} from '../types';
import { api } from '../services/api';

interface TradingChatbotProps {
  activeQuote?: StockQuote | null;
  seniorVerdict?: SeniorAnalystVerdict | null;
  prediction?: IntradayPrediction | null;
  timeframe?: string;
  quantity?: number;
  limitPrice?: number;
  productType?: string;
}

export const TradingChatbot: React.FC<TradingChatbotProps> = ({
  activeQuote,
  seniorVerdict,
  prediction,
  timeframe = '5m',
  quantity = 722,
  limitPrice,
  productType = 'INTRADAY',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('chat') === 'open';
    } catch {
      return false;
    }
  });
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `### 👋 Welcome to InvestIQ AI Trading Copilot!

I am your **Senior Intraday Market Analyst & Trading Mentor**. I have deep institutional expertise in:
- **Price Action & VWAP**: Identifying smart money order flow and retail traps.
- **Intraday Leverage on Groww**: 5x margin calculations, position sizing, and 3:20 PM square-off rules.
- **Risk Management**: Strictly capping max loss to protect your hard-earned capital.

Ask me anything below or tap one of the suggested prompts!`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [suggestedChips, setSuggestedChips] = useState<string[]>([
    activeQuote ? `Should I buy ${activeQuote.symbol} now?` : 'Tell those stocks in dip ready to rise',
    activeQuote ? `Calculate profit for ${quantity} shares` : 'I want something around 500 rupees range',
    activeQuote ? `Why is ${activeQuote.symbol} at this price?` : 'Which stocks are breaking out today?',
    'How does 5x Intraday Margin work on Groww?'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Update suggested chips when active stock changes
  useEffect(() => {
    if (activeQuote) {
      setSuggestedChips([
        `Stocks in dip ready to rise`,
        `Should I buy ${activeQuote.symbol} right now?`,
        `Calculate profit on ${quantity} shares of ${activeQuote.symbol}`,
        `Explain the ${seniorVerdict?.active_candlestick_pattern?.pattern_name || '5m'} pattern on ${activeQuote.symbol}`,
        `How does 5x Intraday Margin work on Groww?`
      ]);
    } else {
      setSuggestedChips([
        'Tell those stocks in dip ready to rise',
        'I want something around 500 rupees range',
        'Which stocks are breaking out today?',
        'Suggest me budget stocks under ₹100',
        'How does 5x Intraday Margin work on Groww?'
      ]);
    }
  }, [activeQuote?.symbol, quantity, seniorVerdict?.active_candlestick_pattern?.pattern_name]);

  // Build current context object
  const buildContext = (): ChatContext => {
    return {
      symbol: activeQuote?.symbol || undefined,
      name: activeQuote?.name || undefined,
      price: activeQuote?.price !== undefined ? activeQuote.price : undefined,
      bse_price: activeQuote?.bse_price !== undefined ? activeQuote.bse_price : undefined,
      change_percent: activeQuote?.change_percent !== undefined ? activeQuote.change_percent : undefined,
      high: activeQuote?.high !== undefined ? activeQuote.high : undefined,
      low: activeQuote?.low !== undefined ? activeQuote.low : undefined,
      vwap: activeQuote?.vwap !== undefined ? activeQuote.vwap : undefined,
      timeframe: timeframe,
      quantity: quantity,
      limit_price: limitPrice || activeQuote?.price || undefined,
      product_type: productType,
      target_price: seniorVerdict?.target_price || prediction?.projected_target_price || undefined,
      stop_loss: seniorVerdict?.stop_loss || prediction?.invalidation_stop_loss || undefined,
      active_pattern: seniorVerdict?.active_candlestick_pattern?.pattern_name || undefined,
      pattern_sentiment: seniorVerdict?.active_candlestick_pattern?.sentiment || undefined,
      senior_verdict: seniorVerdict?.verdict || undefined,
      conviction_percent: seniorVerdict?.conviction_percent !== undefined ? seniorVerdict.conviction_percent : undefined,
      senior_analyst_take: seniorVerdict?.senior_analyst_take || undefined,
      user_balance: 10974.0
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const context = buildContext();
      // Pass clean message history (user and model turns)
      const sanitizedMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));
      const response = await api.sendChatMessage(sanitizedMessages, context);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggested_chips && response.suggested_chips.length > 0) {
        setSuggestedChips(response.suggested_chips);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ The trading intelligence server is synchronizing. Please try again or tap one of the suggested prompts below.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `### 🔄 Chat cleared. 
        
Connected to live context for **${activeQuote?.symbol || 'Markets'}**. What would you like to analyze next?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format assistant markdown output cleanly
  const renderMessageContent = (content: string) => {
    // Simple markdown line splitter
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-black text-white pt-1 pb-0.5 border-b border-white/10">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-indigo-300 pt-1">
                {trimmed.replace('#### ', '')}
              </h5>
            );
          }
          // Blockquotes
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="p-2 rounded-lg bg-emerald-500/10 border-l-2 border-[#00D09C] text-emerald-200 my-1 font-medium">
                {trimmed.replace('> ', '')}
              </div>
            );
          }
          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-[#00D09C] font-bold">•</span>
                <span>{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          // Numbered items
          if (/^\d+\.\s+/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-[#00D09C] font-bold font-mono">{trimmed.match(/^\d+\./)![0]}</span>
                <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
              </div>
            );
          }

          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* FLOATING CHATBOT BUTTON (Always visible in bottom-right corner)           */}
      {/* ========================================================================= */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0C101A] via-[#141A28] to-[#0E1524] text-white border border-[#00D09C]/40 shadow-2xl shadow-[#00D09C]/20 hover:scale-105 hover:border-[#00D09C] transition-all cursor-pointer group"
        >
          <div className="relative">
            <span className="p-2 rounded-full bg-[#00D09C]/20 text-[#00D09C] flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00D09C] ring-2 ring-[#0A0D14]" />
          </div>

          <div className="text-left">
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Ask AI Copilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Senior Analyst
              </span>
            </div>
            {activeQuote ? (
              <div className="text-[10px] text-emerald-400 font-mono font-bold truncate max-w-[140px]">
                ● Live: {activeQuote.symbol} (₹{activeQuote.price.toFixed(1)})
              </div>
            ) : (
              <div className="text-[10px] text-slate-400">Trading & Intraday Brain</div>
            )}
          </div>
        </button>
      )}

      {/* ========================================================================= */}
      {/* EXPANDED CHAT WINDOW                                                      */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh] bg-[#0A0D14] border border-[#1E2432] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp font-sans">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#101420] border-b border-[#1C2230]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D09C] to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#00D09C]/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide">
                    INVESTIQ AI COPILOT
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00D09C]/20 text-[#00D09C] font-black border border-[#00D09C]/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Senior Technical Analyst & Intraday Specialist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <div
                title="AI Powered by Serverless Intelligence"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              >
                <Zap className="w-3 h-3 text-[#00D09C]" />
                <span>AI Engine Active</span>
              </div>
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Stock Context Bar */}
          <div className="px-3.5 py-2 bg-[#121724] border-b border-[#1C2230] flex items-center justify-between text-[11px]">
            {activeQuote ? (
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse" />
                <span className="font-bold text-white font-mono">{activeQuote.symbol}</span>
                <span className="text-slate-400">₹{activeQuote.price.toFixed(2)}</span>
                <span className={activeQuote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ({activeQuote.change >= 0 ? '+' : ''}{activeQuote.change_percent.toFixed(2)}%)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  {productType} 5x
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Markets Dashboard Mode (Global Context)</span>
              </div>
            )}

            {seniorVerdict && (
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                seniorVerdict.verdict === 'AVOID_SELL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {seniorVerdict.verdict}
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0A0D14]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-[#1C2538] text-white border border-[#2B3850]'
                      : 'bg-[#101420] text-slate-200 border border-[#1E2638]'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                  {msg.timestamp && (
                    <div className="text-[9px] text-slate-500 text-right mt-1.5 font-mono">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-[#00D09C]/20 text-[#00D09C] border border-[#00D09C]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2 pl-8">
                <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-bounce delay-200" />
                <span className="ml-1 text-[11px] text-indigo-300">Senior Analyst reasoning...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context-Sensitive Prompt Chips */}
          <div className="px-3 py-2 bg-[#0E121C] border-t border-[#1C2230] overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#222B3D] text-[10px] font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>{chip}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-50" />
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#101420] border-t border-[#1C2230]">
            <div className="flex items-center gap-2 bg-[#141824] border border-[#222B3D] focus-within:border-[#00D09C] rounded-xl px-3 py-1.5 transition-colors">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeQuote
                    ? `Ask about ${activeQuote.symbol}, profit, VWAP, risk...`
                    : 'Ask about trading, 5x margin, candlestick patterns...'
                }
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="p-1.5 rounded-lg bg-[#00D09C] hover:bg-[#00B789] text-[#0A0D14] disabled:opacity-40 disabled:hover:bg-[#00D09C] transition-all cursor-pointer font-bold shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
