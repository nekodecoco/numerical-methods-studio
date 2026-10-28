'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';

interface RootFindingActionBarProps {
  method: 'bisection' | 'false-position';
  currentIter: number;
  totalSteps: number;
  converged: boolean;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSetIter: (iter: number) => void;
  xr: number;
  ea: number | null;
}

export const RootFindingActionBar: React.FC<RootFindingActionBarProps> = ({
  method,
  currentIter,
  totalSteps,
  converged,
  onNext,
  onPrev,
  onReset,
  onSetIter,
  xr,
  ea,
}) => {
  const [burstActive, setBurstActive] = useState(false);
  const isAtEnd = currentIter >= totalSteps;
  const isAtStart = currentIter <= 1;

  const handleNext = () => {
    if (isAtEnd) return;

    setBurstActive(true);
    setTimeout(() => setBurstActive(false), 400);

    const nextIter = currentIter + 1;
    if (nextIter === totalSteps || nextIter % 5 === 0) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#800020', '#D97706', '#2563EB', '#10B981'],
        });
      } catch {}
    }

    onNext();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Current Step Status & Scrubber */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            {method === 'bisection' ? 'Bisection Step' : 'False Position Step'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-[#800020]">
              i = {currentIter}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300">
              x_r ≈ {xr.toFixed(6)}
            </span>
            {ea !== null && (
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600 border border-stone-200">
                ε_a: {ea < 0.001 ? ea.toExponential(2) : ea.toFixed(4)}%
              </span>
            )}
          </div>
        </div>

        {/* Scrubber */}
        {totalSteps > 1 && (
          <div className="hidden lg:flex flex-col gap-1 ml-2">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>1</span>
              <span>Scrub Step ({currentIter}/{totalSteps})</span>
              <span>{totalSteps}</span>
            </div>
            <input
              type="range"
              min="1"
              max={totalSteps}
              value={currentIter}
              onChange={(e) => onSetIter(parseInt(e.target.value) || 1)}
              className="w-32 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#800020]"
            />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onPrev}
          disabled={isAtStart}
          title="Previous iteration"
          className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart}
          title="Reset to iteration 1"
          className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Reset</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isAtEnd}
          className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 select-none overflow-hidden cursor-pointer ${
            isAtEnd
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              : burstActive
              ? 'bg-[#6b001b] text-white scale-95 ring-4 ring-[#800020]/25'
              : 'bg-[#800020] text-white hover:bg-[#6b001b] active:scale-95'
          }`}
        >
          {isAtEnd ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Max Iteration Reached</span>
            </>
          ) : (
            <>
              <Sparkles className={`w-4 h-4 transition-transform duration-300 ${burstActive ? 'rotate-45 scale-125' : ''}`} />
              <span>Next Iteration (i = {currentIter + 1})</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
