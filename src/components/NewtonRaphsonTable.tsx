'use client';

import React, { useState } from 'react';
import { Copy, Check, Table as TableIcon } from 'lucide-react';
import { NewtonRaphsonStep } from '@/lib/openMethods';

interface NewtonRaphsonTableProps {
  steps: NewtonRaphsonStep[];
  currentIter: number;
  onSelectIter: (iter: number) => void;
  exprF: string;
}

export const NewtonRaphsonTable: React.FC<NewtonRaphsonTableProps> = ({
  steps,
  currentIter,
  onSelectIter,
  exprF,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTSV = () => {
    if (steps.length === 0) return;

    const headers = ['Iteration (i)', 'x_i', 'f(x_i)', "f'(x_i)", 'x_{i+1}', 'ea (%)'];
    const rows = steps.map((s) => [
      s.iteration,
      s.xi.toFixed(6),
      s.fxi.toFixed(6),
      s.dfxi.toFixed(6),
      s.xNext.toFixed(6),
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
            <TableIcon className="w-4 h-4 text-amber-400" />
            <span>Values Accounting Table: Newton-Raphson Method</span>
            <span className="text-xs font-normal text-stone-400 font-mono">
              ({steps.length} {steps.length === 1 ? 'iteration' : 'iterations'})
            </span>
          </h3>
          <p className="text-xs text-stone-400">
            Audit of slope <code className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-stone-300 font-mono">f&apos;(x_i)</code>, tangent intercept <code className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-stone-300 font-mono">x_{'{i+1}'}</code>, and quadratic error decrease.
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
              <th className="py-2.5 px-3">f(x_i)</th>
              <th className="py-2.5 px-3">f&apos;(x_i)</th>
              <th className="py-2.5 px-3 text-amber-300 font-bold">x_{'{i+1}'} (Tangent Intercept)</th>
              <th className="py-2.5 px-3 text-emerald-400 font-bold">ε_a (%)</th>
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
                      ? 'bg-amber-500/10 font-bold border-l-2 border-l-amber-400 text-amber-200'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                    {step.iteration}
                  </td>
                  <td className="py-2.5 px-3">{step.xi.toFixed(6)}</td>
                  <td className="py-2.5 px-3">{step.fxi.toFixed(6)}</td>
                  <td className="py-2.5 px-3">
                    <span className={step.zeroSlopeWarning ? 'text-rose-400 font-bold' : 'text-stone-400'}>
                      {step.dfxi.toFixed(6)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">{step.xNext.toFixed(6)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">
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
