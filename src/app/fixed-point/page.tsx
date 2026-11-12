'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { FixedPointControl } from '@/components/FixedPointControl';
import { FixedPointPlot } from '@/components/FixedPointPlot';
import { FixedPointTable } from '@/components/FixedPointTable';
import { RootFindingActionBar } from '@/components/RootFindingActionBar';
import { MathView } from '@/components/MathView';
import {
  solveFixedPoint,
  FixedPointStep,
  FixedPointProblem,
  FixedPointCandidateG,
  FIXED_POINT_PROBLEMS,
  autoGenerateCandidateGs,
} from '@/lib/openMethods';
import { Target, Lightbulb } from 'lucide-react';

export default function FixedPointPage() {
  // Equation & Candidate Selection State
  const [selectedProblemId, setSelectedProblemId] = useState<string>('quadratic');
  const [candidates, setCandidates] = useState<FixedPointCandidateG[]>(
    FIXED_POINT_PROBLEMS[0].candidates
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    FIXED_POINT_PROBLEMS[0].candidates[0].id
  );
  const [customFInput, setCustomFInput] = useState<string>('x^2 - 4*x + 3');

  // Input form state
  const [exprGInput, setExprGInput] = useState<string>(
    FIXED_POINT_PROBLEMS[0].candidates[0].expr
  );
  const [x0Input, setX0Input] = useState<number>(
    FIXED_POINT_PROBLEMS[0].defaultX0
  );
  const [tolInput, setTolInput] = useState<number>(0.0001); // 0.0001%
  const [maxIterInput, setMaxIterInput] = useState<number>(20);

  // Active plotted state
  const [activeExprG, setActiveExprG] = useState<string>(
    FIXED_POINT_PROBLEMS[0].candidates[0].expr
  );
  const [activeX0, setActiveX0] = useState<number>(
    FIXED_POINT_PROBLEMS[0].defaultX0
  );
  const [evalG, setEvalG] = useState<(x: number) => number>(
    () => (x: number) => Math.sqrt(x + 2)
  );
  const [latexG, setLatexG] = useState<string>('\\sqrt{x + 2}');
  const [latexGPrime, setLatexGPrime] = useState<string>('\\frac{1}{2\\sqrt{x + 2}}');

  // Model & computation state
  const [steps, setSteps] = useState<FixedPointStep[]>([]);
  const [currentIter, setCurrentIter] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
  const [converged, setConverged] = useState<boolean>(false);
  const [diverged, setDiverged] = useState<boolean>(false);

  const executeSolve = useCallback(
    (gStr: string, x0Val: number, maxIterVal: number, tolVal: number) => {
      const res = solveFixedPoint(gStr, x0Val, maxIterVal, tolVal);

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      setErrorMessage(undefined);
      setWarningMessage(res.warning);

      if (res.steps.length > 0) {
        setActiveExprG(gStr);
        setActiveX0(x0Val);
        setEvalG(() => res.evalG);
        setLatexG(res.originalLatex);
        setLatexGPrime(res.derivativeLatex);
        setSteps(res.steps);
        setCurrentIter(1);
        setConverged(res.converged);
        setDiverged(res.diverged);
      }
    },
    []
  );

  const handleApply = useCallback(() => {
    executeSolve(exprGInput, x0Input, maxIterInput, tolInput);
  }, [executeSolve, exprGInput, x0Input, maxIterInput, tolInput]);

  // Handler when selecting a problem from the dropdown
  const handleSelectProblem = useCallback(
    (probId: string) => {
      setSelectedProblemId(probId);

      if (probId === 'custom') {
        const customCandidates = autoGenerateCandidateGs(customFInput, x0Input);
        setCandidates(customCandidates);
        if (customCandidates.length > 0) {
          const first = customCandidates[0];
          setSelectedCandidateId(first.id);
          setExprGInput(first.expr);
          executeSolve(first.expr, x0Input, maxIterInput, tolInput);
        }
      } else {
        const found = FIXED_POINT_PROBLEMS.find((p) => p.id === probId);
        if (found) {
          setCandidates(found.candidates);
          const firstCand = found.candidates[0];
          setSelectedCandidateId(firstCand.id);
          const targetX0 = firstCand.defaultX0 ?? found.defaultX0;
          setExprGInput(firstCand.expr);
          setX0Input(targetX0);
          executeSolve(firstCand.expr, targetX0, maxIterInput, tolInput);
        }
      }
    },
    [customFInput, executeSolve, maxIterInput, tolInput, x0Input]
  );

  // Handler when clicking any candidate g(x) card during selecting stage
  const handleSelectCandidate = useCallback(
    (cand: FixedPointCandidateG) => {
      setSelectedCandidateId(cand.id);
      setExprGInput(cand.expr);
      const targetX0 = cand.defaultX0 !== undefined ? cand.defaultX0 : x0Input;
      if (cand.defaultX0 !== undefined) {
        setX0Input(cand.defaultX0);
      }
      executeSolve(cand.expr, targetX0, maxIterInput, tolInput);
    },
    [executeSolve, maxIterInput, tolInput, x0Input]
  );

  // Handler for custom f(x) candidate discovery
  const handleGenerateCustomCandidates = useCallback(() => {
    const customCandidates = autoGenerateCandidateGs(customFInput, x0Input);
    setCandidates(customCandidates);
    if (customCandidates.length > 0) {
      const first = customCandidates[0];
      setSelectedCandidateId(first.id);
      setExprGInput(first.expr);
      executeSolve(first.expr, x0Input, maxIterInput, tolInput);
    }
  }, [customFInput, executeSolve, maxIterInput, tolInput, x0Input]);

  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = steps[currentIter - 1] || null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#800020]/10 text-[#800020] font-semibold border border-[#800020]/15">
                Open Method
              </span>
              <span className="text-xs text-stone-400 font-mono">One-Point Iteration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-sans">
              Fixed-Point Iteration Visualizer
            </h1>
            <p className="text-xs text-stone-600 max-w-2xl">
              Rearrange <span className="font-mono text-stone-800 font-semibold">f(x) = 0</span> into <span className="font-mono text-stone-800 font-semibold">x = g(x)</span>, analyze contractive convergence, and trace cobweb staircase iteration paths.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2 text-xs hidden md:block">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-500 font-semibold mb-0.5">
              Convergence Condition
            </div>
            <div className="text-stone-900 text-sm font-bold flex items-center gap-2">
              <MathView math="|g'(x)| < 1" block={false} />
              <span className="text-xs text-emerald-700 font-mono font-normal">(Contractive)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Controls & Candidate Rearrangements */}
          <div className="lg:col-span-4 space-y-6">
            <FixedPointControl
              problems={FIXED_POINT_PROBLEMS}
              selectedProblemId={selectedProblemId}
              setSelectedProblemId={handleSelectProblem}
              customFInput={customFInput}
              setCustomFInput={setCustomFInput}
              onGenerateCustomCandidates={handleGenerateCustomCandidates}
              candidates={candidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={handleSelectCandidate}
              exprGInput={exprGInput}
              setExprGInput={setExprGInput}
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
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Teaching Takeaways</span>
              </h3>
              <ul className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">1. Multiple Rearrangements:</span>
                  <span>Any equation <MathView math="f(x) = 0" /> can be algebraically rearranged into several different <MathView math="x = g(x)" /> forms. Only forms where <MathView math="|g'(x^*)| < 1" /> will converge!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">2. The Cobweb Diagram:</span>
                  <span>Tracing vertically to <MathView math="y = g(x)" /> evaluates the function; tracing horizontally to <MathView math="y = x" /> carries the output forward as the next input.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">3. Convergence Patterns:</span>
                  <span>If <MathView math="0 < g'(x) < 1" />, steps form a monotonic staircase. If <MathView math="-1 < g'(x) < 0" />, steps form an alternating spiral cobweb!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">4. Divergence:</span>
                  <span>If <MathView math="|g'(x)| > 1" />, the mapping is expansive and steps spiral or shoot away to infinity.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Action Bar, HUD, Plot & Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Action Bar */}
            <RootFindingActionBar
              method="fixed-point"
              currentIter={currentIter}
              totalSteps={steps.length}
              converged={converged}
              onNext={() => setCurrentIter((prev) => Math.min(steps.length, prev + 1))}
              onPrev={() => setCurrentIter((prev) => Math.max(1, prev - 1))}
              onReset={() => setCurrentIter(1)}
              onSetIter={(val) => setCurrentIter(val)}
              xr={currentStep ? currentStep.gxi : activeX0}
              ea={currentStep ? currentStep.ea : null}
            />

            {/* Live Step HUD */}
            {currentStep && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Current Input x_i</span>
                  <span className="text-sm font-mono font-bold text-stone-900">{currentStep.xi.toFixed(5)}</span>
                  <span className="text-[10px] text-stone-400 block">Step {currentStep.iteration} Input</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-300 bg-amber-50/40 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Next Estimate g(x_i)</span>
                  <span className="text-sm font-mono font-bold text-[#800020]">{currentStep.gxi.toFixed(6)}</span>
                  <span className="text-[10px] text-stone-500 block">x_{'{i+1}'} on y=x</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Slope g&apos;(x_i)</span>
                  <span className="text-sm font-mono font-bold text-stone-900">{currentStep.gPrimeXi.toFixed(4)}</span>
                  <span className={`text-[10px] font-bold block ${currentStep.isContractive ? 'text-emerald-700' : 'text-red-600'}`}>
                    {currentStep.isContractive ? '✓ |g\'| < 1 (Contractive)' : '⚠ |g\'| >= 1 (Expansive)'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Rel Error ε_a</span>
                  <span className="text-sm font-mono font-bold text-emerald-700">
                    {currentStep.ea !== null ? `${currentStep.ea.toFixed(4)}%` : 'Initial Step'}
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    {converged && currentIter === steps.length ? '🎯 Converged' : 'In Progress'}
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Plot */}
            <FixedPointPlot
              exprGStr={activeExprG}
              evalG={evalG}
              steps={steps}
              currentIter={currentIter}
              initialX0={activeX0}
            />

            {/* Full Iteration Table */}
            <FixedPointTable
              steps={steps}
              currentIter={currentIter}
              onSelectIter={(i) => setCurrentIter(i)}
              gExpr={activeExprG}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Numerical Methods Studio classroom suite for engineering and mathematics.</p>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Fixed-Point Iteration</span>
            <span>•</span>
            <span>Cobweb Diagram Analysis</span>
            <span>•</span>
            <span>Vercel Deploy Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
