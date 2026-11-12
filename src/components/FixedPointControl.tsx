'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Wand2,
  Check,
  ChevronDown
} from 'lucide-react';
import { MathView } from './MathView';
import {
  FixedPointCandidateG,
  FixedPointProblem,
  evaluateCandidateG,
  FIXED_POINT_PROBLEMS,
} from '@/lib/openMethods';

export interface FixedPointControlProps {
  problems?: FixedPointProblem[];
  selectedProblemId: string;
  setSelectedProblemId: (id: string) => void;
  customFInput: string;
  setCustomFInput: (val: string) => void;
  onGenerateCustomCandidates: () => void;
  candidates: FixedPointCandidateG[];
  selectedCandidateId: string | null;
  onSelectCandidate: (cand: FixedPointCandidateG) => void;
  exprGInput: string;
  setExprGInput: (val: string) => void;
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

export const FixedPointControl: React.FC<FixedPointControlProps> = ({
  problems = FIXED_POINT_PROBLEMS,
  selectedProblemId,
  setSelectedProblemId,
  customFInput,
  setCustomFInput,
  onGenerateCustomCandidates,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  exprGInput,
  setExprGInput,
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

  // Active problem definition
  const currentProblem = useMemo(() => {
    return problems.find((p) => p.id === selectedProblemId) || null;
  }, [problems, selectedProblemId]);

  // Live evaluation of the current active input g(x) at x0
  const activeInputEval = useMemo(() => {
    if (!exprGInput.trim()) return null;
    return evaluateCandidateG(exprGInput, x0Input);
  }, [exprGInput, x0Input]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
          <span>Fixed Point / Position Setup</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Convergence Rule</span>
        </button>
      </div>

      {/* Help Popover */}
      {showHelp && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2 text-stone-800 animate-fadeIn">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>The Fixed Point Convergence Theorem</span>
          </div>
          <p className="leading-relaxed">
            To solve an equation <MathView math="f(x) = 0" />, we algebraically isolate <MathView math="x" /> into the form <MathView math="x = g(x)" />.
            A given equation can be rewritten into several different <MathView math="g(x)" /> functions, but only contractive forms will converge!
          </p>
          <div className="p-2.5 bg-white rounded-lg border border-amber-200 font-mono text-[11px] space-y-1.5">
            <div className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Converges if |g&apos;(x)| &lt; 1 near root (Contractive Mapping)</span>
            </div>
            <div className="text-red-700 font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>Diverges if |g&apos;(x)| &gt; 1 near root (Expansive Mapping)</span>
            </div>
            <div className="text-stone-600 text-[10px] pl-5">
              • 0 &lt; g&apos;(x) &lt; 1: Monotonic staircase cobweb approach<br />
              • -1 &lt; g&apos;(x) &lt; 0: Oscillating alternating spiral cobweb approach
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Target Equation Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#800020]" />
            <span>Target Equation f(x) = 0</span>
          </span>
          <span className="text-[10px] text-stone-400 font-normal">Step 1</span>
        </label>

        <div className="relative">
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            className="w-full px-3 py-2 pr-8 text-xs font-medium bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-800 cursor-pointer appearance-none"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">✏️ Custom Equation f(x) = 0...</option>
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Selected Problem Description & Formula */}
        {currentProblem && selectedProblemId !== 'custom' && (
          <div className="p-2.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-stone-900">
                <MathView math={`f(x) = ${currentProblem.equationMath}`} />
              </span>
              {currentProblem.expectedRoots && (
                <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  Root(s): {currentProblem.expectedRoots.join(', ')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {currentProblem.description}
            </p>
          </div>
        )}

        {/* Custom Equation Input Mode */}
        {selectedProblemId === 'custom' && (
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-900">
              Enter Custom Equation f(x) = 0
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFInput}
                onChange={(e) => setCustomFInput(e.target.value)}
                placeholder="e.g. x^2 - 4*x + 3 = 0"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
              />
              <button
                type="button"
                onClick={onGenerateCustomCandidates}
                className="px-3 py-1.5 bg-[#800020] text-white rounded-lg text-xs font-medium hover:bg-[#6b001b] transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Find g(x)</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              Enter expression equal to zero. The solver will automatically isolate terms and evaluate contractive convergence.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Selecting Stage - All Possible g(x) Options */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#800020]" />
            <span>Possible g(x) Rearrangements</span>
          </label>
          <span className="text-[10px] text-amber-800 font-mono bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
            Evaluated at x₀ = {x0Input}
          </span>
        </div>

        <p className="text-[11px] text-stone-500 leading-snug">
          Click any rearrangement below to select it and immediately trace its cobweb diagram:
        </p>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {candidates.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              No g(x) candidates generated yet. Enter an expression above.
            </div>
          ) : (
            candidates.map((cand) => {
              // Dynamic live convergence evaluation at the user's current x0
              const evalRes = evaluateCandidateG(cand.expr, x0Input);
              const isSelected =
                selectedCandidateId === cand.id || exprGInput.trim() === cand.expr.trim();

              return (
                <div
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 relative ${
                    isSelected
                      ? 'border-[#800020] bg-[#800020]/5 ring-2 ring-[#800020]/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/80 bg-white'
                  }`}
                >
                  {/* Card Header & Convergence Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900 line-clamp-1 flex items-center gap-1.5">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#800020] flex-shrink-0" />
                      )}
                      <span>{cand.label}</span>
                    </span>

                    {/* Convergence Pill */}
                    {evalRes.status === 'converges' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Converges (|g&apos;| = {evalRes.absGPrime.toFixed(3)})</span>
                      </span>
                    )}
                    {evalRes.status === 'diverges' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex-shrink-0">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>Diverges (|g&apos;| = {evalRes.absGPrime.toFixed(3)})</span>
                      </span>
                    )}
                    {evalRes.status === 'inconclusive' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Borderline (|g&apos;| ≈ 1)</span>
                      </span>
                    )}
                    {evalRes.status === 'invalid' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200 flex-shrink-0">
                        <AlertCircle className="w-3 h-3 text-stone-400" />
                        <span>Undefined at x₀</span>
                      </span>
                    )}
                  </div>

                  {/* Mathematical Expression */}
                  <div className="bg-white/80 px-2.5 py-1.5 rounded-lg border border-stone-200/60 font-serif text-sm text-stone-900 flex items-center justify-between">
                    <div>
                      <MathView math={`x = g(x) = ${cand.latex || cand.expr}`} block={false} />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-sans font-bold text-[#800020] uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  {/* Derivation Step & First Derivative */}
                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-stone-500">
                      <span className="font-semibold text-stone-700">Rearrangement:</span>
                      <span className="font-mono">{cand.derivation}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-serif italic font-bold text-stone-800">
                        <MathView math={`g'(x) = ${evalRes.derivativeLatex}`} block={false} />
                      </span>
                    </div>
                  </div>

                  {/* Trajectory Behavior Note */}
                  <div className="text-[10px] font-medium leading-relaxed pt-0.5">
                    {evalRes.status === 'converges' ? (
                      <span className="text-emerald-700 font-medium">
                        ✓ {evalRes.behaviorNote}
                      </span>
                    ) : evalRes.status === 'diverges' ? (
                      <span className="text-red-700 font-medium">
                        ⚠ {evalRes.behaviorNote}
                      </span>
                    ) : (
                      <span className="text-stone-500">
                        {evalRes.behaviorNote}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Step 3: Active Input & Tuning Parameters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
        className="space-y-3.5 pt-2 border-t border-stone-200"
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">
              Active Iteration Function <span className="font-serif">g(x)</span>
            </label>
            {activeInputEval && activeInputEval.status === 'converges' && (
              <span className="text-[10px] font-bold text-emerald-700">
                ✓ Contractive (|g&apos;| &lt; 1)
              </span>
            )}
            {activeInputEval && activeInputEval.status === 'diverges' && (
              <span className="text-[10px] font-bold text-red-600">
                ⚠ Expansive (|g&apos;| &gt; 1)
              </span>
            )}
          </div>
          <input
            type="text"
            value={exprGInput}
            onChange={(e) => setExprGInput(e.target.value)}
            placeholder="e.g. sqrt(x + 2), exp(-x), cos(x)"
            className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-stone-900"
            required
          />

          {/* Live derivative inspection for active formula */}
          {activeInputEval && (
            <div className="mt-1 px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
              <span>
                <span className="font-bold text-stone-700 font-serif">g&apos;(x)</span> = <MathView math={activeInputEval.derivativeLatex} block={false} />
              </span>
              <span className="font-mono font-medium text-stone-700">
                |g&apos;({x0Input})| = {isNaN(activeInputEval.absGPrime) ? 'NaN' : activeInputEval.absGPrime.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Initial Guess x₀</span>
            </span>
            <span className="text-[10px] text-stone-400 font-normal">
              Updating x₀ re-evaluates all candidate slopes
            </span>
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
              <span>Divergence / Behavior Alert</span>
            </div>
            <p className="text-[11px] leading-relaxed">{warningMessage}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-[#800020] hover:bg-[#6b001b] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#800020]/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Initialize &amp; Trace Cobweb</span>
        </button>
      </form>
    </div>
  );
};
