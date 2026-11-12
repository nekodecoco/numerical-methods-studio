'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Scissors,
  Split,
  Target,
  Zap,
  Spline,
  Orbit,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

interface MethodItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<'bracketing' | 'open' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (menu: 'bracketing' | 'open') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const bracketingMethods: MethodItem[] = [
    {
      href: '/bisection',
      label: 'Bisection Method',
      subtitle: 'Interval halving · Guaranteed convergence',
      icon: Scissors,
      badge: 'O(log 1/ε)',
    },
    {
      href: '/false-position',
      label: 'False Position',
      subtitle: 'Regula Falsi · Linear chord interpolation',
      icon: Split,
      badge: 'Interpolated',
    },
  ];

  const openMethods: MethodItem[] = [
    {
      href: '/fixed-point',
      label: 'Fixed-Point Iteration',
      subtitle: 'x = g(x) · Cobweb staircase dynamics',
      icon: Target,
      badge: '|g\'| < 1',
    },
    {
      href: '/newton-raphson',
      label: 'Newton-Raphson',
      subtitle: 'Tangent projection · Quadratic convergence',
      icon: Zap,
      badge: 'p = 2',
    },
    {
      href: '/secant',
      label: 'Secant Method',
      subtitle: 'Finite difference · No analytic derivative',
      icon: Spline,
      badge: 'p ≈ 1.62',
    },
    {
      href: '/mullers',
      label: "Muller's Method",
      subtitle: 'Parabolic fit · Detects complex roots',
      icon: Orbit,
      badge: 'p ≈ 1.84',
    },
  ];

  const isBracketingActive = pathname === '/bisection' || pathname === '/false-position';
  const isOpenMethodsActive =
    pathname === '/fixed-point' ||
    pathname === '/fixed-position' ||
    pathname === '/newton-raphson' ||
    pathname === '/secant' ||
    pathname === '/mullers' ||
    pathname === '/muller';
  const isTaylorActive = pathname === '/taylor' || pathname === '/taylor-series';
  const isTutorialActive = pathname === '/tutorial';

  return (
    <header className="border-b border-white/10 bg-[#09090b]/85 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group select-none flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-[#800020]/30 group-hover:bg-[#9a0027] transition-colors">
              <span className="tracking-tight text-amber-200 font-serif italic text-base">f</span>
              <span className="text-[10px] text-white/90 -ml-0.5">(x)</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-semibold tracking-tight text-white font-sans">
                  Numerical Methods Studio
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-stone-300 border border-white/10 hidden sm:inline-block">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono hidden md:block">
                Root-finding &amp; Taylor Series Workspace
              </span>
            </div>
          </Link>

          {/* Categorized Desktop Navigation */}
          <nav
            ref={dropdownRef}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium"
          >
            {/* Primary Category: Taylor Series */}
            <Link
              href="/taylor"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isTaylorActive
                  ? 'bg-[#800020] text-white font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Taylor Series</span>
            </Link>

            {/* Category: Bracketing Methods Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('bracketing')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'bracketing' ? null : 'bracketing')
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isBracketingActive
                    ? 'text-amber-300 bg-white/5 font-semibold border border-white/15'
                    : openDropdown === 'bracketing'
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
                aria-expanded={openDropdown === 'bracketing'}
              >
                <span>Bracketing Methods</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    openDropdown === 'bracketing' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Bracketing Dropdown Flyout */}
              {openDropdown === 'bracketing' && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                      Enclosed Search Intervals
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {bracketingMethods.map((method) => {
                      const Icon = method.icon;
                      const active = pathname === method.href;
                      return (
                        <Link
                          key={method.href}
                          href={method.href}
                          className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                            active
                              ? 'bg-[#800020]/25 text-rose-200 font-medium border border-[#800020]/40'
                              : 'text-stone-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md mt-0.5 flex-shrink-0 ${
                              active
                                ? 'bg-[#800020] text-white'
                                : 'bg-white/5 text-stone-400'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-white">
                                {method.label}
                              </span>
                              {method.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-stone-400 border border-white/10">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              {method.subtitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Category: Open Methods Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('open')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'open' ? null : 'open')
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isOpenMethodsActive
                    ? 'text-amber-300 bg-white/5 font-semibold border border-white/15'
                    : openDropdown === 'open'
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
                aria-expanded={openDropdown === 'open'}
              >
                <span>Open Methods</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    openDropdown === 'open' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Open Methods Dropdown Flyout */}
              {openDropdown === 'open' && (
                <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                      Single / Multi-Point Iteration
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {openMethods.map((method) => {
                      const Icon = method.icon;
                      const active =
                        pathname === method.href ||
                        (method.href === '/fixed-point' && pathname === '/fixed-position') ||
                        (method.href === '/mullers' && pathname === '/muller');
                      return (
                        <Link
                          key={method.href}
                          href={method.href}
                          className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                            active
                              ? 'bg-[#800020]/25 text-rose-200 font-medium border border-[#800020]/40'
                              : 'text-stone-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md mt-0.5 flex-shrink-0 ${
                              active
                                ? 'bg-[#800020] text-white'
                                : 'bg-white/5 text-stone-400'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-white">
                                {method.label}
                              </span>
                              {method.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-stone-400 border border-white/10">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              {method.subtitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link: Study Guide */}
            <Link
              href="/tutorial"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isTutorialActive
                  ? 'bg-[#800020] text-white font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Guide</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0c0c0e] px-4 pt-3 pb-6 space-y-4">
          {/* Overview */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold px-2">
              Approximation
            </div>
            <Link
              href="/taylor"
              className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                isTaylorActive
                  ? 'bg-[#800020] text-white font-semibold'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Taylor Series Visualizer</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>

          {/* Bracketing Methods */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold px-2">
              Bracketing Methods
            </div>
            {bracketingMethods.map((method) => {
              const Icon = method.icon;
              const active = pathname === method.href;
              return (
                <Link
                  key={method.href}
                  href={method.href}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
                    active
                      ? 'bg-[#800020]/25 text-rose-200 font-semibold border border-[#800020]/40'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-stone-400" />
                    <span>{method.label}</span>
                  </div>
                  {method.badge && (
                    <span className="text-[10px] font-mono text-stone-500">
                      {method.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Open Methods */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold px-2">
              Open Methods
            </div>
            {openMethods.map((method) => {
              const Icon = method.icon;
              const active =
                pathname === method.href ||
                (method.href === '/fixed-point' && pathname === '/fixed-position') ||
                (method.href === '/mullers' && pathname === '/muller');
              return (
                <Link
                  key={method.href}
                  href={method.href}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
                    active
                      ? 'bg-[#800020]/25 text-rose-200 font-semibold border border-[#800020]/40'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-stone-400" />
                    <span>{method.label}</span>
                  </div>
                  {method.badge && (
                    <span className="text-[10px] font-mono text-stone-500">
                      {method.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Resources */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <Link
              href="/tutorial"
              className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                isTutorialActive
                  ? 'bg-[#800020] text-white font-semibold'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Study Guide &amp; Worked Examples</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
