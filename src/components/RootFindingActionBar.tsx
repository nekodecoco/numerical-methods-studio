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
        return 'Secant Secant Step';
      case 'mullers':
        return "Muller's Parabola Step";
      default:
        return 'Iteration Step';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Current Step Status & Scrubber */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-500">
            {getMethodLabel()}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono text-[#800020]">
              i = {currentIter}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold bg-stone-100 text-stone-800 border border-stone-200">
              x_r = {xr.toFixed(6)}
            </span>
            {ea !== null && (
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-md font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
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
              className="w-32 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#800020]"
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
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart}
          title="Reset to iteration 1"
          className="px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-1">Reset</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isAtEnd}
          className={`px-4 py-2 rounded-lg font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer ${
            isAtEnd
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
              : 'bg-[#800020] text-white hover:bg-[#6b001b] active:bg-[#540015]'
          }`}
        >
          {isAtEnd ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
