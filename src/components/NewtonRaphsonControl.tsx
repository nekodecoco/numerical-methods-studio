'use client';

import React, { useState } from 'react';
import { Play, HelpCircle, AlertCircle, Sparkles, Target, Zap } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
          <span>Newton-Raphson Setup</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tangent Rule</span>
        </button>
      </div>

      {/* Help Popover */}
      {showHelp && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2 text-stone-800 animate-fadeIn">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Tangent Line Projection Formula</span>
          </div>
          <p className="leading-relaxed">
            Newton-Raphson extrapolates the tangent line from <MathView math="(x_i, f(x_i))" /> with slope <MathView math="f'(x_i)" /> to find where it strikes the x-axis:
          </p>
          <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-center font-serif text-sm text-[#800020] font-bold">
            <MathView math="x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}" />
          </div>
          <p className="text-[11px] text-stone-600">
            <strong>Quadratic Convergence:</strong> Once near a simple root, the number of accurate decimal digits approximately doubles each iteration!
          </p>
        </div>
      )}

      {/* Presets Bar */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
          Textbook Presets
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left px-3 py-2 rounded-xl border border-stone-200 hover:border-[#800020]/40 hover:bg-stone-50 text-xs transition cursor-pointer flex flex-col gap-0.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 group-hover:text-[#800020] transition-colors">
                  {p.label}
                </span>
                <span className="text-[10px] font-mono text-stone-400">x₀ = {p.defaultX0}</span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1">{p.description}</p>
              {p.note && (
                <span className="text-[10px] text-amber-800 font-mono font-medium">
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
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Function Expression <span className="font-serif">f(x)</span>
          </label>
          <input
            type="text"
            value={exprFInput}
            onChange={(e) => setExprFInput(e.target.value)}
            placeholder="e.g. x^3 - x - 2, exp(-x) - x"
            className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
            required
          />
        </div>

        {/* Live Symbolic Derivative Display */}
        {derivativeLatex && (
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Computed Symbolic Derivative f&apos;(x)
            </span>
            <div className="text-xs font-serif text-[#800020]">
              <MathView math={`f'(x) = ${derivativeLatex}`} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            Initial Guess <span className="font-serif">x_0</span>
          </label>
          <input
            type="number"
            step="any"
            value={x0Input}
            onChange={(e) => setX0Input(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-900 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Stopping Tol <span className="font-serif">ε_s (%)</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.0000001"
              value={tolInput}
              onChange={(e) => setTolInput(parseFloat(e.target.value) || 0.0001)}
              className="w-full px-3 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Max Iterations <span className="font-serif">N</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={maxIterInput}
              onChange={(e) => setMaxIterInput(parseInt(e.target.value) || 20)}
              className="w-full px-3 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              required
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Input Error</span>
            </div>
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Warning Alert */}
        {warningMessage && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Pitfall Alert</span>
            </div>
            <p className="text-[11px] leading-relaxed">{warningMessage}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-[#800020] hover:bg-[#6b001b] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#800020]/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Initialize &amp; Trace Tangent</span>
        </button>
      </form>
    </div>
  );
};
