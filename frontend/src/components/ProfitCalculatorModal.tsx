import React from 'react';
import { X } from 'lucide-react';
import { ProfitCalculator } from './ProfitCalculator';

interface ProfitCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  initialQuantity?: number;
  onTrade?: (qty: number) => void;
}

export const ProfitCalculatorModal: React.FC<ProfitCalculatorModalProps> = ({
  isOpen,
  onClose,
  symbol,
  currentPrice,
  targetPrice,
  stopLoss,
  initialQuantity = 50,
  onTrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0E131F] border border-[#20293B] rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#1A2234] hover:bg-[#243048] text-slate-400 hover:text-white transition-colors border border-[#2A3752]"
        >
          <X className="w-5 h-5" />
        </button>

        <ProfitCalculator
          symbol={symbol}
          currentPrice={currentPrice}
          targetPrice={targetPrice}
          stopLoss={stopLoss}
          initialQuantity={initialQuantity}
          inline={false}
          onTrade={(qty) => {
            if (onTrade) onTrade(qty);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
