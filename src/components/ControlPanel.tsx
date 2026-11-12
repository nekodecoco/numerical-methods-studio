'use client';

import React, { useState } from 'react';
import { Play, AlertCircle, HelpCircle } from 'lucide-react';
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
  maxOrderInput: number;
  setMaxOrderInput: (val: number) => void;
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
  maxOrderInput,
  setMaxOrderInput,
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
    <div className="bg-[#121215] rounded-2xl border border-white/10 shadow-xl p-5 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Function &amp; Expansion Setup</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Syntax Tips</span>
        </button>
      </div>

      {showSyntaxHelp && (
        <div className="p-3 bg-black/50 rounded-xl text-xs text-stone-300 border border-white/10 space-y-1">
          <p className="font-semibold text-white">Supported math.js syntax:</p>
          <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-stone-400">
            <li>Trig: <code className="text-amber-300">sin(x)</code>, <code className="text-amber-300">cos(x)</code>, <code className="text-amber-300">tan(x)</code></li>
            <li>Exponential/Log: <code className="text-amber-300">exp(x)</code> or <code className="text-amber-300">e^x</code>, <code className="text-amber-300">log(x)</code></li>
            <li>Powers/Roots: <code className="text-amber-300">x^3 - 2*x</code>, <code className="text-amber-300">sqrt(1 + x)</code></li>
            <li>Rational: <code className="text-amber-300">1 / (1 + x^2)</code></li>
          </ul>
        </div>
      )}

      {/* Classroom Quick Presets */}
      <div>
        <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
          Classroom Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
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
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Function <MathView math="f(x)" />
          </label>
          <div className="relative">
            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              placeholder="e.g. sin(x), exp(x), 1/(1+x^2)"
              className="w-full px-3.5 py-2 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white placeholder:text-stone-600 transition"
              required
            />
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Center <MathView math="a" />
            </label>
            <input
              type="number"
              step="any"
              value={aInput}
              onChange={(e) => setAInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Range <MathView math="x_{min}" />
            </label>
            <input
              type="number"
              step="any"
              value={xMinInput}
              onChange={(e) => setXMinInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Range <MathView math="x_{max}" />
            </label>
            <input
              type="number"
              step="any"
              value={xMaxInput}
              onChange={(e) => setXMaxInput(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Max Order <MathView math="N" />
            </label>
            <input
              type="number"
              min="1"
              max="25"
              step="1"
              value={maxOrderInput}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setMaxOrderInput(Math.min(25, Math.max(1, val)));
              }}
              title="Maximum Taylor approximation order (up to 25)"
              className="w-full px-2.5 py-1.5 text-sm font-mono bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-amber-300 font-bold"
              required
            />
          </div>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Start / Plot Button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-mono font-medium text-xs text-white bg-[#800020] hover:bg-[#9a0027] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#800020]/60 shadow-lg shadow-[#800020]/25 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Plot &amp; Initialize (Order 0)</span>
        </button>
      </form>
    </div>
  );
};
