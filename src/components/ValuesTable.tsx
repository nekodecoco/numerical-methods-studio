'use client';

import React, { useState } from 'react';
import { TaylorStep } from '@/lib/taylor';
import { MathView } from './MathView';
import { Calculator, Copy, Check, Info } from 'lucide-react';

interface ValuesTableProps {
  steps: TaylorStep[];
  currentOrder: number;
  a: number;
  evalOriginal: (x: number) => number;
  originalExpr: string;
}

export const ValuesTable: React.FC<ValuesTableProps> = ({
  steps,
  currentOrder,
  a,
  evalOriginal,
  originalExpr,
}) => {
  // Test probe evaluation point x_eval (default to a + 1)
  const [evalX, setEvalX] = useState<number>(a !== 0 ? a * 1.5 : 1);
  const [copied, setCopied] = useState(false);

  const visibleSteps = steps.slice(0, currentOrder + 1);
  const trueValAtX = typeof evalOriginal === 'function' ? evalOriginal(evalX) : NaN;
  const isValidTrueVal = isFinite(trueValAtX) && !isNaN(trueValAtX);

  const getDerivLabel = (ord: number): string => {
    if (ord === 0) return 'f(x)';
    if (ord === 1) return "f'(x)";
    if (ord === 2) return "f''(x)";
    if (ord === 3) return "f'''(x)";
    return `f^{(${ord})}(x)`;
  };

  const handleCopyTable = () => {
    const header = ['Order (k)', "f^(k)(x)", "f^(k)(a)", "k!", "c_k = f^(k)(a)/k!", `P_k(${evalX})`, `Error |f - P_k|`].join('\t');
    const rows = visibleSteps.map((s) => {
      const pVal = s.evalPolynomial(evalX);
      const err = isValidTrueVal && isFinite(pVal) ? Math.abs(trueValAtX - pVal) : 'N/A';
      return [
        s.order,
        s.derivativeExpr,
        s.derivativeAtAFormatted,
        s.factorialVal,
        s.coefficient.toFixed(6),
        isFinite(pVal) ? pVal.toFixed(6) : 'N/A',
        typeof err === 'number' ? err.toExponential(4) : err,
      ].join('\t');
    });

    const tsv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Table Probe Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#800020]" />
          <span className="font-semibold text-stone-700">Point Evaluation Probe:</span>
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-stone-300">
            <span className="font-serif italic text-stone-500">x =</span>
            <input
              type="number"
              step="any"
              value={evalX}
              onChange={(e) => setEvalX(parseFloat(e.target.value) || 0)}
              className="w-20 font-mono text-stone-900 bg-transparent focus:outline-none"
            />
          </div>
          {isValidTrueVal && (
            <span className="text-stone-500 font-mono hidden sm:inline">
              True <MathView math={`f(${evalX}) \\approx ${trueValAtX.toFixed(6)}`} />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyTable}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 font-medium transition cursor-pointer"
          title="Copy table data as TSV (pasteable into Excel / Google Sheets)"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied TSV!' : 'Copy Table Data'}</span>
        </button>
      </div>

      {/* Values Data Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-xs bg-white">
        <table className="w-full text-left text-xs text-stone-700 border-collapse">
          <thead>
            <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-600 font-semibold">
              <th className="py-2.5 px-3">Order <span className="font-serif">k</span></th>
              <th className="py-2.5 px-3">Derivative <span className="font-serif">f^(k)(x)</span></th>
              <th className="py-2.5 px-3">At Center <span className="font-serif">f^(k)(a)</span></th>
              <th className="py-2.5 px-3">Factorial <span className="font-serif">k!</span></th>
              <th className="py-2.5 px-3">Coefficient <span className="font-serif">c_k</span></th>
              <th className="py-2.5 px-3">Added Term</th>
              <th className="py-2.5 px-3 bg-amber-50/60 text-amber-950">
                P_k({evalX})
              </th>
              <th className="py-2.5 px-3 bg-red-50/40 text-stone-900">
                Absolute Error |f - P_k|
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono">
            {visibleSteps.map((s, idx) => {
              const isLatest = idx === currentOrder;
              const pVal = s.evalPolynomial(evalX);
              const absErr =
                isValidTrueVal && isFinite(pVal) ? Math.abs(trueValAtX - pVal) : null;

              return (
                <tr
                  key={s.order}
                  className={`transition-colors ${
                    isLatest
                      ? 'bg-amber-50/50 font-medium'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-stone-50/40'
                  } hover:bg-stone-100/60`}
                >
                  {/* Order */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        isLatest
                          ? 'bg-[#800020] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {s.order}
                    </span>
                  </td>

                  {/* Symbolic f^(k)(x) */}
                  <td className="py-2.5 px-3 max-w-[160px] truncate font-serif text-sm">
                    <MathView math={s.derivativeLatex || s.derivativeExpr} />
                  </td>

                  {/* f^(k)(a) */}
                  <td className="py-2.5 px-3 font-semibold text-stone-900">
                    {s.derivativeAtAFormatted}
                  </td>

                  {/* k! */}
                  <td className="py-2.5 px-3 text-stone-500">
                    {s.factorialVal}
                  </td>

                  {/* Coefficient c_k */}
                  <td className="py-2.5 px-3 text-stone-900 font-medium">
                    {Math.abs(s.coefficient) < 1e-12
                      ? '0'
                      : Math.abs(s.coefficient) < 0.0001
                      ? s.coefficient.toExponential(3)
                      : s.coefficient.toFixed(5)}
                  </td>

                  {/* Added Term */}
                  <td className="py-2.5 px-3 text-[#800020] font-serif text-xs max-w-[150px] truncate">
                    <MathView math={s.termLatex || '0'} />
                  </td>

                  {/* P_k(evalX) */}
                  <td className="py-2.5 px-3 bg-amber-50/40 font-semibold text-amber-900">
                    {isFinite(pVal) ? pVal.toFixed(6) : 'Undefined'}
                  </td>

                  {/* Absolute Error */}
                  <td className="py-2.5 px-3 bg-red-50/30">
                    {absErr !== null ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          absErr < 1e-5
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : absErr < 0.01
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'text-stone-700'
                        }`}
                      >
                        {absErr < 1e-4 ? absErr.toExponential(4) : absErr.toFixed(6)}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
