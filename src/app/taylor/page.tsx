'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { buildTaylorSeries, TaylorStep } from '@/lib/taylor';
import { ControlPanel } from '@/components/ControlPanel';
import { TaylorPlot } from '@/components/TaylorPlot';
import { ActionBar } from '@/components/ActionBar';
import { DerivativesLog } from '@/components/DerivativesLog';
import { MathView } from '@/components/MathView';
import { BookOpen, GraduationCap, Info, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export default function Home() {
  // Input form state
  const [exprInput, setExprInput] = useState<string>('sin(x)');
  const [aInput, setAInput] = useState<number>(0);
  const [xMinInput, setXMinInput] = useState<number>(-6);
  const [xMaxInput, setXMaxInput] = useState<number>(6);
  const [maxOrderInput, setMaxOrderInput] = useState<number>(20);

  // Active plotted state
  const [activeExpr, setActiveExpr] = useState<string>('sin(x)');
  const [activeA, setActiveA] = useState<number>(0);
  const [activeXMin, setActiveXMin] = useState<number>(-6);
  const [activeXMax, setActiveXMax] = useState<number>(6);
  const [activeCapOrder, setActiveCapOrder] = useState<number>(20);

  // Model & computation state
  const [steps, setSteps] = useState<TaylorStep[]>([]);
  const [evalOriginal, setEvalOriginal] = useState<(x: number) => number>(() => Math.sin);
  const [originalLatex, setOriginalLatex] = useState<string>('\\sin(x)');
  const [currentOrder, setCurrentOrder] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // Initialize or re-compute Taylor Series on Plot
  const handleApply = useCallback(() => {
    // Validate domain
    if (xMinInput >= xMaxInput) {
      setErrorMessage('x_min must be strictly less than x_max');
      return;
    }

    const cap = Math.min(25, Math.max(1, maxOrderInput));
    const res = buildTaylorSeries(exprInput, aInput, cap);

    if (res.error || res.steps.length === 0) {
      setErrorMessage(res.error || 'Failed to parse or differentiate expression');
      return;
    }

    setErrorMessage(undefined);
    setActiveExpr(exprInput);
    setActiveA(aInput);
    setActiveXMin(xMinInput);
    setActiveXMax(xMaxInput);
    setActiveCapOrder(cap);
    setSteps(res.steps);
    setEvalOriginal(() => res.originalEval);
    setOriginalLatex(res.originalLatex);
    // As required: reset to order 0 initially!
    setCurrentOrder(0);
  }, [exprInput, aInput, xMinInput, xMaxInput, maxOrderInput]);

  // Initial load
  useEffect(() => {
    handleApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealNext = () => {
    if (currentOrder < activeCapOrder && currentOrder < steps.length - 1) {
      setCurrentOrder((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentOrder > 0) {
      setCurrentOrder((prev) => prev - 1);
    }
  };

  const handleSetOrder = (ord: number) => {
    if (ord >= 0 && ord <= activeCapOrder && ord < steps.length) {
      setCurrentOrder(ord);
    }
  };

  const handleReset = () => {
    setCurrentOrder(0);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <NavBar />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Method Banner */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Polynomial Approximation
              </span>
              <span className="text-xs text-stone-500 font-mono">Series Expansion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Taylor Series Visualizer
            </h1>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Polynomial approximations around expansion point <span className="font-mono text-stone-200">x = a</span> with progressive derivative discovery, real-time error bounds, and dynamic plotting.
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs hidden md:block relative z-10">
            <div className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-semibold mb-1">
              General Series Formulation
            </div>
            <MathView math="f(x) \approx \sum_{k=0}^n \frac{f^{(k)}(a)}{k!} (x-a)^k" block={false} className="text-amber-300 font-medium font-serif" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Control Panel & Concept Card */}
          <div className="lg:col-span-4 space-y-6">
            <ControlPanel
              exprInput={exprInput}
              setExprInput={setExprInput}
              aInput={aInput}
              setAInput={setAInput}
              xMinInput={xMinInput}
              setXMinInput={setXMinInput}
              xMaxInput={xMaxInput}
              setXMaxInput={setXMaxInput}
              maxOrderInput={maxOrderInput}
              setMaxOrderInput={setMaxOrderInput}
              onApply={handleApply}
              errorMessage={errorMessage}
            />

            {/* Quick Instructor / Classroom Guide */}
            <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Teaching Takeaways
              </h3>
              <ul className="text-xs text-stone-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">0th Order:</span>
                  <span>Matches only the function value at <MathView math="a" /> (a horizontal line).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">1st Order:</span>
                  <span>Matches the slope <MathView math="f'(a)" /> — this is the classic tangent line approximation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">2nd Order:</span>
                  <span>Matches the concavity/curvature <MathView math="f''(a)" /> via a quadratic osculating parabola.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-300 font-mono">Higher Orders:</span>
                  <span>Widens the domain interval where <MathView math="P_n(x)" /> hugs <MathView math="f(x)" /> tightly.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Hero Action Bar, Modern Graph, & Derivatives Log */}
          <div className="lg:col-span-8 space-y-6">
            {/* Action Bar for Progressive Term Reveal */}
            <ActionBar
              currentOrder={currentOrder}
              maxAvailableOrder={steps.length > 0 ? steps.length - 1 : 0}
              capOrder={activeCapOrder}
              onRevealNext={handleRevealNext}
              onStepBack={handleStepBack}
              onSetOrder={handleSetOrder}
              onReset={handleReset}
            />

            {/* Modern High-Impact Plot */}
            <TaylorPlot
              originalExpr={activeExpr}
              evalOriginal={evalOriginal}
              steps={steps}
              currentOrder={currentOrder}
              a={activeA}
              xMin={activeXMin}
              xMax={activeXMax}
            />

            {/* Step-by-Step Derivative & Polynomial Log */}
            <DerivativesLog
              steps={steps}
              currentOrder={currentOrder}
              capOrder={activeCapOrder}
              a={activeA}
              originalLatex={originalLatex}
              evalOriginal={evalOriginal}
              originalExpr={activeExpr}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
