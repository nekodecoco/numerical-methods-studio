'use client';

import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface RootFindingActionBarProps {
  method: 'bisection' | 'false-position' | 'fixed-point' | 'newton-raphson' | 'secant' | 'mullers';
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
  const isAtEnd = currentIter >= totalSteps;
  const isAtStart = currentIter <= 1;

  const handleNext = () => {
    if (isAtEnd) return;
    onNext();
  };

  const getMethodLabel = () => {
    switch (method) {
      case 'bisection':
        return 'Bisection Iteration';
      case 'false-position':
        return 'False Position Iteration';
      case 'fixed-point':
        return 'Fixed-Point Step';
      case 'newton-raphson':
        return 'Newton Tangent Step';
      case 'secant':
        return 'Secant Difference Step';
      case 'mullers':
        return "Muller's Parabola Step";
      default:
        return 'Iteration Step';
    }
  };

  return (
    <div className="bg-[#121215] rounded-xl border border-white/10 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
      {/* Current Step Status & Scrubber */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-400">
            {getMethodLabel()}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono text-amber-300">
              i = {currentIter}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold bg-white/5 text-stone-200 border border-white/10">
              x_r = {xr.toFixed(6)}
            </span>
            {ea !== null && (
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-md font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ε_a: {ea < 0.001 ? ea.toExponential(2) : ea.toFixed(4)}%
              </span>
            )}
          </div>
        </div>

        {/* Scrubber */}
        {totalSteps > 1 && (
          <div className="hidden lg:flex flex-col gap-1 ml-3">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>1</span>
              <span>Step ({currentIter}/{totalSteps})</span>
              <span>{totalSteps}</span>
            </div>
            <input
              type="range"
              min="1"
              max={totalSteps}
              value={currentIter}
              onChange={(e) => onSetIter(parseInt(e.target.value) || 1)}
              className="w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onPrev}
          disabled={isAtStart}
          title="Previous iteration"
          className="p-2 rounded-lg border border-white/10 text-stone-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart}
          title="Reset to iteration 1"
          className="px-3 py-2 rounded-lg border border-white/10 text-xs font-mono font-medium text-stone-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-1">Reset</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isAtEnd}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer ${
            isAtEnd
              ? 'bg-white/5 text-stone-500 cursor-not-allowed border border-white/5'
              : 'bg-[#800020] text-white hover:bg-[#9a0027] border border-[#800020]/60'
          }`}
        >
          {isAtEnd ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed ({totalSteps} steps)</span>
            </>
          ) : (
            <>
              <span>Next Iteration (i = {currentIter + 1})</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
