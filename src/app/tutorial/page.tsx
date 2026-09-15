'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MathView } from '@/components/MathView';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  mathQuestion?: string;
  options: { text: string; math?: string; isCorrect: boolean; explanation: string }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why do all the even-power terms vanish in the Maclaurin series of',
    mathQuestion: '\\sin(x) \\text{ around } a = 0?',
    options: [
      {
        text: 'Because even derivatives of sine evaluated at 0 equal 0:',
        math: '\\sin(0) = 0,\\; -\\sin(0) = 0',
        isCorrect: true,
        explanation: 'Correct! The 0th, 2nd, 4th, ... derivatives are all ±sin(x), which evaluate to 0 at x = 0.',
      },
      {
        text: 'Because factorials of even numbers cannot divide coefficients.',
        isCorrect: false,
        explanation: 'Incorrect. Factorials exist for all non-negative integers.',
      },
      {
        text: 'Because sine is an odd function, so only odd powers can represent it.',
        isCorrect: true,
        explanation: 'Also fundamentally correct! Since sin(-x) = -sin(x), symmetry demands that even powers cannot appear.',
      },
    ],
  },
  {
    id: 2,
    question: 'If a function has',
    mathQuestion: "f''(0) = -12, \\text{ what is the coefficient of the quadratic term } x^2?",
    options: [
      {
        text: 'Coefficient is -12',
        math: 'c_2 = -12',
        isCorrect: false,
        explanation: 'Incorrect. Remember you must divide by 2! (which is 2).',
      },
      {
        text: 'Coefficient is -6:',
        math: 'c_2 = \\frac{f\'\'(0)}{2!} = \\frac{-12}{2} = -6',
        isCorrect: true,
        explanation: 'Correct! The Taylor coefficient formula is c_k = f^(k)(a) / k!. Here c_2 = -12 / 2! = -6.',
      },
      {
        text: 'Coefficient is -24',
        math: 'c_2 = -24',
        isCorrect: false,
        explanation: 'Incorrect. You divide by n!, you do not multiply.',
      },
    ],
  },
  {
    id: 3,
    question: 'According to the Lagrange Remainder theorem, what happens to the approximation error as',
    mathQuestion: '|x - a| \\text{ gets larger?}',
    options: [
      {
        text: 'The error generally grows because the distance',
        math: '|x - a|^{n+1} \\text{ increases rapidly.}',
        isCorrect: true,
        explanation: 'Correct! Taylor polynomials approximate best locally near the expansion center a. As you move farther away, higher degree errors accumulate.',
      },
      {
        text: 'The error is always zero everywhere for any continuous function.',
        isCorrect: false,
        explanation: 'Incorrect. A finite polynomial only equals the true function at the anchor point a unless f(x) itself is a polynomial.',
      },
    ],
  },
];

