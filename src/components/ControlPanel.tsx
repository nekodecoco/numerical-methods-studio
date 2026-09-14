'use client';

import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { MathView } from './MathView';

interface Preset {
  label: string;
  mathDisplay: string;
  expr: string;
  defaultA: number;
  xMin: number;
  xMax: number;
}

const PRESETS: Preset[] = [
  { label: 'Sine', mathDisplay: '\\sin(x)', expr: 'sin(x)', defaultA: 0, xMin: -6, xMax: 6 },
  { label: 'Cosine', mathDisplay: '\\cos(x)', expr: 'cos(x)', defaultA: 0, xMin: -6, xMax: 6 },
  { label: 'Exponential', mathDisplay: 'e^x', expr: 'exp(x)', defaultA: 0, xMin: -4, xMax: 4 },
  { label: 'Runge Function', mathDisplay: '\\frac{1}{1+x^2}', expr: '1/(1 + x^2)', defaultA: 0, xMin: -3, xMax: 3 },
  { label: 'Logarithm', mathDisplay: '\\ln(1+x)', expr: 'log(1 + x)', defaultA: 0, xMin: -0.9, xMax: 3 },
  { label: 'Hyperbolic Sine', mathDisplay: '\\sinh(x)', expr: 'sinh(x)', defaultA: 0, xMin: -4, xMax: 4 },
];

interface ControlPanelProps {
  exprInput: string;
  setExprInput: (val: string) => void;
  aInput: number;
  setAInput: (val: number) => void;
  xMinInput: number;
  setXMinInput: (val: number) => void;
  xMaxInput: number;
  setXMaxInput: (val: number) => void;
  onApply: () => void;
  errorMessage?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  exprInput,
  setExprInput,
  aInput,
  setAInput,
  xMinInput,
  setXMinInput,
  xMaxInput,
  setXMaxInput,
  onApply,
  errorMessage,
}) => {
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

  const applyPreset = (p: Preset) => {
    setExprInput(p.expr);
    setAInput(p.defaultA);
    setXMinInput(p.xMin);
    setXMaxInput(p.xMax);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
          Function & Expansion Setup
        </h2>
        <button
          type="button"
          onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Syntax Tips</span>
        </button>
      </div>

      {showSyntaxHelp && (
        <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-200/70 space-y-1 animate-fadeIn">
          <p className="font-semibold text-stone-700">Supported math.js syntax:</p>
          <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
            <li>Trig: <code className="text-[#800020]">sin(x)</code>, <code className="text-[#800020]">cos(x)</code>, <code className="text-[#800020]">tan(x)</code></li>
            <li>Exponential/Log: <code className="text-[#800020]">exp(x)</code> or <code className="text-[#800020]">e^x</code>, <code className="text-[#800020]">log(x)</code> (natural ln)</li>
            <li>Powers/Roots: <code className="text-[#800020]">x^3 - 2*x</code>, <code className="text-[#800020]">sqrt(1 + x)</code></li>
            <li>Rational: <code className="text-[#800020]">1 / (1 + x^2)</code></li>
          </ul>
        </div>
      )}

      {/* Classroom Quick Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
          Classroom Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
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

      {/* Inputs Form */}
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
          <div className="relative">
            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              placeholder="e.g. sin(x), exp(x), 1/(1+x^2)"
              className="w-full px-3.5 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900 placeholder:text-stone-400 transition"
              required
            />
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Center <MathView math="a" />
            </label>
            <input
              type="number"
              step="any"
              value={aInput}
              onChange={(e) => setAInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Range <MathView math="x_{min}" />
            </label>
            <input
              type="number"
              step="any"
              value={xMinInput}
              onChange={(e) => setXMinInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Range <MathView math="x_{max}" />
            </label>
            <input
              type="number"
              step="any"
              value={xMaxInput}
              onChange={(e) => setXMaxInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              required
            />
          </div>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Start / Plot Button with micro-interaction */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-[#800020] hover:bg-[#6b001b] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#800020]/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Plot & Initialize (Order 0)</span>
        </button>
      </form>
    </div>
  );
};
