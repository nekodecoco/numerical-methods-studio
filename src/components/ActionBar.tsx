'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ChevronRight, RotateCcw, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';

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
  const [burstActive, setBurstActive] = useState(false);
  const isCapped = currentOrder >= capOrder;
  const isMaxPossible = currentOrder >= maxAvailableOrder;
  const isAtStart = currentOrder === 0;

  const handleReveal = () => {
    if (isCapped || isMaxPossible) return;

    // Trigger micro-interaction burst
    setBurstActive(true);
    setTimeout(() => setBurstActive(false), 450);

    // Celebrate key milestones (every 5 orders or cap)
    const nextOrd = currentOrder + 1;
    if (nextOrd % 5 === 0 || nextOrd === capOrder) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#800020', '#F59E0B', '#10B981', '#6366F1'],
        });
      } catch {
        // Safe fallback
      }
    }

    onRevealNext();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Current Order Status & Scrubber */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Current Taylor Degree
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-[#800020]">
              n = {currentOrder}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600 border border-stone-200">
              {currentOrder === 0
                ? 'Constant f(a)'
                : currentOrder === 1
                ? 'Tangent Line'
                : currentOrder === 2
                ? 'Osculating Parabola'
                : `Order ${currentOrder} Fit`}
            </span>
          </div>
        </div>

        {/* Adaptive Progress Indicator: Dots if <= 12, Scrubber Slider if > 12 */}
        {capOrder <= 12 ? (
          <div className="hidden md:flex items-center gap-1 ml-2">
            {Array.from({ length: capOrder + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSetOrder(idx)}
                title={`Jump to Order ${idx}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentOrder
                    ? 'w-5 bg-[#800020]'
                    : idx < currentOrder
                    ? 'w-2.5 bg-amber-400 hover:bg-amber-500'
                    : 'w-2 bg-stone-200 hover:bg-stone-300'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col gap-1 ml-2">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>0</span>
              <span>Scrub Order ({currentOrder}/{capOrder})</span>
              <span>{capOrder}</span>
            </div>
            <input
              type="range"
              min="0"
              max={capOrder}
              value={currentOrder}
              onChange={(e) => onSetOrder(parseInt(e.target.value) || 0)}
              className="w-36 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#800020]"
            />
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Step Back button for classroom flow */}
        <button
          type="button"
          onClick={onStepBack}
          disabled={isAtStart}
          title="Step back one order"
          className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Reset to Order 0 */}
        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart}
          title="Reset to 0th order"
          className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* The Hero "Reveal Next Derivative" Button with Micro-Interaction */}
        <button
          type="button"
          onClick={handleReveal}
          disabled={isCapped || isMaxPossible}
          className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 select-none overflow-hidden ${
            isCapped || isMaxPossible
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              : burstActive
              ? 'bg-[#6b001b] text-white scale-95 ring-4 ring-[#800020]/25 shadow-lg'
              : 'bg-[#800020] text-white hover:bg-[#6b001b] hover:shadow-lg hover:shadow-[#800020]/25 active:scale-95'
          }`}
        >
          {/* Subtle micro-interaction pulse ring */}
          {burstActive && (
            <span className="absolute inset-0 bg-white/20 animate-ping rounded-xl pointer-events-none" />
          )}

          {isCapped ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Maximum Order ({capOrder}) Reached</span>
            </>
          ) : isMaxPossible ? (
            <span>Cannot Differentiate Further</span>
          ) : (
            <>
              <Sparkles className={`w-4 h-4 transition-transform duration-300 ${burstActive ? 'rotate-45 scale-125' : ''}`} />
              <span>Reveal Next Derivative (n = {currentOrder + 1})</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