export default function TutorialPage() {
  const [activeExample, setActiveExample] = useState<'exp' | 'sin' | 'cos' | 'geom'>('sin');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] text-white flex items-center justify-center shadow-md shadow-[#800020]/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-950 font-serif">
                  Taylor Series Tutorial
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hidden sm:inline-block">
                  Student Study Guide
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Numerical Methods &amp; Calculus Concept Breakdown
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-md shadow-[#800020]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Interactive Visualizer</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-[#800020] via-[#70001c] to-[#4d0013] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amber-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Numerical Concept</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
              Demystifying the Taylor Series
            </h2>
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
              How does a computer calculate <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">sin(0.42)</code> or{' '}
              <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">e^1.7</code>? Computers cannot directly calculate curves — they can only add and multiply.
              Taylor polynomials are the bridge that transforms transcendent curves into simple addition and multiplication!
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Interactive Visualizer</span>
              </Link>
              <a
                href="#recipe"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition"
              >
                <span>Jump to 5-Step Recipe</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* 1. Intuition & Philosophy */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800020]">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>1. The Core Philosophy</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Matching Derivatives = Matching Reality
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Imagine tracking a flying drone without seeing its entire flight path. If you know:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs font-bold text-[#800020]">Where it is now</span>
              <div className="text-lg font-bold font-mono">f(a)</div>
              <p className="text-xs text-stone-500">The 0th order approximation. You guess it stays where it is.</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs font-bold text-[#800020]">Its speed &amp; direction</span>
              <div className="text-lg font-bold font-mono">f&apos;(a)</div>
              <p className="text-xs text-stone-500">The 1st order approximation. You project its straight tangent line.</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs font-bold text-[#800020]">Its curve / acceleration</span>
              <div className="text-lg font-bold font-mono">f&apos;&apos;(a) / 2!</div>
              <p className="text-xs text-stone-500">The 2nd order approximation. You bend the projection into a parabola.</p>
            </div>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed pt-2">
            By matching the <strong>jerk</strong> (<MathView math="f'''(a)" />), <strong>snap</strong> (<MathView math="f^{(4)}(a)" />), and beyond,
            the polynomial curve hugs the true function tighter and over an ever-wider interval around the center point <MathView math="a" />.
          </p>
        </section>

        {/* 2. The 5-Step Recipe */}
        <section id="recipe" className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800020]">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>2. The 5-Step Systematic Recipe</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            How to Build Any Taylor Polynomial on Homework &amp; Exams
          </h3>

          <div className="space-y-4 pt-2">
            {/* Step 1 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020] text-white font-bold flex items-center justify-center text-sm">
                1
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">Identify the Function &amp; Center Point</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Identify <MathView math="f(x)" /> and choose or read the expansion center <MathView math="a" />.
                  If <MathView math="a = 0" />, the series is specifically called a <strong>Maclaurin series</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020] text-white font-bold flex items-center justify-center text-sm">
                2
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">Compute Successive Derivatives</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Differentiate iteratively until you reach the desired degree <MathView math="n" />:
                </p>
                <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs font-serif">
                  <MathView math="f^{(0)}(x) = f(x), \quad f^{(1)}(x) = f'(x), \quad f^{(2)}(x) = f''(x), \quad \dots, \quad f^{(n)}(x)" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020] text-white font-bold flex items-center justify-center text-sm">
                3
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">Evaluate Each Derivative at Center a</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Substitute <MathView math="x = a" /> into every derivative expression:
                </p>
                <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs font-serif">
                  <MathView math="f(a), \quad f'(a), \quad f''(a), \quad f'''(a), \quad \dots, \quad f^{(n)}(a)" />
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020] text-white font-bold flex items-center justify-center text-sm">
                4
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">Divide by Factorials to Find Coefficients</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Each coefficient <MathView math="c_k" /> is normalized by dividing by <MathView math="k!" />:
                </p>
                <div className="bg-white p-2 rounded-lg border border-stone-200 text-xs font-serif text-[#800020] font-bold">
                  <MathView math="c_k = \frac{f^{(k)}(a)}{k!}" />
                </div>
                <p className="text-[11px] text-stone-500">
                  Why <MathView math="k!" />? Because differentiating <MathView math="(x-a)^k" /> <MathView math="k" /> times brings down <MathView math="k \cdot (k-1) \cdot \dots \cdot 1 = k!" />!
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                5
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-950">Assemble the Full Polynomial</h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Sum all terms weighted by their distance powers <MathView math="(x-a)^k" />:
                </p>
                <div className="bg-white p-3 rounded-lg border border-amber-200 text-sm font-serif text-[#800020]">
                  <MathView
                    math="P_n(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \dots + \frac{f^{(n)}(a)}{n!}(x-a)^n"
                    block={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Worked Examples with Derivations */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800020]">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>3. Classroom Worked Examples</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Step-by-Step Derivations of Classic Functions
          </h3>

          {/* Example Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'sin', label: 'sin(x) at a = 0', math: '\\sin(x)' },
              { id: 'cos', label: 'cos(x) at a = 0', math: '\\cos(x)' },
              { id: 'exp', label: 'e^x at a = 0', math: 'e^x' },
              { id: 'geom', label: '1/(1-x) at a = 0', math: '\\frac{1}{1-x}' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveExample(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  activeExample === tab.id
                    ? 'bg-[#800020] text-white border-[#800020] shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <MathView math={tab.math} /> <span className="ml-1 text-[11px] font-normal">({tab.label})</span>
              </button>
            ))}
          </div>

          {/* Example Details */}
          {activeExample === 'sin' && (
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    Deriving <MathView math="f(x) = \sin(x)" /> around <MathView math="a = 0" />
                  </h4>
                  <p className="text-xs text-stone-500">Notice the 4-step cyclic derivative pattern!</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Plot in Visualizer</span>
                </Link>
              </div>

              {/* Table of Derivations */}
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Order k</th>
                      <th className="p-2.5">f^(k)(x)</th>
                      <th className="p-2.5">f^(k)(0)</th>
                      <th className="p-2.5">k!</th>
                      <th className="p-2.5">Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="p-2.5 font-bold text-[#800020]">0</td><td className="p-2.5 font-serif">sin(x)</td><td className="p-2.5">0</td><td className="p-2.5">1</td><td className="p-2.5 text-stone-400">0</td></tr>
                    <tr className="bg-amber-50/40"><td className="p-2.5 font-bold text-[#800020]">1</td><td className="p-2.5 font-serif">cos(x)</td><td className="p-2.5 font-bold">1</td><td className="p-2.5">1</td><td className="p-2.5 font-serif text-[#800020] font-bold">+ x</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#800020]">2</td><td className="p-2.5 font-serif">-sin(x)</td><td className="p-2.5">0</td><td className="p-2.5">2</td><td className="p-2.5 text-stone-400">0</td></tr>
                    <tr className="bg-amber-50/40"><td className="p-2.5 font-bold text-[#800020]">3</td><td className="p-2.5 font-serif">-cos(x)</td><td className="p-2.5 font-bold">-1</td><td className="p-2.5">6</td><td className="p-2.5 font-serif text-[#800020] font-bold">- x³/3!</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#800020]">4</td><td className="p-2.5 font-serif">sin(x)</td><td className="p-2.5">0</td><td className="p-2.5">24</td><td className="p-2.5 text-stone-400">0</td></tr>
                    <tr className="bg-amber-50/40"><td className="p-2.5 font-bold text-[#800020]">5</td><td className="p-2.5 font-serif">cos(x)</td><td className="p-2.5 font-bold">1</td><td className="p-2.5">120</td><td className="p-2.5 font-serif text-[#800020] font-bold">+ x⁵/5!</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700">
                <strong>Resulting Taylor Polynomial:</strong>
                <div className="text-sm font-serif text-[#800020] pt-1">
                  <MathView math="P_5(x) = x - \frac{x^3}{3!} + \frac{x^5}{5!} = x - \frac{x^3}{6} + \frac{x^5}{120}" />
                </div>
              </div>
            </div>
          )}

          {activeExample === 'cos' && (
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    Deriving <MathView math="f(x) = \cos(x)" /> around <MathView math="a = 0" />
                  </h4>
                  <p className="text-xs text-stone-500">Only even powers survive since cosine is symmetric!</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Plot in Visualizer</span>
                </Link>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700">
                <strong>Resulting Taylor Polynomial:</strong>
                <div className="text-sm font-serif text-[#800020] pt-1">
                  <MathView math="P_4(x) = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} = 1 - \frac{x^2}{2} + \frac{x^4}{24}" />
                </div>
              </div>
            </div>
          )}

          {activeExample === 'exp' && (
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    Deriving <MathView math="f(x) = e^x" /> around <MathView math="a = 0" />
                  </h4>
                  <p className="text-xs text-stone-500">Every derivative is identical: (e^x)&apos; = e^x, so f^(k)(0) = 1 always!</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Plot in Visualizer</span>
                </Link>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700">
                <strong>Resulting Taylor Polynomial:</strong>
                <div className="text-sm font-serif text-[#800020] pt-1">
                  <MathView math="P_n(x) = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \dots + \frac{x^n}{n!}" />
                </div>
              </div>
            </div>
          )}

          {activeExample === 'geom' && (
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    Deriving <MathView math="f(x) = \frac{1}{1-x}" /> around <MathView math="a = 0" />
                  </h4>
                  <p className="text-xs text-stone-500">The Geometric Series connection &amp; Radius of Convergence!</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020] text-white hover:bg-[#6b001b] transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Plot in Visualizer</span>
                </Link>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
                <div>
                  <strong>Resulting Taylor Polynomial:</strong>
                  <div className="text-sm font-serif text-[#800020] pt-1">
                    <MathView math="P_n(x) = 1 + x + x^2 + x^3 + \dots + x^n" />
                  </div>
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  ⚠️ <strong>Crucial Numerical Lesson:</strong> This approximation only converges when <MathView math="|x| < 1" />.
                  If you test <MathView math="x = 2" />, the terms blow up to infinity even though <MathView math="f(2) = -1" />!
                  This finite span is called the <strong>Radius of Convergence</strong>.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. Error Analysis & Lagrange Remainder */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800020]">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>4. Numerical Error Analysis &amp; The Remainder</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            How Accurate is Order n? The Lagrange Error Bound
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            In Numerical Methods, knowing the answer is only half the battle; knowing the <strong>maximum possible error</strong> is what ensures bridges don&apos;t collapse and spacecraft navigate accurately.
          </p>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-sm font-bold text-stone-900">Taylor&apos;s Theorem with Remainder</h4>
            <div className="text-sm font-serif text-[#800020]">
              <MathView
                math="f(x) = P_n(x) + R_n(x), \quad \text{where } R_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!} (x - a)^{n+1}"
                block={true}
              />
            </div>
            <p className="text-xs text-stone-500">
              Here, <MathView math="\xi" /> is some unknown point between <MathView math="a" /> and <MathView math="x" />.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-stone-200 space-y-1 bg-white">
              <span className="text-xs font-bold text-emerald-800">Why Error Shrinks Fast</span>
              <p className="text-xs text-stone-600 leading-relaxed">
                The denominator <MathView math="(n+1)!" /> grows astoundingly fast (<MathView math="10! \approx 3.6 \times 10^6" />).
                This is why adding each derivative dramatically shrinks the error near <MathView math="a" />.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-stone-200 space-y-1 bg-white">
              <span className="text-xs font-bold text-amber-800">Why Distance Matters</span>
              <p className="text-xs text-stone-600 leading-relaxed">
                The numerator contains <MathView math="|x - a|^{n+1}" />. If you stay close to <MathView math="a" />, this term is tiny.
                If you move far from <MathView math="a" />, you need significantly higher degrees <MathView math="n" /> to compensate.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Interactive Practice Quiz */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800020]">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>5. Quick Concept Check</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">
              Test Your Understanding
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click an option to test your grasp of Taylor coefficients and convergence:
            </p>
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q) => {
              const selectedIdx = selectedAnswers[q.id];
              const isAnswered = selectedIdx !== undefined;

              return (
                <div key={q.id} className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="text-sm font-semibold text-stone-900">
                    Question {q.id}: {q.question}{' '}
                    {q.mathQuestion && <MathView math={q.mathQuestion} />}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      const isSelected = selectedIdx === idx;
                      let btnStyle = 'bg-white border-stone-200 text-stone-700 hover:border-stone-300';
                      if (isAnswered) {
                        if (opt.isCorrect && isSelected) {
                          btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                        } else if (!opt.isCorrect && isSelected) {
                          btnStyle = 'bg-red-50 border-red-400 text-red-950 font-medium';
                        } else if (opt.isCorrect) {
                          btnStyle = 'bg-emerald-50/50 border-emerald-300 text-emerald-900';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div>
                            <span>{opt.text}</span> {opt.math && <MathView math={opt.math} />}
                          </div>
                          {isAnswered && isSelected && (
                            <span className="flex-shrink-0 text-xs font-bold">
                              {opt.isCorrect ? '✓ Correct' : '✗ Try Again'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        q.options[selectedIdx].isCorrect
                          ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-200'
                          : 'bg-amber-100/70 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {q.options[selectedIdx].explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center py-6 space-y-3">
          <h3 className="text-lg font-bold font-serif text-stone-900">
            Ready to See It in Motion?
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try revealing terms one by one on the interactive graph to see polynomials bend in real time.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800020] hover:bg-[#6b001b] text-white font-bold text-sm transition shadow-lg shadow-[#800020]/25"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Interactive Visualizer</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Taylor Series Tutorial for Numerical Methods courses.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <Link href="/" className="hover:text-stone-700 underline">Interactive Visualizer</Link>
            <span>•</span>
            <Link href="/tutorial" className="hover:text-stone-700 underline">Tutorial Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
