'use client';

import React, { useState } from 'react';
import { Play, HelpCircle, AlertCircle, Sparkles, Orbit } from 'lucide-react';
import { MathView } from './MathView';
import { MullerPreset } from '@/lib/openMethods';

interface MullerControlProps {
  presets: MullerPreset[];
  exprFInput: string;
  setExprFInput: (val: string) => void;
  x0Input: number;
  setX0Input: (val: number) => void;
  x1Input: number;
  setX1Input: (val: number) => void;
  x2Input: number;
  setX2Input: (val: number) => void;
  tolInput: number;
  setTolInput: (val: number) => void;
  maxIterInput: number;
  setMaxIterInput: (val: number) => void;
  onApply: () => void;
  errorMessage?: string;
  warningMessage?: string;
}

export const MullerControl: React.FC<MullerControlProps> = ({
  presets,
  exprFInput,
  setExprFInput,
  x0Input,
  setX0Input,
  x1Input,
  setX1Input,
  x2Input,
  setX2Input,
  tolInput,
  setTolInput,
  maxIterInput,
  setMaxIterInput,
  onApply,
  errorMessage,
  warningMessage,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const applyPreset = (p: MullerPreset) => {
    setExprFInput(p.expr);
    setX0Input(p.defaultX0);
    setX1Input(p.defaultX1);
    setX2Input(p.defaultX2);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
          <span>Muller's Method Setup</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Parabola Rule</span>
        </button>
      </div>

      {/* Help Popover */}
      {showHelp && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2 text-stone-800 animate-fadeIn">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Orbit className="w-4 h-4 text-amber-600" />
            <span>Three-Point Parabolic Fitting</span>
          </div>
          <p className="leading-relaxed">
            Muller's Method fits a quadratic parabola through 3 points <MathView math="(x_0, f_0), (x_1, f_1), (x_2, f_2)" />:
          </p>
          <div className="p-2 bg-white rounded-lg border border-amber-200 text-center font-serif text-xs text-[#800020] font-bold">
            <MathView math="P(x) = a(x - x_2)^2 + b(x - x_2) + c" />
          </div>
          <p className="leading-relaxed">
            The next estimate is the intersection of this parabola with the x-axis:
          </p>
          <div className="p-2 bg-white rounded-lg border border-amber-200 text-center font-serif text-xs text-[#800020] font-bold">
            <MathView math="x_3 = x_2 - \frac{2c}{b \pm \sqrt{b^2 - 4ac}}" />
          </div>
          <p className="text-[11px] text-stone-600">
            <strong>Unique Power:</strong> The discriminant <MathView math="b^2 - 4ac" /> can be negative, allowing Muller's method to discover <em>complex conjugate roots</em> even with real starting guesses! Convergence order is <MathView math="\approx 1.84" />.
          </p>
        </div>
      )}

      {/* Presets */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Textbook Presets
        </label>
        <select
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            if (presets[idx]) applyPreset(presets[idx]);
          }}
          className="w-full px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-800 cursor-pointer"
          defaultValue="0"
        >
          {presets.map((p, idx) => (
            <option key={idx} value={idx}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs Form */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Function <MathView math="f(x)" />
          </label>
          <input
            type="text"
            value={exprFInput}
            onChange={(e) => setExprFInput(e.target.value)}
            placeholder="e.g. x^3 - 13*x - 12"
            className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
          />
        </div>

        {/* 3 Guesses: x0, x1, x2 */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Guess <MathView math="x_0" />
            </label>
            <input
              type="number"
              step="any"
              value={x0Input}
              onChange={(e) => setX0Input(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Guess <MathView math="x_1" />
            </label>
            <input
              type="number"
              step="any"
              value={x1Input}
              onChange={(e) => setX1Input(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Guess <MathView math="x_2" />
            </label>
            <input
              type="number"
              step="any"
              value={x2Input}
              onChange={(e) => setX2Input(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Tolerance <MathView math="\varepsilon_a\ (\%)" />
            </label>
            <input
              type="number"
              step="0.00001"
              min="0.000001"
              max="10"
              value={tolInput}
              onChange={(e) => setTolInput(parseFloat(e.target.value) || 0.0001)}
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Max Iterations
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxIterInput}
              onChange={(e) => setMaxIterInput(parseInt(e.target.value) || 20)}
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-stone-900"
            />
          </div>
        </div>

        {/* Error / Warning Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {warningMessage && !errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{warningMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onApply}
          className="w-full py-2.5 px-4 bg-[#800020] hover:bg-[#6b001b] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#800020]/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Apply &amp; Plot Muller's Method</span>
        </button>
      </div>
    </div>
  );
};
