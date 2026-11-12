'use client';

import React from 'react';
import { ChevronRight, RotateCcw, CheckCircle2, ChevronLeft, Plus } from 'lucide-react';

interface ActionBarProps {
  currentOrder: number;
  maxAvailableOrder: number;
  capOrder: number;
  onRevealNext: () => void;
  onStepBack: () => void;
  onSetOrder: (ord: number) => void;
  onReset: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  currentOrder,
  maxAvailableOrder,
  capOrder,
  onRevealNext,
  onStepBack,
  onSetOrder,
  onReset,
}) => {
  const isCapped = currentOrder >= capOrder;
  const isMaxPossible = currentOrder >= maxAvailableOrder;
  const isAtStart = currentOrder === 0;

  const handleReveal = () => {
    if (isCapped || isMaxPossible) return;
    onRevealNext();
  };

  return (
    <div className="bg-[#121215] rounded-xl border border-white/10 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
      {/* Current Order Status & Scrubber */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-400">
            Polynomial Degree
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono text-amber-300">
              n = {currentOrder}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono font-medium bg-white/5 text-stone-300 border border-white/10">
              {currentOrder === 0
                ? 'Constant f(a)'
                : currentOrder === 1
                ? 'Tangent Line'
                : currentOrder === 2
                ? 'Osculating Parabola'
                : `Order ${currentOrder} Polynomial`}
            </span>
          </div>
        </div>

        {/* Adaptive Progress Indicator: Dots if <= 12, Scrubber Slider if > 12 */}
        {capOrder <= 12 ? (
          <div className="hidden md:flex items-center gap-1.5 ml-3">
            {Array.from({ length: capOrder + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSetOrder(idx)}
                title={`Jump to Order ${idx}`}
                className={`h-2 rounded-full transition-colors cursor-pointer ${
                  idx === currentOrder
                    ? 'w-5 bg-amber-400'
                    : idx < currentOrder
                    ? 'w-2 bg-stone-500 hover:bg-stone-400'
                    : 'w-2 bg-white/10 hover:bg-white/20'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col gap-1 ml-3">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>0</span>
              <span>Degree ({currentOrder}/{capOrder})</span>
              <span>{capOrder}</span>
            </div>
            <input
              type="range"
              min="0"
              max={capOrder}
              value={currentOrder}
              onChange={(e) => onSetOrder(parseInt(e.target.value) || 0)}
              className="w-36 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Step Back button */}
        <button
          type="button"
          onClick={onStepBack}
          disabled={isAtStart}
          title="Step back one order"
          className="p-2 rounded-lg border border-white/10 text-stone-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Reset to Order 0 */}
        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart}
          title="Reset to 0th order"
          className="px-3 py-2 rounded-lg border border-white/10 text-xs font-mono font-medium text-stone-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Next Derivative Step Button */}
        <button
          type="button"
          onClick={handleReveal}
          disabled={isCapped || isMaxPossible}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer ${
            isCapped || isMaxPossible
              ? 'bg-white/5 text-stone-500 cursor-not-allowed border border-white/5'
              : 'bg-[#800020] text-white hover:bg-[#9a0027] border border-[#800020]/60'
          }`}
        >
          {isCapped ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cap Reached (n = {capOrder})</span>
            </>
          ) : isMaxPossible ? (
            <span>Derivative Limit Reached</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Compute Next Order (n = {currentOrder + 1})</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
