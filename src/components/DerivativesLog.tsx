'use client';

import React, { useState } from 'react';
import { TaylorStep } from '@/lib/taylor';
import { MathView } from './MathView';
import { ValuesTable } from './ValuesTable';
import { Table, LayoutGrid, Copy, Check, Sparkles, Sigma } from 'lucide-react';

interface DerivativesLogProps {
  steps: TaylorStep[];
  currentOrder: number;
  capOrder: number;
  a: number;
  originalLatex: string;
  evalOriginal: (x: number) => number;
  originalExpr: string;
}

export const DerivativesLog: React.FC<DerivativesLogProps> = ({
  steps,
  currentOrder,
  capOrder,
  a,
  originalLatex,
  evalOriginal,
  originalExpr,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'cards'>('table');
  const [copiedFormula, setCopiedFormula] = useState(false);

  const visibleSteps = steps.slice(0, currentOrder + 1);
  const currentPolyLatex = visibleSteps.length > 0 ? visibleSteps[visibleSteps.length - 1].polynomialLatex || '0' : '0';

  const fullFormulaLatex = `P_{${currentOrder}}(x) = ${currentPolyLatex}`;

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(fullFormulaLatex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

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
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-5">
      {/* 1. Full Formula Display Banner */}
      <div className="rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-4 space-y-2 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Sigma className="w-4 h-4 text-[#800020]" />
            <span>Full Taylor Polynomial Formula (Degree n = {currentOrder})</span>
          </div>

          <button
            type="button"
            onClick={handleCopyFormula}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            title="Copy LaTeX formula to clipboard"
          >
            {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormula ? 'Copied LaTeX' : 'Copy LaTeX'}</span>
          </button>
        </div>

        {/* Large Prominent KaTeX Render of Full Polynomial */}
        <div className="p-3 bg-white/90 rounded-lg border border-amber-200/60 overflow-x-auto text-stone-900">
          <div className="text-base sm:text-lg font-serif text-[#800020] min-w-max">
            <MathView math={fullFormulaLatex} block={true} />
          </div>
        </div>

        {/* General Definition Reference */}
        <div className="text-[11px] text-stone-500 font-serif flex flex-wrap items-center gap-2 pt-0.5">
          <span className="font-sans font-semibold uppercase text-[10px] text-stone-400">Definition:</span>
          <MathView math="f(x) = \sum_{k=0}^n \frac{f^{(k)}(a)}{k!} (x-a)^k + R_n(x)" />
        </div>
      </div>

      {/* 2. Header & View Toggle (Table vs Cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
            Derivatives &amp; Numerical Values Tracker
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Expansion center <MathView math={`a = ${a}`} /> • {visibleSteps.length} term{visibleSteps.length !== 1 ? 's' : ''} computed
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white text-[#800020] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Values Table</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white text-[#800020] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Step Cards</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'table' ? (
        <ValuesTable
          steps={steps}
          currentOrder={currentOrder}
          a={a}
          evalOriginal={evalOriginal}
          originalExpr={originalExpr}
        />
      ) : (
        /* Cards View */
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                  {/* Symbolic Derivative */}
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

                  {/* Evaluated at a */}
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                      Evaluated at a = {a}
                    </span>
                    <div className="text-sm font-serif text-stone-900 overflow-x-auto">
                      <MathView
                        math={`${getDerivAtALabel(s.order)} = ${s.derivativeAtAFormatted}`}
                      />
                    </div>
                  </div>

                  {/* Added Term */}
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
        </div>
      )}

      {/* Up Next Teaser if not at cap */}
      {currentOrder < capOrder && currentOrder < steps.length - 1 && (
        <div className="p-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/40 text-stone-500 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
            <span>
              Order {currentOrder + 1} derivative ready:{' '}
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
  );
};
