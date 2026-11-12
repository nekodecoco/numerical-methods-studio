'use client';

import React, { useState } from 'react';
import { Copy, Check, Table as TableIcon } from 'lucide-react';
import { FixedPointStep } from '@/lib/openMethods';

interface FixedPointTableProps {
  steps: FixedPointStep[];
  currentIter: number;
  onSelectIter: (iter: number) => void;
  gExpr: string;
}

export const FixedPointTable: React.FC<FixedPointTableProps> = ({
  steps,
  currentIter,
  onSelectIter,
  gExpr,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTSV = () => {
    if (steps.length === 0) return;

    const headers = ['Iteration (i)', 'x_i', 'g(x_i) [x_{i+1}]', "g'(x_i)", 'Contractive (|g\'| < 1)', 'ea (%)'];
    const rows = steps.map((s) => [
      s.iteration,
      s.xi.toFixed(6),
      s.gxi.toFixed(6),
      s.gPrimeXi.toFixed(6),
      s.isContractive ? 'Yes (< 1)' : 'No (>= 1)',
      s.ea !== null ? s.ea.toFixed(6) : '',
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl shadow-stone-200/40 p-5 space-y-4">
      {/* Table Header & Copy Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-[#800020]" />
            <span>Values Accounting Table: Fixed-Point Iteration</span>
            <span className="text-xs font-normal text-stone-500">
              ({steps.length} {steps.length === 1 ? 'iteration' : 'iterations'})
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            Monitoring convergence condition <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">|g&apos;(x)| &lt; 1</code> and relative error <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">ε_a</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTSV}
          disabled={steps.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
          <span>{copied ? 'Copied TSV!' : 'Copy for Excel/Sheets'}</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl max-h-[380px]">
        <table className="w-full text-left text-xs text-stone-700 font-mono">
          <thead className="bg-stone-100/90 sticky top-0 border-b border-stone-200 text-stone-900 font-sans uppercase text-[10px] tracking-wider z-10">
            <tr>
              <th className="py-2.5 px-3 text-center">Iter (i)</th>
              <th className="py-2.5 px-3">x_i</th>
              <th className="py-2.5 px-3 text-[#800020] font-bold">g(x_i) = x_{'{i+1}'}</th>
              <th className="py-2.5 px-3">g&apos;(x_i)</th>
              <th className="py-2.5 px-3">|g&apos;| &lt; 1?</th>
              <th className="py-2.5 px-3 text-emerald-700 font-bold">ε_a (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {steps.map((step) => {
              const isActive = step.iteration === currentIter;

              return (
                <tr
                  key={step.iteration}
                  onClick={() => onSelectIter(step.iteration)}
                  className={`transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-50/90 font-bold border-l-4 border-l-[#800020] text-stone-900'
                      : 'hover:bg-stone-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-[#800020]">
                    {step.iteration}
                  </td>
                  <td className="py-2.5 px-3">{step.xi.toFixed(6)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-900">{step.gxi.toFixed(6)}</td>
                  <td className="py-2.5 px-3">{step.gPrimeXi.toFixed(6)}</td>
                  <td className="py-2.5 px-3">
                    {step.isContractive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Contractive
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        ⚠ Expansive
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">
                    {step.ea !== null ? `${step.ea.toFixed(4)}%` : '—'}
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
