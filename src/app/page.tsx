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
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col">
      {/* Top Academic Navigation Bar */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] text-white flex items-center justify-center shadow-md shadow-[#800020]/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-950 font-serif">
                  Taylor Series Visualizer
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] border border-[#800020]/20 hidden sm:inline-block">
                  Numerical Methods
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Interactive polynomial approximation &amp; progressive derivative discovery
              </p>
            </div>
          </div>

          {/* Quick Theory Pill & Tutorial Link */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
              <BookOpen className="w-3.5 h-3.5 text-[#800020]" />
              <MathView math="f(x) \approx \sum_{k=0}^n \frac{f^{(k)}(a)}{k!} (x-a)^k" />
            </div>

            <Link
              href="/tutorial"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-sm shadow-[#800020]/20 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tutorial &amp; Guide</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Teaching Takeaways
              </h3>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">0th Order:</span>
                  <span>Matches only the function value at <MathView math="a" /> (a horizontal line).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">1st Order:</span>
                  <span>Matches the slope <MathView math="f'(a)" /> — this is the classic tangent line approximation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">2nd Order:</span>
                  <span>Matches the concavity/curvature <MathView math="f''(a)" /> via a quadratic osculating parabola.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#800020]">Higher Orders:</span>
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

      {/* Classroom Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Designed for Numerical Methods &amp; Mathematical Analysis courses. Built with Next.js, math.js &amp; Plotly.
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Client-Side Computation</span>
            <span>•</span>
            <span>Vercel Deploy Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
