'use client';

import React from 'react';
import { TaylorStep } from '@/lib/taylor';
import { MathView } from './MathView';
import { ArrowRight, Check, Hash, Sparkles } from 'lucide-react';

interface DerivativesLogProps {
  steps: TaylorStep[];
  currentOrder: number;
  capOrder: number;
  a: number;
  originalLatex: string;
}

export const DerivativesLog: React.FC<DerivativesLogProps> = ({
  steps,
  currentOrder,
  capOrder,
  a,
  originalLatex,
}) => {
  const visibleSteps = steps.slice(0, currentOrder + 1);

  // Helper to format derivative notation f^(n)(x)
  const getDerivLabel = (ord: number): string => {
    if (ord === 0) return 'f(x)';
    if (ord === 1) return "f'(x)";
    if (ord === 2) return "f''(x)";
    if (ord === 3) return "f'''(x)";
    return `f^{(${ord})}(x)`;
  };

  const getDerivAtALabel = (ord: number): string => {
    const aStr = a === 0 ? '0' : `a`;
    if (ord === 0) return `f(${aStr})`;
    if (ord === 1) return `f'(${aStr})`;
    if (ord === 2) return `f''(${aStr})`;
    if (ord === 3) return `f'''(${aStr})`;
    return `f^{(${ord})}(${aStr})`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header & Running Polynomial */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Symbolic Derivatives & Running Polynomial
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Step-by-step Taylor expansion evaluated at center <MathView math={`a = ${a}`} />
          </p>
        </div>

        {/* Running Polynomial Badge */}
        {visibleSteps.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2 text-stone-900 flex flex-col items-start lg:items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
              Running Polynomial P_{currentOrder}(x)
            </span>
            <div className="text-sm font-serif overflow-x-auto max-w-full text-stone-900 pt-0.5">
              <MathView
                math={`P_{${currentOrder}}(x) = ${visibleSteps[visibleSteps.length - 1].polynomialLatex || '0'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {visibleSteps.map((s, idx) => {
          const isLatest = idx === currentOrder;
          const isZeroOrder = idx === 0;

          return (
            <div
              key={s.order}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isLatest
                  ? 'bg-amber-50/30 border-amber-300/80 shadow-sm animate-fadeIn'
                  : 'bg-stone-50/60 border-stone-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isLatest
                        ? 'bg-[#800020] text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    Order {s.order}
                  </span>
                  <span className="text-xs font-medium text-stone-600">
                    {isZeroOrder
                      ? 'Base Value f(a)'
                      : s.order === 1
                      ? 'First Derivative (Slope)'
                      : s.order === 2
                      ? 'Second Derivative (Curvature)'
                      : `Derivative ${s.order}`}
                  </span>
                </div>

                {isLatest && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Latest Revealed Term
                  </span>
                )}
              </div>

              {/* Grid of 3 math components for each order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                {/* 1. Symbolic Derivative */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Symbolic Derivative
                  </span>
                  <div className="text-sm font-serif text-stone-900 overflow-x-auto">
                    <MathView
                      math={`${getDerivLabel(s.order)} = ${s.derivativeLatex || s.derivativeExpr}`}
                    />
                  </div>
                </div>

                {/* 2. Evaluated at Center a */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Evaluated at center a = {a}
                  </span>
                  <div className="text-sm font-serif text-stone-900 overflow-x-auto">
                    <MathView
                      math={`${getDerivAtALabel(s.order)} = ${s.derivativeAtAFormatted}`}
                    />
                  </div>
                </div>

                {/* 3. Taylor Term Added */}
                <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Added Taylor Term
                  </span>
                  <div className="text-sm font-serif text-[#800020] font-semibold overflow-x-auto">
                    <MathView math={s.termLatex || '0'} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Up Next Teaser if not at cap */}
        {currentOrder < capOrder && currentOrder < steps.length - 1 && (
          <div className="p-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/40 text-stone-500 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
              <span>
                Order {currentOrder + 1} derivative available:{' '}
                <strong className="text-stone-700 font-mono">
                  {getDerivLabel(currentOrder + 1)}
                </strong>
              </span>
            </span>
            <span className="text-[11px] font-medium text-[#800020]">
              Click &quot;Reveal Next Derivative&quot; above
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
