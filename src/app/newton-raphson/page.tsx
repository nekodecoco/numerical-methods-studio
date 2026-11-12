'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { NewtonRaphsonControl } from '@/components/NewtonRaphsonControl';
import { NewtonRaphsonPlot } from '@/components/NewtonRaphsonPlot';
import { NewtonRaphsonTable } from '@/components/NewtonRaphsonTable';
import { RootFindingActionBar } from '@/components/RootFindingActionBar';
import { MathView } from '@/components/MathView';
import {
  solveNewtonRaphson,
  NewtonRaphsonStep,
  NEWTON_RAPHSON_PRESETS,
} from '@/lib/openMethods';
import { Zap, Lightbulb, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

export default function NewtonRaphsonPage() {
  // Input form state
  const [exprFInput, setExprFInput] = useState<string>('x^3 - x - 2');
  const [x0Input, setX0Input] = useState<number>(1);
  const [tolInput, setTolInput] = useState<number>(0.0001); // 0.0001%
  const [maxIterInput, setMaxIterInput] = useState<number>(20);

  // Active plotted state
  const [activeExprF, setActiveExprF] = useState<string>('x^3 - x - 2');
  const [activeX0, setActiveX0] = useState<number>(1);
  const [evalF, setEvalF] = useState<(x: number) => number>(() => (x: number) => x * x * x - x - 2);
  const [latexDerivative, setLatexDerivative] = useState<string>('3x^2 - 1');

  // Model & computation state
  const [steps, setSteps] = useState<NewtonRaphsonStep[]>([]);
  const [currentIter, setCurrentIter] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
  const [converged, setConverged] = useState<boolean>(false);
  const [diverged, setDiverged] = useState<boolean>(false);

  const handleApply = useCallback(() => {
    const res = solveNewtonRaphson(
      exprFInput,
      x0Input,
      maxIterInput,
      tolInput
    );

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    setErrorMessage(undefined);
    setWarningMessage(res.warning);

    if (res.steps.length > 0) {
      setActiveExprF(exprFInput);
      setActiveX0(x0Input);
      setEvalF(() => res.evalF);
      setLatexDerivative(res.derivativeLatex);
      setSteps(res.steps);
      setCurrentIter(1);
      setConverged(res.converged);
      setDiverged(res.diverged);
    }
  }, [exprFInput, x0Input, tolInput, maxIterInput]);

  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = steps[currentIter - 1] || null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Open Method
              </span>
              <span className="text-xs text-stone-500 font-mono">Tangent Projection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Newton-Raphson Method Visualizer
            </h1>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Extrapolate tangent lines from function coordinates to the x-axis with quadratic convergence speed (<span className="font-mono text-stone-200">p = 2</span>).
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs hidden md:block relative z-10">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-semibold mb-1">
              Newton-Raphson Formula · Quadratic
            </div>
            <div className="text-white text-sm font-bold flex items-center gap-2 font-serif">
              <MathView math="x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}" block={false} className="text-amber-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Controls & Guidelines */}
          <div className="lg:col-span-4 space-y-6">
            <NewtonRaphsonControl
              presets={NEWTON_RAPHSON_PRESETS}
              exprFInput={exprFInput}
              setExprFInput={setExprFInput}
              derivativeLatex={latexDerivative}
              x0Input={x0Input}
              setX0Input={setX0Input}
              tolInput={tolInput}
              setTolInput={setTolInput}
              maxIterInput={maxIterInput}
              setMaxIterInput={setMaxIterInput}
              onApply={handleApply}
              errorMessage={errorMessage}
              warningMessage={warningMessage}
            />

            {/* Teaching Takeaways Card */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Teaching Takeaways</span>
              </h3>
              <ul className="text-xs text-stone-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">1. Taylor Series Link:</span>
                  <span>Newton-Raphson is directly derived from a 1st-order Taylor polynomial: <MathView math="f(x_i + \Delta x) \approx f(x_i) + f'(x_i)\Delta x = 0" /> yielding <MathView math="\Delta x = -f(x_i)/f'(x_i)" />.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">2. Quadratic Convergence:</span>
                  <span>Once close to a simple root, the error is proportional to the square of the previous error: <MathView math="E_{t, i+1} \approx C \cdot E_{t, i}^2" />. Decimal accuracy roughly doubles every step!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">3. Zero Slope Pitfall:</span>
                  <span>If <MathView math="f'(x_i) = 0" />, the tangent line is horizontal and never reaches the x-axis, causing division by zero!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">4. Cycling &amp; Inflection Points:</span>
                  <span>Near inflection points or symmetric shapes (like <MathView math="x^3 - 5x" /> with <MathView math="x_0=1" />), iterations can bounce indefinitely between fixed points in a cycle!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Action Bar, HUD, Plot & Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Action Bar */}
            <RootFindingActionBar
              method="newton-raphson"
              currentIter={currentIter}
              totalSteps={steps.length}
              converged={converged}
              onNext={() => setCurrentIter((prev) => Math.min(steps.length, prev + 1))}
              onPrev={() => setCurrentIter((prev) => Math.max(1, prev - 1))}
              onReset={() => setCurrentIter(1)}
              onSetIter={(val) => setCurrentIter(val)}
              xr={currentStep ? currentStep.xNext : activeX0}
              ea={currentStep ? currentStep.ea : null}
            />

            {/* Live Step HUD */}
            {currentStep && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-[#121215] p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Current x_i</span>
                  <span className="text-sm font-mono font-bold text-white">{currentStep.xi.toFixed(5)}</span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">f(xi) = {currentStep.fxi.toFixed(4)}</span>
                </div>

                <div className="bg-[#121215] p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-sky-400 font-mono block">Slope f&apos;(x_i)</span>
                  <span className="text-sm font-mono font-bold text-sky-300">{currentStep.dfxi.toFixed(4)}</span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">Tangent Slope</span>
                </div>

                <div className="bg-[#121215] p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono block">Next Root x_{'{i+1}'}</span>
                  <span className="text-sm font-mono font-bold text-amber-300">{currentStep.xNext.toFixed(6)}</span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">Tangent Intercept</span>
                </div>

                <div className="bg-[#121215] p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Rel Error ε_a</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {currentStep.ea !== null ? `${currentStep.ea.toFixed(4)}%` : 'Initial Step'}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">
                    {converged && currentIter === steps.length ? '🎯 Converged' : 'In Progress'}
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Tangent Plot */}
            <NewtonRaphsonPlot
              exprFStr={activeExprF}
              evalF={evalF}
              steps={steps}
              currentIter={currentIter}
              initialX0={activeX0}
            />

            {/* Full Iteration Table */}
            <NewtonRaphsonTable
              steps={steps}
              currentIter={currentIter}
              onSelectIter={(i) => setCurrentIter(i)}
              exprF={activeExprF}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
