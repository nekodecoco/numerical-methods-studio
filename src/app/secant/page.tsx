'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { SecantControl } from '@/components/SecantControl';
import { SecantPlot } from '@/components/SecantPlot';
import { SecantTable } from '@/components/SecantTable';
import { RootFindingActionBar } from '@/components/RootFindingActionBar';
import { MathView } from '@/components/MathView';
import {
  solveSecant,
  SecantStep,
  SECANT_PRESETS,
} from '@/lib/openMethods';
import { Spline, Lightbulb, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { formatNum } from '@/lib/taylor';

export default function SecantPage() {
  // Input form state
  const [exprFInput, setExprFInput] = useState<string>('x^3 - x - 2');
  const [x0Input, setX0Input] = useState<number>(1);
  const [x1Input, setX1Input] = useState<number>(2);
  const [tolInput, setTolInput] = useState<number>(0.0001); // 0.0001%
  const [maxIterInput, setMaxIterInput] = useState<number>(20);

  // Active plotted state
  const [activeExprF, setActiveExprF] = useState<string>('x^3 - x - 2');
  const [activeX0, setActiveX0] = useState<number>(1);
  const [activeX1, setActiveX1] = useState<number>(2);
  const [evalF, setEvalF] = useState<(x: number) => number>(() => (x: number) => x * x * x - x - 2);

  // Model & computation state
  const [steps, setSteps] = useState<SecantStep[]>([]);
  const [currentIter, setCurrentIter] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
  const [converged, setConverged] = useState<boolean>(false);
  const [diverged, setDiverged] = useState<boolean>(false);

  const handleApply = useCallback(() => {
    const res = solveSecant(
      exprFInput,
      x0Input,
      x1Input,
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
      setActiveX1(x1Input);
      setEvalF(() => res.evalF);
      setSteps(res.steps);
      setCurrentIter(1);
      setConverged(res.converged);
      setDiverged(res.diverged);
    }
  }, [exprFInput, x0Input, x1Input, tolInput, maxIterInput]);

  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = steps[currentIter - 1] || null;
  const finalRoot = steps.length > 0 ? steps[steps.length - 1].xNext : activeX1;
  const finalEa = steps.length > 0 ? steps[steps.length - 1].ea : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                Open Method
              </span>
              <span className="text-xs text-stone-500 font-mono">Secant Projection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Secant Method Visualizer
            </h1>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Connect two points on the function curve with a secant line and project its x-intercept to find the next root estimate with superlinear convergence (<MathView math="p \approx 1.618" />) without requiring analytic differentiation.
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs hidden md:block relative z-10">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-semibold mb-1">
              Secant Difference Quotient
            </div>
            <div className="text-white text-sm font-bold flex items-center gap-2 font-serif">
              <MathView math="x_{i+1} = x_i - f(x_i) \frac{x_i - x_{i-1}}{f(x_i) - f(x_{i-1})}" block={false} className="text-cyan-300" />
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6">
            <SecantControl
              presets={SECANT_PRESETS}
              exprFInput={exprFInput}
              setExprFInput={setExprFInput}
              x0Input={x0Input}
              setX0Input={setX0Input}
              x1Input={x1Input}
              setX1Input={setX1Input}
              tolInput={tolInput}
              setTolInput={setTolInput}
              maxIterInput={maxIterInput}
              setMaxIterInput={setMaxIterInput}
              onApply={handleApply}
              errorMessage={errorMessage}
              warningMessage={warningMessage}
            />

            {/* Educational Insight Card */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>Secant vs. False Position</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                While both use a secant line through two points, <strong className="text-stone-200">False Position</strong> is a bracketing method that strictly maintains <MathView math="f(a)f(b) < 0" />.
              </p>
              <p className="text-xs text-stone-400 leading-relaxed">
                The <strong className="text-cyan-300">Secant Method</strong> replaces the oldest point regardless of sign, achieving superlinear speed (<MathView math="\approx 1.618" />) similar to Newton-Raphson, but requires only <em>one</em> new function evaluation per step!
              </p>
            </div>
          </div>

          {/* Plot, Action Bar & Table Column */}
          <div className="lg:col-span-8 space-y-6">
            <SecantPlot
              exprFStr={activeExprF}
              evalF={evalF}
              steps={steps}
              currentIter={currentIter}
              initialX0={activeX0}
              initialX1={activeX1}
            />

            <RootFindingActionBar
              method="secant"
              currentIter={currentIter}
              totalSteps={steps.length}
              converged={converged}
              onNext={() => setCurrentIter((prev) => Math.min(prev + 1, steps.length))}
              onPrev={() => setCurrentIter((prev) => Math.max(prev - 1, 1))}
              onReset={() => setCurrentIter(1)}
              onSetIter={(iter) => setCurrentIter(iter)}
              xr={currentStep ? currentStep.xNext : finalRoot}
              ea={currentStep ? currentStep.ea : null}
            />

            {/* Convergence Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#121215] rounded-xl border border-white/10 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 font-mono block">
                  Root Estimate
                </span>
                <span className="text-lg font-bold font-mono text-cyan-300 mt-0.5 block">
                  x* ≈ {formatNum(finalRoot, 6)}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  f(x*) ≈ {formatNum(evalF(finalRoot), 6)}
                </span>
              </div>

              <div className="bg-[#121215] rounded-xl border border-white/10 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 font-mono block">
                  Total Steps / Status
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {converged ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        Converged in {steps.length} steps
                      </span>
                    </>
                  ) : diverged ? (
                    <span className="text-sm font-bold text-rose-400 font-mono">
                      Diverged / Exceeded Bounds
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-stone-300 font-mono">
                      {steps.length} steps computed
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500 font-mono">
                  Tolerance: &le; {tolInput}%
                </span>
              </div>

              <div className="bg-[#121215] rounded-xl border border-white/10 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 font-mono block">
                  Final Relative Error
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                  {finalEa !== null
                    ? finalEa < 0.0001
                      ? finalEa.toExponential(3) + '%'
                      : finalEa.toFixed(5) + '%'
                    : 'N/A'}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Order &phi; &approx; 1.618
                </span>
              </div>
            </div>

            <SecantTable
              steps={steps}
              currentIter={currentIter}
              onSelectIter={(iter) => setCurrentIter(iter)}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
