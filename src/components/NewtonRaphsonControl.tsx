'use client';

import React, { useState } from 'react';
import { Play, HelpCircle, AlertCircle, Target, Zap } from 'lucide-react';
import { MathView } from './MathView';
import { OpenMethodPreset } from '@/lib/openMethods';

interface NewtonRaphsonControlProps {
  presets: OpenMethodPreset[];
  exprFInput: string;
  setExprFInput: (val: string) => void;
  derivativeLatex: string;
  x0Input: number;
  setX0Input: (val: number) => void;
  tolInput: number;
  setTolInput: (val: number) => void;
  maxIterInput: number;
  setMaxIterInput: (val: number) => void;
  onApply: () => void;
  errorMessage?: string;
  warningMessage?: string;
}

export const NewtonRaphsonControl: React.FC<NewtonRaphsonControlProps> = ({
  presets,
  exprFInput,
  setExprFInput,
  derivativeLatex,
  x0Input,
  setX0Input,
  tolInput,
  setTolInput,
  maxIterInput,
  setMaxIterInput,
  onApply,
  errorMessage,
  warningMessage,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const applyPreset = (p: OpenMethodPreset) => {
    setExprFInput(p.expr);
    setX0Input(p.defaultX0);
  };

  return (
    <div className="bg-[#121215] rounded-2xl border border-white/10 shadow-xl p-5 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Newton-Raphson Setup</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tangent Rule</span>
        </button>
      </div>

      {showHelp && (
        <div className="p-3 bg-black/50 rounded-xl text-xs text-stone-300 border border-white/10 space-y-1">
          <p className="font-semibold text-amber-300">Tangent Extrapolation Principle:</p>
          <p className="text-stone-400">
            Uses the derivative f&apos;(x) to construct the tangent line at the current estimate and follows it to its x-axis intercept. Converges with quadratic order (p = 2) when close to the root.
          </p>
        </div>
      )}

      {/* Presets Bar */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 block">
          Textbook Presets
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-white/10 text-xs transition cursor-pointer flex flex-col gap-0.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                  {p.label}
                </span>
                <span className="text-[10px] font-mono text-stone-400">x₀ = {p.defaultX0}</span>
              </div>
              <p className="text-[11px] text-stone-400 line-clamp-1">{p.description}</p>
              {p.note && (
                <span className="text-[10px] text-amber-300 font-mono">
                  {p.note}
                </span>
              )}
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
        className="space-y-3.5 pt-1"
      >
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Function Expression <span className="font-serif italic text-white">f(x)</span>
          </label>
          <input
            type="text"
            value={exprFInput}
            onChange={(e) => setExprFInput(e.target.value)}
            placeholder="e.g. x^3 - x - 2, exp(-x) - x"
            className="w-full px-3 py-2 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white placeholder:text-stone-600"
            required
          />
        </div>

        {/* Live Symbolic Derivative Display */}
        {derivativeLatex && (
          <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-stone-500 block tracking-wider">
              Computed Symbolic Derivative f&apos;(x)
            </span>
            <div className="text-xs font-mono text-amber-200">
              <MathView math={`f'(x) = ${derivativeLatex}`} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            Initial Guess <span className="font-serif italic text-white">x₀</span>
          </label>
          <input
            type="number"
            step="any"
            value={x0Input}
            onChange={(e) => setX0Input(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white font-medium"
            required
          />
        </div>

        {/* Criteria Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Error Tol <MathView math="\varepsilon_s\ (%)" />
            </label>
            <input
              type="number"
              step="any"
              min="0.00000001"
              value={tolInput}
              onChange={(e) => setTolInput(parseFloat(e.target.value) || 0.0001)}
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
              max="50"
              value={maxIterInput}
              onChange={(e) => setMaxIterInput(parseInt(e.target.value) || 20)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>
        </div>

        {/* Warning Alert */}
        {warningMessage && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>{warningMessage}</div>
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
          <span>Extrapolate Tangents (Iter 1)</span>
        </button>
      </form>
    </div>
  );
};
