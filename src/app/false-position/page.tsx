'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { RootFindingControl } from '@/components/RootFindingControl';
import { RootFindingPlot } from '@/components/RootFindingPlot';
import { RootFindingActionBar } from '@/components/RootFindingActionBar';
import { RootFindingTable } from '@/components/RootFindingTable';
import { MathView } from '@/components/MathView';
import {
  solveRootFinding,
  RootFindingStep,
  FALSE_POSITION_PRESETS,
} from '@/lib/rootFinding';
import { Split, Lightbulb, AlertTriangle, TrendingDown } from 'lucide-react';

export default function FalsePositionPage() {
  // Input form state
  const [exprInput, setExprInput] = useState<string>('x^3 - x - 2');
  const [xlInput, setXlInput] = useState<number>(1);
  const [xuInput, setXuInput] = useState<number>(2);
  const [tolInput, setTolInput] = useState<number>(0.001); // 0.001%
  const [maxIterInput, setMaxIterInput] = useState<number>(20);

  // Active plotted state
  const [activeExpr, setActiveExpr] = useState<string>('x^3 - x - 2');
  const [activeXl, setActiveXl] = useState<number>(1);
  const [activeXu, setActiveXu] = useState<number>(2);
  const [evalOriginal, setEvalOriginal] = useState<(x: number) => number>(() => (x: number) => x * x * x - x - 2);

  // Model & computation state
  const [steps, setSteps] = useState<RootFindingStep[]>([]);
  const [currentIter, setCurrentIter] = useState<number>(1);
  const [bracketValid, setBracketValid] = useState<boolean>(true);
  const [bracketMessage, setBracketMessage] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [converged, setConverged] = useState<boolean>(false);

  const handleApply = useCallback(() => {
    if (xlInput >= xuInput) {
      setErrorMessage('Lower bound xl must be strictly less than upper bound xu');
      return;
    }

    const res = solveRootFinding(
      'false-position',
      exprInput,
      xlInput,
      xuInput,
      maxIterInput,
      tolInput
    );

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    setErrorMessage(undefined);
    setBracketValid(res.bracketValid);
    setBracketMessage(res.bracketMessage);

    if (res.bracketValid && res.steps.length > 0) {
      setActiveExpr(exprInput);
      setActiveXl(xlInput);
      setActiveXu(xuInput);
      setEvalOriginal(() => res.evalOriginal);
      setSteps(res.steps);
      setCurrentIter(1);
      setConverged(res.converged);
    }
  }, [exprInput, xlInput, xuInput, tolInput, maxIterInput]);

  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = steps[currentIter - 1] || null;
  const prevStep = currentIter > 1 ? steps[currentIter - 2] : null;

  // Detect one-sided stagnation
  const isStagnant = steps.length >= 4 && (
    steps.slice(0, 4).every(s => Math.abs(s.xl - steps[0].xl) < 1e-9) ||
    steps.slice(0, 4).every(s => Math.abs(s.xu - steps[0].xu) < 1e-9)
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                Bracketing Method
              </span>
              <span className="text-xs text-stone-500 font-mono">Regula Falsi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              False Position Method Visualizer
            </h1>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Accelerating root estimates by drawing a straight chord between bracket endpoints while strictly maintaining sign containment.
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs hidden md:block relative z-10">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-semibold mb-1">
              False Position Intercept
            </div>
            <MathView
              math="x_r = \frac{x_l f(x_u) - x_u f(x_l)}{f(x_u) - f(x_l)}"
              block={false}
              className="text-amber-300 font-medium font-serif"
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Control Panel & Concept Card */}
          <div className="lg:col-span-4 space-y-6">
            <RootFindingControl
              method="false-position"
              presets={FALSE_POSITION_PRESETS}
              exprInput={exprInput}
              setExprInput={setExprInput}
              xlInput={xlInput}
              setXlInput={setXlInput}
              xuInput={xuInput}
              setXuInput={setXuInput}
              tolInput={tolInput}
              setTolInput={setTolInput}
              maxIterInput={maxIterInput}
              setMaxIterInput={setMaxIterInput}
              onApply={handleApply}
              bracketValid={bracketValid}
              bracketMessage={bracketMessage}
              errorMessage={errorMessage}
            />

            {/* Stagnation Warning Banner if triggered */}
            {isStagnant && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>One-Sided Stagnation Detected!</span>
                </div>
                <p className="leading-relaxed text-stone-400">
                  Notice how one bracket endpoint remains frozen while the other slowly creeps forward! This occurs when the function exhibits severe curvature, causing the secant chord to consistently underestimate the root.
                </p>
              </div>
            )}

            {/* Teaching Takeaways */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Teaching Takeaways &amp; Comparisons
              </h3>
              <ul className="text-xs text-stone-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-300 font-mono min-w-max">Secant Advantage:</span>
                  <span>
                    Unlike Bisection which blindly cuts at the midpoint, False Position weights the estimate towards the endpoint whose value is closer to zero.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-300 font-mono min-w-max">Linear Functions:</span>
                  <span>
                    If <MathView math="f(x)" /> is linear, False Position finds the exact root in literally <strong>1 iteration</strong>!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-300 font-mono min-w-max">The Classic Trap:</span>
                  <span>
                    Try the <code className="bg-black/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-stone-300 border border-white/10">x^10 - 1</code> preset! High convexity causes one bracket bound to stagnate, making False Position surprisingly slower than Bisection!
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Hero Action Bar, Modern Graph, & Iteration Table */}
          <div className="lg:col-span-8 space-y-6">
            {bracketValid && steps.length > 0 && (
              <>
                <RootFindingActionBar
                  method="false-position"
                  currentIter={currentIter}
                  totalSteps={steps.length}
                  converged={converged}
                  onNext={() => setCurrentIter((prev) => Math.min(steps.length, prev + 1))}
                  onPrev={() => setCurrentIter((prev) => Math.max(1, prev - 1))}
                  onReset={() => setCurrentIter(1)}
                  onSetIter={(iter) => setCurrentIter(iter)}
                  xr={currentStep?.xr || 0}
                  ea={currentStep?.ea ?? null}
                />

                <RootFindingPlot
                  method="false-position"
                  originalExpr={activeExpr}
                  evalOriginal={evalOriginal}
                  currentStep={currentStep}
                  prevStep={prevStep}
                  initialXl={activeXl}
                  initialXu={activeXu}
                />

                <RootFindingTable
                  method="false-position"
                  steps={steps}
                  currentIter={currentIter}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
