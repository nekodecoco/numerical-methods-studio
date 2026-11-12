'use client';

import React, { useState } from 'react';
import { Play, HelpCircle, AlertCircle } from 'lucide-react';
import { MathView } from './MathView';
import { RootFindingPreset } from '@/lib/rootFinding';

interface RootFindingControlProps {
  method: 'bisection' | 'false-position';
  presets: RootFindingPreset[];
  exprInput: string;
  setExprInput: (val: string) => void;
  xlInput: number;
  setXlInput: (val: number) => void;
  xuInput: number;
  setXuInput: (val: number) => void;
  tolInput: number;
  setTolInput: (val: number) => void;
  maxIterInput: number;
  setMaxIterInput: (val: number) => void;
  onApply: () => void;
  bracketValid: boolean;
  bracketMessage?: string;
  errorMessage?: string;
}

export const RootFindingControl: React.FC<RootFindingControlProps> = ({
  method,
  presets,
  exprInput,
  setExprInput,
  xlInput,
  setXlInput,
  xuInput,
  setXuInput,
  tolInput,
  setTolInput,
  maxIterInput,
  setMaxIterInput,
  onApply,
  bracketValid,
  bracketMessage,
  errorMessage,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const applyPreset = (p: RootFindingPreset) => {
    setExprInput(p.expr);
    setXlInput(p.defaultXl);
    setXuInput(p.defaultXu);
  };

  return (
    <div className="bg-[#121215] rounded-2xl border border-white/10 shadow-xl p-5 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>{method === 'bisection' ? 'Bisection Setup' : 'False Position Setup'}</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Algorithm Rule</span>
        </button>
      </div>

      {showHelp && (
        <div className="p-3 bg-black/50 rounded-xl text-xs text-stone-300 border border-white/10 space-y-1">
          <p className="font-semibold text-white">
            {method === 'bisection' ? 'Bisection (Interval Halving):' : 'False Position (Regula Falsi):'}
          </p>
          <p className="text-stone-400">
            {method === 'bisection'
              ? 'Finds root by iteratively cutting the interval [xl, xu] exactly in half. Guaranteed to converge if f(xl)*f(xu) < 0.'
              : 'Draws a secant line between (xl, f(xl)) and (xu, f(xu)) and uses its x-intercept. Faster than bisection for many functions.'}
          </p>
        </div>
      )}

      {/* Classroom Quick Presets */}
      <div>
        <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
          Classroom Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all cursor-pointer ${
                exprInput === p.expr
                  ? 'bg-[#800020] text-white border border-[#800020]/60 shadow-md shadow-[#800020]/30'
                  : 'bg-white/5 text-stone-300 border border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Function <MathView math="f(x)" />
          </label>
          <input
            type="text"
            value={exprInput}
            onChange={(e) => setExprInput(e.target.value)}
            placeholder="e.g. x^3 - x - 2"
            className="w-full px-3.5 py-2 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white placeholder:text-stone-600 transition"
            required
          />
        </div>

        {/* Bracket Bounds Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Lower Bound <MathView math="x_l" />
            </label>
            <input
              type="number"
              step="any"
              value={xlInput}
              onChange={(e) => setXlInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Upper Bound <MathView math="x_u" />
            </label>
            <input
              type="number"
              step="any"
              value={xuInput}
              onChange={(e) => setXuInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>
        </div>

        {/* Stopping Criteria Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Error Tol <MathView math="\varepsilon_s\ (%)" />
            </label>
            <input
              type="number"
              step="any"
              min="0.0000001"
              value={tolInput}
              onChange={(e) => setTolInput(parseFloat(e.target.value) || 0.001)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Max Iterations
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxIterInput}
              onChange={(e) => setMaxIterInput(parseInt(e.target.value) || 20)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>
        </div>

        {/* Bracket Warning / Validation */}
        {!bracketValid && bracketMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">{bracketMessage}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-mono font-medium text-xs text-white bg-[#800020] hover:bg-[#9a0027] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#800020]/60 shadow-lg shadow-[#800020]/25 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Solve &amp; Initialize Iteration 1</span>
        </button>
      </form>
    </div>
  );
};
