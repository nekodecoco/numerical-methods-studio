'use client';

import React, { useState } from 'react';
import { Play, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
          <span>{method === 'bisection' ? 'Bisection Setup' : 'False Position Setup'}</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Algorithm Rule</span>
        </button>
      </div>

      {showHelp && (
        <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-200/70 space-y-1 animate-fadeIn">
          <p className="font-semibold text-stone-800">
            {method === 'bisection' ? 'Bisection (Interval Halving):' : 'False Position (Regula Falsi):'}
          </p>
          <p>
            {method === 'bisection'
              ? 'Calculates midpoint xr = (xl + xu) / 2. If f(xl)*f(xr) < 0, root is on the left half (xu = xr); otherwise root is on the right half (xl = xr). Reduces bracket size by exactly 50% each iteration.'
              : 'Connects (xl, f(xl)) and (xu, f(xu)) with a straight secant line. The root estimate xr is the x-intercept of this chord. While usually faster than Bisection, it can stagnate on highly curved convex functions.'}
          </p>
          <div className="pt-1 text-[11px] font-mono text-[#800020]">
            Required condition: f(xl) * f(xu) &le; 0 (Intermediate Value Theorem)
          </div>
        </div>
      )}

      {/* Classroom Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
          Classroom Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              title={p.description}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                exprInput === p.expr
                  ? 'bg-[#800020] text-white border-[#800020] shadow-sm shadow-[#800020]/20'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
              }`}
            >
              <MathView math={p.mathDisplay} />
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Function <MathView math="f(x)" />
          </label>
          <input
            type="text"
            value={exprInput}
            onChange={(e) => setExprInput(e.target.value)}
            placeholder="e.g. x^3 - x - 2, exp(-x) - x"
            className="w-full px-3.5 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
            required
          />
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Lower <MathView math="x_l" />
            </label>
            <input
              type="number"
              step="any"
              value={xlInput}
              onChange={(e) => setXlInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-stone-900 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Upper <MathView math="x_u" />
            </label>
            <input
              type="number"
              step="any"
              value={xuInput}
              onChange={(e) => setXuInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-stone-900 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Tolerance <MathView math="\epsilon_s" /> (%)
            </label>
            <input
              type="number"
              step="any"
              min="0.000001"
              value={tolInput}
              onChange={(e) => setTolInput(parseFloat(e.target.value) || 0.001)}
              title="Stopping relative error criterion"
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Max Iter <MathView math="N" />
            </label>
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={maxIterInput}
              onChange={(e) => setMaxIterInput(parseInt(e.target.value) || 20)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 text-stone-900 font-bold text-[#800020]"
              required
            />
          </div>
        </div>

        {/* Bracketing Error Warning */}
        {!bracketValid && bracketMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1">
              <span className="font-bold">Invalid Bracketing Interval:</span>
              <p className="leading-relaxed">{bracketMessage}</p>
              <p className="text-[11px] text-amber-700 italic">
                Tip: Choose bounds where the function crosses zero so that one value is positive and the other is negative.
              </p>
            </div>
          </div>
        )}

        {/* Syntax Error */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Apply Button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-[#800020] hover:bg-[#6b001b] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#800020]/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Initialize Root Search</span>
        </button>
      </form>
    </div>
  );
};
