'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Scissors,
  Split,
  Target,
  Zap,
  Spline,
  Orbit,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Activity,
  CheckCircle2,
  Layers,
  Sparkles,
  Play,
  Compass,
  BarChart3,
  Terminal,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { MathView } from '@/components/MathView';

export default function LandingPage() {
  // State for interactive hero live solver switcher
  const [activeHeroTab, setActiveHeroTab] = useState<'newton' | 'bisection' | 'taylor' | 'secant'>('newton');

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroSolvers = {
    newton: {
      name: 'Newton-Raphson',
      category: 'OPEN METHOD · TANGENT PROJECTION',
      order: 'p = 2.0 (Quadratic)',
      formula: 'x_{i+1} = x_i - \\frac{f(x_i)}{f\'(x_i)}',
      href: '/newton-raphson',
      exampleRoot: 'x* = 1.521379',
      iterationsNeeded: '4 Iterations',
      guarantee: 'Fastest convergence when x₀ is near root',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
      sampleSteps: [
        { iter: 1, x: '2.000000', ea: '—' },
        { iter: 2, x: '1.600000', ea: '25.00%' },
        { iter: 3, x: '1.524390', ea: '4.96%' },
        { iter: 4, x: '1.521380', ea: '0.19%' },
      ],
    },
    bisection: {
      name: 'Bisection Method',
      category: 'BRACKETING · INTERVAL HALVING',
      order: 'p = 1.0 (Linear)',
      formula: 'x_r = \\frac{x_l + x_u}{2}',
      href: '/bisection',
      exampleRoot: 'x* = 1.521484',
      iterationsNeeded: '14 Iterations',
      guarantee: '100% Guaranteed root containment',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
      sampleSteps: [
        { iter: 1, x: '1.500000', ea: '—' },
        { iter: 2, x: '1.750000', ea: '14.28%' },
        { iter: 3, x: '1.625000', ea: '7.69%' },
        { iter: 4, x: '1.562500', ea: '4.00%' },
      ],
    },
    taylor: {
      name: 'Taylor Series',
      category: 'SERIES EXPANSION · POLYNOMIAL FIT',
      order: 'O(hⁿ⁺¹)',
      formula: 'f(x) \\approx \\sum_{k=0}^n \\frac{f^{(k)}(a)}{k!} (x-a)^k',
      href: '/taylor',
      exampleRoot: 'sin(0.42) ≈ 0.407760',
      iterationsNeeded: 'Order n = 5',
      guarantee: 'Exact asymptotic expansion around x = a',
      badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
      sampleSteps: [
        { iter: 1, x: '0.420000 (n=1)', ea: '2.94%' },
        { iter: 2, x: '0.407652 (n=3)', ea: '0.026%' },
        { iter: 3, x: '0.407760 (n=5)', ea: '0.0001%' },
      ],
    },
    secant: {
      name: 'Secant Method',
      category: 'OPEN METHOD · FINITE DIFFERENCE',
      order: 'p ≈ 1.618 (Superlinear)',
      formula: 'x_{i+1} = x_i - f(x_i)\\frac{x_i - x_{i-1}}{f(x_i) - f(x_{i-1})}',
      href: '/secant',
      exampleRoot: 'x* = 1.521379',
      iterationsNeeded: '5 Iterations',
      guarantee: 'No analytic derivative formula required',
      badgeColor: 'border-sky-500/30 text-sky-300 bg-sky-500/10',
      sampleSteps: [
        { iter: 1, x: '1.800000', ea: '—' },
        { iter: 2, x: '1.583333', ea: '13.68%' },
        { iter: 3, x: '1.523810', ea: '3.90%' },
        { iter: 4, x: '1.521402', ea: '0.15%' },
      ],
    },
  };

  const currentHero = heroSolvers[activeHeroTab];

  const faqs = [
    {
      q: 'Why do we need numerical methods if we have analytical calculus?',
      a: 'Most real-world equations in aerodynamics, circuit design, quantum physics, and structural engineering cannot be solved with algebraic formulas (e.g. x^5 - x - 1 = 0 or transcendent combinations like e^x + sin(x) = 0). Numerical methods transform these intractable equations into iterative arithmetic steps that digital computers can compute to arbitrary precision.',
    },
    {
      q: 'What is the fundamental difference between Bracketing and Open methods?',
      a: 'Bracketing methods (Bisection, False Position) always enclose the root between two initial guesses where f(xl) * f(xu) < 0. They are mathematically guaranteed to converge. Open methods (Newton-Raphson, Secant, Fixed-Point) require only one or two starting points without sign enclosure; they converge exponentially faster (quadratic p=2 vs linear p=1) but can diverge if initial guesses are poor or derivatives vanish.',
    },
    {
      q: 'How does Taylor series relate to root-finding algorithms?',
      a: 'Taylor series is the foundation of all numerical analysis. For instance, Newton-Raphson is literally derived by taking the first-order Taylor series approximation f(x + Δx) ≈ f(x) + f\'(x)Δx = 0 and solving for Δx = -f(x)/f\'(x). Muller\'s method uses a second-order parabola fit.',
    },
    {
      q: 'Can these algorithms detect complex (imaginary) roots?',
      a: 'Most real-axis methods (Bisection, False Position, standard Newton) only find real roots on the Cartesian x-axis. Muller\'s Method uses quadratic parabolic interpolation with the quadratic formula discriminant sqrt(b² - 4ac), enabling it to naturally branch into the complex plane (u ± iv).',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#800020] selection:text-white font-sans overflow-x-hidden antialiased">
      {/* Precision Top Navbar */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-[#800020]/30 group-hover:bg-[#9a0027] transition-colors">
              <span className="font-serif italic text-amber-200 text-base">f</span>
              <span className="text-[10px] text-white/90 -ml-0.5">(x)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white font-sans">
                Numerical Methods Studio
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-stone-300 border border-white/10 hidden sm:inline-block">
                v2.0
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-stone-400">
            <a href="#solvers" className="hover:text-white transition-colors">
              01 · SOLVERS
            </a>
            <a href="#acts" className="hover:text-white transition-colors">
              02 · FILM ACTS
            </a>
            <a href="#convergence" className="hover:text-white transition-colors">
              03 · CONVERGENCE
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              04 · FAQ
            </a>
            <Link href="/tutorial" className="hover:text-amber-300 transition-colors">
              STUDY GUIDE →
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-stone-400 border border-white/10 px-2.5 py-1 rounded-full bg-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>7 Algorithms Live</span>
            </div>
            <Link
              href="/taylor"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-stone-950 hover:bg-stone-200 transition-all shadow-sm"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 border-b border-white/10 overflow-hidden">
        {/* Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#800020]/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Monospace Overline Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>00 · INTERACTIVE COMPUTATIONAL LABORATORY · SUITE V2.0</span>
          </div>

          {/* Two-Tone Master Headline (Patensify style) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-sans leading-[1.08] max-w-4xl mx-auto">
            <span className="text-stone-400">Calculus lives on paper.</span>
            <br />
            <span className="text-white">Numerical methods solve reality.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-400 max-w-2xl mx-auto font-normal leading-relaxed">
            The precision interactive visualizer for polynomial series approximations, interval-enclosed bracketing, and quadratic root-finding dynamics. Built for students, engineers, and mathematicians.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/taylor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white text-stone-950 hover:bg-stone-200 transition shadow-lg shadow-white/10 cursor-pointer"
            >
              <span>Launch Taylor Visualizer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#solvers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition cursor-pointer"
            >
              <span>Explore All 7 Solvers</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Live Hero Widget */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/15 bg-[#121215]/90 backdrop-blur-xl shadow-2xl p-4 sm:p-6 text-left space-y-6">
              {/* Widget Header & Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-stone-400">
                    interactive_solver_preview.exe
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('newton')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activeHeroTab === 'newton'
                        ? 'bg-[#800020] text-white font-semibold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Newton-R
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('bisection')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activeHeroTab === 'bisection'
                        ? 'bg-[#800020] text-white font-semibold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Bisection
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('taylor')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activeHeroTab === 'taylor'
                        ? 'bg-[#800020] text-white font-semibold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Taylor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('secant')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activeHeroTab === 'secant'
                        ? 'bg-[#800020] text-white font-semibold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Secant
                  </button>
                </div>
              </div>

              {/* Widget Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Math & Meta */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                      {currentHero.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-sans text-white">
                      {currentHero.name}
                    </h3>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[10px] font-mono text-stone-400 uppercase">
                      Iterative Formulation
                    </span>
                    <div className="text-sm font-mono text-amber-200">
                      <MathView math={currentHero.formula} block={false} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                    <span className={`px-2.5 py-1 rounded-md border ${currentHero.badgeColor}`}>
                      Rate: {currentHero.order}
                    </span>
                    <span className="px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-stone-300">
                      Target: {currentHero.exampleRoot}
                    </span>
                  </div>
                </div>

                {/* Right: Convergence Stepping Card */}
                <div className="md:col-span-5 bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-b border-white/10 pb-2">
                    <span>STEP #</span>
                    <span>APPROX (xr)</span>
                    <span>ERROR (εa)</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {currentHero.sampleSteps.map((step) => (
                      <div
                        key={step.iter}
                        className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-stone-200"
                      >
                        <span className="text-[#800020] font-bold">i = {step.iter}</span>
                        <span>{step.x}</span>
                        <span className="text-emerald-400">{step.ea}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={currentHero.href}
                    className="w-full mt-2 py-2 rounded-lg bg-[#800020] hover:bg-[#6b001b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Launch {currentHero.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 7 Interactive Solvers Directory (Bento Suite) */}
      <section id="solvers" className="py-24 border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                01 · THE SUITE ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-white">
                Seven Specialized Solvers.
              </h2>
            </div>
            <p className="text-sm text-stone-400 max-w-md">
              From Taylor polynomial approximations to interval bracketing and complex root discovery in the Gaussian plane.
            </p>
          </div>

          {/* Solvers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Taylor Series */}
            <Link
              href="/taylor"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-[#800020]/60 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#800020]/20 border border-[#800020]/30 text-rose-300 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-stone-400">
                    SERIES EXPANSION
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    Taylor Series Visualizer
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Progressive derivative discovery up to order n = 25. Compare polynomial fits with real-time error bounds and dynamic convergence traces.
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="f(x) \approx \sum_{k=0}^n \frac{f^{(k)}(a)}{k!}(x-a)^k" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Degree cap: n = 25</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Bisection */}
            <Link
              href="/bisection"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">
                    BRACKETING METHOD
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Bisection Method
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Strict interval halving grounded on Bolzano&apos;s Intermediate Value Theorem. Guaranteed convergence with predictable step counts.
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="x_r = \frac{x_l + x_u}{2}" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Linear p = 1.0</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. False Position */}
            <Link
              href="/false-position"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    <Split className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400">
                    REGULA FALSI
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    False Position
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Draws a straight chord between bracket endpoints to extrapolate roots faster than Bisection while maintaining strict sign containment.
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="x_r = \frac{x_l f(x_u) - x_u f(x_l)}{f(x_u) - f(x_l)}" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Secant Bracketing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Fixed Point */}
            <Link
              href="/fixed-point"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-400">
                    ONE-POINT ITERATION
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    Fixed-Point Iteration
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Rearranges f(x) = 0 into x = g(x) and traces the iconic cobweb staircase. Compares contractive vs expansive divergent forms.
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="x_{i+1} = g(x_i) \quad (|g'(x)| < 1)" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Cobweb Mapping</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Newton Raphson */}
            <Link
              href="/newton-raphson"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-amber-400/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400">
                    QUADRATIC SPEED
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    Newton-Raphson Method
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Projects successive tangent lines to the horizontal axis. Doubles precision every single iteration near the root (p = 2).
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Rate: p = 2.0</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. Secant Method */}
            <Link
              href="/secant"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-cyan-400/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">
                    <Spline className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400">
                    DERIVATIVE-FREE
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Secant Method
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Eliminates analytic derivatives using finite-difference secants. Achieves near-quadratic superlinear convergence at p ≈ 1.618.
                  </p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-stone-300">
                  <MathView math="x_{i+1} = x_i - f(x_i)\frac{x_i - x_{i-1}}{f(x_i) - f(x_{i-1})}" block={false} />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-white">
                <span>Golden Ratio p ≈ 1.62</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 7. Muller's Method */}
            <Link
              href="/mullers"
              className="group p-6 rounded-2xl bg-[#121215] border border-white/10 hover:border-indigo-400/50 transition-all hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden lg:col-span-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                      <Orbit className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-300">
                      PARABOLIC INTERPOLATION · REAL &amp; COMPLEX ROOTS
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Muller&apos;s Method (Complex Roots in the Gaussian Plane)
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
                    Fits a second-order parabola through three points. Because it utilizes the quadratic discriminant √b² - 4ac, Muller&apos;s method naturally captures imaginary and complex conjugate roots that standard real solvers miss completely.
                  </p>
                </div>
                <div className="md:col-span-4 bg-black/50 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono text-stone-500 uppercase">Parabolic Intercept</span>
                  <MathView math="x_3 = x_2 - \frac{2c}{b \pm \sqrt{b^2 - 4ac}}" block={false} className="text-sm font-mono text-indigo-200" />
                  <div className="flex justify-between text-xs font-mono text-stone-400 pt-1">
                    <span>Order: p ≈ 1.84</span>
                    <span className="text-emerald-400">Complex Ready</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Scrollytelling Film Acts (Patensify style) */}
      <section id="acts" className="py-24 border-b border-white/10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Act 01 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#800020] font-bold">
                ACT 01 · THE DISCRETIZATION
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Computers cannot calculate curves.
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                Silicon processors only know how to perform two fundamental mathematical operations: add and multiply. To evaluate transcendent curves like sin(x), eˣ, or ln(x), computers use Taylor polynomials to turn calculus into simple, rapid arithmetic.
              </p>
              <div className="pt-2">
                <Link
                  href="/taylor"
                  className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 hover:text-amber-200 underline underline-offset-4"
                >
                  <span>Explore Taylor Series Expansion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-7 bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono text-stone-400">
                <span>TAYLOR DERIVATIVE ORDER TRACKER</span>
                <span className="text-amber-400 font-bold">sin(x) around a = 0</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-black/40 border border-white/5 flex justify-between items-center">
                  <span className="text-stone-400">n = 1 (Tangent Line)</span>
                  <span className="text-amber-200 font-bold">P₁(x) = x</span>
                  <span className="text-[10px] text-stone-500">Linear Fit</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/5 flex justify-between items-center">
                  <span className="text-stone-400">n = 3 (Cubic Curvature)</span>
                  <span className="text-amber-200 font-bold">P₃(x) = x - x³/6</span>
                  <span className="text-[10px] text-stone-500">Inflection Fit</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/5 flex justify-between items-center">
                  <span className="text-stone-400">n = 5 (Quintic Harmonic)</span>
                  <span className="text-amber-200 font-bold">P₅(x) = x - x³/6 + x⁵/120</span>
                  <span className="text-[10px] text-emerald-400">ε &lt; 0.001%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Act 02 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl order-2 md:order-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono text-stone-400">
                <span>BOLZANO SIGN TRAPPING RULE</span>
                <span className="text-emerald-400 font-bold">f(xₗ) · f(xᵤ) &lt; 0</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-stone-500">LOWER BOUND</div>
                  <div className="text-white font-bold">f(xₗ) &lt; 0</div>
                  <div className="text-[10px] text-rose-400">Negative sign</div>
                </div>
                <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-stone-500">ROOT MUST EXIST</div>
                  <div className="text-amber-400 font-bold">x* ∈ (xₗ, xᵤ)</div>
                  <div className="text-[10px] text-stone-400">Continuous</div>
                </div>
                <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-stone-500">UPPER BOUND</div>
                  <div className="text-white font-bold">f(xᵤ) &gt; 0</div>
                  <div className="text-[10px] text-emerald-400">Positive sign</div>
                </div>
              </div>
              <p className="text-xs text-stone-400 font-mono leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                Every iteration cuts the error exactly in half: Δxᵢ = (xᵤ - xₗ) / 2ⁱ. You always know the exact maximum error before you even run the code.
              </p>
            </div>

            <div className="md:col-span-5 space-y-4 order-1 md:order-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#800020] font-bold">
                ACT 02 · THE ENCLOSURE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Zero chance of divergence.
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                Bracketing algorithms never fail. By maintaining opposite mathematical signs on each boundary, the Intermediate Value Theorem guarantees that a root is trapped between them.
              </p>
              <div className="pt-2 flex gap-4 text-xs font-mono">
                <Link href="/bisection" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
                  Bisection →
                </Link>
                <Link href="/false-position" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
                  False Position →
                </Link>
              </div>
            </div>
          </div>

          {/* Act 03 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#800020] font-bold">
                ACT 03 · THE TANGENT PROJECTION
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Quadratic convergence. Double digits every step.
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                When speed matters, Open Methods project linear and parabolic trajectories straight into the root. Instead of crawling linearly, Newton-Raphson doubles its verified decimal places on every step: from 2 decimals, to 4, to 8, to 16.
              </p>
              <div className="pt-2">
                <Link
                  href="/newton-raphson"
                  className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 hover:text-amber-200 underline underline-offset-4"
                >
                  <span>Experience Quadratic Tangents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-7 bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono text-stone-400">
                <span>CONVERGENCE SPEED COMPARISON (ITERATIONS TO ε &lt; 10⁻⁸)</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Newton-Raphson (p = 2.0)</span>
                    <span className="text-amber-400 font-bold">4 steps</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[15%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Muller&apos;s Method (p ≈ 1.84)</span>
                    <span className="text-indigo-400 font-bold">5 steps</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full w-[20%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Secant Method (p ≈ 1.62)</span>
                    <span className="text-cyan-400 font-bold">6 steps</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[26%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Bisection Method (p = 1.0)</span>
                    <span className="text-emerald-400 font-bold">28 steps</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Master Convergence Comparison Matrix */}
      <section id="convergence" className="py-24 border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              03 · MATHEMATICAL SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-white">
              The Convergence Matrix.
            </h2>
            <p className="text-sm text-stone-400 max-w-xl">
              Choose the right solver based on derivative accessibility, convergence order, and computational cost.
            </p>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121215]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/5 text-stone-400 uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-semibold">Algorithm</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Order (p)</th>
                  <th className="p-4 font-semibold">Derivative Required</th>
                  <th className="p-4 font-semibold">Primary Risk</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">Bisection</td>
                  <td className="p-4 text-emerald-400">Bracketing</td>
                  <td className="p-4">Linear (p = 1.0)</td>
                  <td className="p-4 text-stone-400">No (f(x) only)</td>
                  <td className="p-4 text-stone-400">Slow convergence</td>
                  <td className="p-4 text-right">
                    <Link href="/bisection" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">False Position</td>
                  <td className="p-4 text-emerald-400">Bracketing</td>
                  <td className="p-4">Linear / Superlinear</td>
                  <td className="p-4 text-stone-400">No (f(x) only)</td>
                  <td className="p-4 text-stone-400">One-sided stagnation</td>
                  <td className="p-4 text-right">
                    <Link href="/false-position" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">Fixed-Point</td>
                  <td className="p-4 text-purple-400">Open Iteration</td>
                  <td className="p-4">Linear (p = 1.0)</td>
                  <td className="p-4 text-stone-400">Check |g&apos;(x)| &lt; 1</td>
                  <td className="p-4 text-rose-400">Divergence if |g&apos;| &gt; 1</td>
                  <td className="p-4 text-right">
                    <Link href="/fixed-point" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">Newton-Raphson</td>
                  <td className="p-4 text-amber-400">Open Method</td>
                  <td className="p-4 font-bold text-amber-300">Quadratic (p = 2.0)</td>
                  <td className="p-4 text-amber-300">Yes: f&apos;(x) analytical</td>
                  <td className="p-4 text-rose-400">f&apos;(x) = 0 division</td>
                  <td className="p-4 text-right">
                    <Link href="/newton-raphson" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">Secant Method</td>
                  <td className="p-4 text-cyan-400">Open Method</td>
                  <td className="p-4">Golden Ratio (p ≈ 1.62)</td>
                  <td className="p-4 text-stone-400">No (Difference quotient)</td>
                  <td className="p-4 text-stone-400">Can diverge far from root</td>
                  <td className="p-4 text-right">
                    <Link href="/secant" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">Muller&apos;s Method</td>
                  <td className="p-4 text-indigo-400">Open Method</td>
                  <td className="p-4">Near-Quadratic (p ≈ 1.84)</td>
                  <td className="p-4 text-stone-400">No (Parabola fit)</td>
                  <td className="p-4 text-emerald-400">Discovers Complex Roots</td>
                  <td className="p-4 text-right">
                    <Link href="/mullers" className="text-amber-300 hover:underline">
                      Launch →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-b border-white/10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              04 · FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Understanding the Mathematics.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-[#121215] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-medium text-sm text-white hover:text-amber-200 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                      openFaq === idx ? 'rotate-90 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 relative overflow-hidden text-center border-b border-white/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#800020]/25 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Ready to explore numerical dynamics?
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto">
            Choose an algorithm, input your polynomial or transcendent equation, and inspect convergence iteration by iteration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/taylor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white text-stone-950 hover:bg-stone-200 transition shadow-lg cursor-pointer"
            >
              <span>Launch Studio Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tutorial"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition cursor-pointer"
            >
              <span>Read Study Guide</span>
              <BookOpen className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with Colossal Watermark (Patensify style) */}
      <footer className="relative pt-16 pb-12 overflow-hidden bg-[#060608]">
        {/* Giant Watermark Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap text-[clamp(40px,11vw,140px)] font-black tracking-tighter text-white/[0.025] uppercase font-sans">
          Numerical Methods Studio
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-mono">
            {/* Col 1 */}
            <div className="space-y-3">
              <span className="text-white font-bold tracking-wider uppercase">APPROXIMATIONS</span>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <Link href="/taylor" className="hover:text-white transition">
                    Taylor Series Visualizer
                  </Link>
                </li>
                <li>
                  <Link href="/tutorial#recipe" className="hover:text-white transition">
                    Maclaurin Expansions
                  </Link>
                </li>
                <li>
                  <Link href="/tutorial#quiz" className="hover:text-white transition">
                    Derivative Matching Quiz
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <span className="text-white font-bold tracking-wider uppercase">BRACKETING</span>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <Link href="/bisection" className="hover:text-white transition">
                    Bisection Method
                  </Link>
                </li>
                <li>
                  <Link href="/false-position" className="hover:text-white transition">
                    False Position (Regula Falsi)
                  </Link>
                </li>
                <li>
                  <Link href="/tutorial#root-finding-cheatsheet" className="hover:text-white transition">
                    Bolzano&apos;s Theorem
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <span className="text-white font-bold tracking-wider uppercase">OPEN METHODS</span>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <Link href="/fixed-point" className="hover:text-white transition">
                    Fixed-Point Cobweb
                  </Link>
                </li>
                <li>
                  <Link href="/newton-raphson" className="hover:text-white transition">
                    Newton-Raphson Tangents
                  </Link>
                </li>
                <li>
                  <Link href="/secant" className="hover:text-white transition">
                    Secant Method
                  </Link>
                </li>
                <li>
                  <Link href="/mullers" className="hover:text-white transition">
                    Muller&apos;s Method (Complex)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <span className="text-white font-bold tracking-wider uppercase">RESOURCES</span>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <Link href="/tutorial" className="hover:text-white transition">
                    Full Study Guide &amp; Formulas
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/nekodecoco/numerical-methods-studio"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-1"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <span className="text-stone-600">Built with Next.js &amp; KaTeX</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
            <div>
              © 2026 Numerical Methods Studio. MIT License.
            </div>
            <div className="flex items-center gap-4">
              <span>Classroom &amp; Research Grade</span>
              <span>·</span>
              <span className="text-emerald-400">v2.0 Production</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
