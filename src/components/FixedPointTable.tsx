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
    <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-4 text-white">
      {/* Table Header & Copy Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-400" />
            <span>Values Accounting Table: Fixed-Point Iteration</span>
            <span className="text-xs font-normal text-stone-400 font-mono">
              ({steps.length} {steps.length === 1 ? 'iteration' : 'iterations'})
            </span>
          </h3>
          <p className="text-xs text-stone-400">
            Monitoring convergence condition <code className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-stone-300 font-mono">|g&apos;(x)| &lt; 1</code> and relative error <code className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-stone-300 font-mono">ε_a</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTSV}
          disabled={steps.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 rounded-xl transition cursor-pointer disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
          <span>{copied ? 'Copied TSV!' : 'Copy for Excel/Sheets'}</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-white/10 rounded-xl max-h-[380px] bg-black/40">
        <table className="w-full text-left text-xs text-stone-300 font-mono">
          <thead className="bg-[#0a0a0c] sticky top-0 border-b border-white/10 text-stone-400 uppercase text-[10px] tracking-wider z-10 font-mono">
            <tr>
              <th className="py-2.5 px-3 text-center">Iter (i)</th>
              <th className="py-2.5 px-3">x_i</th>
              <th className="py-2.5 px-3 text-emerald-400 font-bold">g(x_i) = x_{'{i+1}'}</th>
              <th className="py-2.5 px-3">g&apos;(x_i)</th>
              <th className="py-2.5 px-3">|g&apos;| &lt; 1?</th>
              <th className="py-2.5 px-3 text-amber-300 font-bold">ε_a (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {steps.map((step) => {
              const isActive = step.iteration === currentIter;

              return (
                <tr
                  key={step.iteration}
                  onClick={() => onSelectIter(step.iteration)}
                  className={`transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 font-bold border-l-2 border-l-emerald-400 text-emerald-200'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                    {step.iteration}
                  </td>
                  <td className="py-2.5 px-3">{step.xi.toFixed(6)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">{step.gxi.toFixed(6)}</td>
                  <td className="py-2.5 px-3 text-stone-400">{step.gPrimeXi.toFixed(6)}</td>
                  <td className="py-2.5 px-3">
                    {step.isContractive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Contractive
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ⚠ Expansive
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">
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
