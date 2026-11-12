'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { MullerControl } from '@/components/MullerControl';
import { MullerPlot } from '@/components/MullerPlot';
import { MullerTable } from '@/components/MullerTable';
import { RootFindingActionBar } from '@/components/RootFindingActionBar';
import { MathView } from '@/components/MathView';
import {
  solveMuller,
  MullerStep,
  MULLER_PRESETS,
} from '@/lib/openMethods';
import { Orbit, Lightbulb, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { formatNum } from '@/lib/taylor';

export default function MullerPage() {
  // Input form state
  const [exprFInput, setExprFInput] = useState<string>('x^3 - 13*x - 12');
  const [x0Input, setX0Input] = useState<number>(4.5);
  const [x1Input, setX1Input] = useState<number>(5.5);
  const [x2Input, setX2Input] = useState<number>(5.0);
  const [tolInput, setTolInput] = useState<number>(0.0001); // 0.0001%
  const [maxIterInput, setMaxIterInput] = useState<number>(20);

  // Active plotted state
  const [activeExprF, setActiveExprF] = useState<string>('x^3 - 13*x - 12');
  const [activeX0, setActiveX0] = useState<number>(4.5);
  const [activeX1, setActiveX1] = useState<number>(5.5);
  const [activeX2, setActiveX2] = useState<number>(5.0);
  const [evalF, setEvalF] = useState<(x: number) => number>(() => (x: number) => x * x * x - 13 * x - 12);

  // Model & computation state
  const [steps, setSteps] = useState<MullerStep[]>([]);
  const [currentIter, setCurrentIter] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
  const [converged, setConverged] = useState<boolean>(false);
  const [diverged, setDiverged] = useState<boolean>(false);
  const [isComplex, setIsComplex] = useState<boolean>(false);

  const handleApply = useCallback(() => {
    const res = solveMuller(
      exprFInput,
      x0Input,
      x1Input,
      x2Input,
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
      setActiveX2(x2Input);
      setEvalF(() => res.evalF);
      setSteps(res.steps);
      setCurrentIter(1);
      setConverged(res.converged);
      setDiverged(res.diverged);
      setIsComplex(res.isComplex);
    }
  }, [exprFInput, x0Input, x1Input, x2Input, tolInput, maxIterInput]);

  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = steps[currentIter - 1] || null;
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const finalRootReal = lastStep ? lastStep.x3Real : activeX2;
  const finalRootImag = lastStep && lastStep.isComplex ? lastStep.x3Imag : 0;
  const finalEa = lastStep ? lastStep.ea : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                Open Method
              </span>
              <span className="text-xs text-stone-500 font-mono">Parabolic Interpolation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Muller&apos;s Method Visualizer
            </h1>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Interpolate a quadratic parabola through three points to discover real and complex roots with near-quadratic convergence (<MathView math="p \approx 1.84" />).
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs hidden md:block relative z-10">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-semibold mb-1">
              Parabolic Root Formula
            </div>
            <div className="text-white text-sm font-bold flex items-center gap-2 font-serif">
              <MathView math="x_3 = x_2 - \frac{2c}{b \pm \sqrt{b^2 - 4ac}}" block={false} className="text-indigo-300" />
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6">
            <MullerControl
              presets={MULLER_PRESETS}
              exprFInput={exprFInput}
              setExprFInput={setExprFInput}
              x0Input={x0Input}
              setX0Input={setX0Input}
              x1Input={x1Input}
              setX1Input={setX1Input}
              x2Input={x2Input}
              setX2Input={setX2Input}
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
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span>Why Muller&apos;s Method Excels</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                <strong className="text-stone-200">Parabolic Curvature:</strong> Secant method fits a straight line through 2 points; Muller fits a parabola through 3 points, better matching nonlinear curvature.
              </p>
              <p className="text-xs text-stone-400 leading-relaxed">
                <strong className="text-indigo-300">Complex Roots:</strong> Because the quadratic formula involves <MathView math="\sqrt{b^2 - 4ac}" />, negative discriminants produce imaginary components, enabling Muller&apos;s method to discover complex conjugate roots automatically!
              </p>
            </div>
          </div>

          {/* Plot, Action Bar & Table Column */}
          <div className="lg:col-span-8 space-y-6">
            <MullerPlot
              exprFStr={activeExprF}
              evalF={evalF}
              steps={steps}
              currentIter={currentIter}
              initialX0={activeX0}
              initialX1={activeX1}
              initialX2={activeX2}
            />

            <RootFindingActionBar
              method="mullers"
              currentIter={currentIter}
              totalSteps={steps.length}
              converged={converged}
              onNext={() => setCurrentIter((prev) => Math.min(prev + 1, steps.length))}
              onPrev={() => setCurrentIter((prev) => Math.max(prev - 1, 1))}
              onReset={() => setCurrentIter(1)}
              onSetIter={(iter) => setCurrentIter(iter)}
              xr={currentStep ? currentStep.x3Real : finalRootReal}
              ea={currentStep ? currentStep.ea : null}
            />

            {/* Convergence Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#121215] rounded-xl border border-white/10 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 font-mono block">
                  Root Estimate x*
                </span>
                <span className="text-lg font-bold font-mono text-indigo-300 mt-0.5 block">
                  {isComplex
                    ? `${formatNum(finalRootReal, 4)} ± ${formatNum(finalRootImag, 4)}i`
                    : `x* ≈ ${formatNum(finalRootReal, 6)}`}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  {isComplex
                    ? 'Complex Conjugate Pair'
                    : `f(x*) ≈ ${formatNum(evalF(finalRootReal), 6)}`}
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
                  Order p &approx; 1.84
                </span>
              </div>
            </div>

            <MullerTable
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
