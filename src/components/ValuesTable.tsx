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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/40 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-stone-300">Point Evaluation Probe:</span>
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
            <span className="font-serif italic text-stone-400">x =</span>
            <input
              type="number"
              step="any"
              value={evalX}
              onChange={(e) => setEvalX(parseFloat(e.target.value) || 0)}
              className="w-20 font-mono text-white bg-transparent focus:outline-none"
            />
          </div>
          {isValidTrueVal && (
            <span className="text-stone-400 font-mono hidden sm:inline">
              True <MathView math={`f(${evalX}) \\approx ${trueValAtX.toFixed(6)}`} />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyTable}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-stone-300 font-mono text-xs transition cursor-pointer"
          title="Copy table data as TSV (pasteable into Excel / Google Sheets)"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied TSV!' : 'Copy Table Data'}</span>
        </button>
      </div>

      {/* Values Data Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
        <table className="w-full text-left text-xs text-stone-300 border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-stone-400 font-mono">
              <th className="py-2.5 px-3">Order <span className="font-serif normal-case">k</span></th>
              <th className="py-2.5 px-3">Derivative <span className="font-serif normal-case">f^(k)(x)</span></th>
              <th className="py-2.5 px-3">At Center <span className="font-serif normal-case">f^(k)(a)</span></th>
              <th className="py-2.5 px-3">Factorial <span className="font-serif normal-case">k!</span></th>
              <th className="py-2.5 px-3">Coefficient <span className="font-serif normal-case">c_k</span></th>
              <th className="py-2.5 px-3">Added Term</th>
              <th className="py-2.5 px-3 bg-amber-500/10 text-amber-300">
                P_k({evalX})
              </th>
              <th className="py-2.5 px-3 bg-rose-500/10 text-rose-300">
                Absolute Error |f - P_k|
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
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
                      ? 'bg-amber-500/10 font-medium text-amber-200'
                      : idx % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-white/[0.02]'
                  } hover:bg-white/5`}
                >
                  {/* Order */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold ${
                        isLatest
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {s.order}
                    </span>
                  </td>

                  {/* Symbolic f^(k)(x) */}
                  <td className="py-2.5 px-3 max-w-[160px] truncate font-serif text-sm text-stone-200">
                    <MathView math={s.derivativeLatex || s.derivativeExpr} />
                  </td>

                  {/* f^(k)(a) */}
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {s.derivativeAtAFormatted}
                  </td>

                  {/* k! */}
                  <td className="py-2.5 px-3 text-stone-400">
                    {s.factorialVal}
                  </td>

                  {/* Coefficient c_k */}
                  <td className="py-2.5 px-3 text-stone-300 font-medium">
                    {Math.abs(s.coefficient) < 1e-12
                      ? '0'
                      : Math.abs(s.coefficient) < 0.0001
                      ? s.coefficient.toExponential(3)
                      : s.coefficient.toFixed(5)}
                  </td>

                  {/* Added Term */}
                  <td className="py-2.5 px-3 text-amber-300 font-serif text-xs max-w-[150px] truncate">
                    <MathView math={s.termLatex || '0'} />
                  </td>

                  {/* P_k(evalX) */}
                  <td className="py-2.5 px-3 bg-amber-500/5 font-semibold text-amber-300">
                    {isFinite(pVal) ? pVal.toFixed(6) : 'Undefined'}
                  </td>

                  {/* Absolute Error */}
                  <td className="py-2.5 px-3 bg-rose-500/5">
                    {absErr !== null ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          absErr < 1e-5
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : absErr < 0.01
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-stone-400'
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
