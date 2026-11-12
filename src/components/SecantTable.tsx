'use client';

import React, { useState } from 'react';
import { SecantStep } from '@/lib/openMethods';
import { Copy, Check, Table as TableIcon } from 'lucide-react';
import { formatNum } from '@/lib/taylor';

interface SecantTableProps {
  steps: SecantStep[];
  currentIter: number;
  onSelectIter: (iter: number) => void;
}

export const SecantTable: React.FC<SecantTableProps> = ({
  steps,
  currentIter,
  onSelectIter,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const headers = ['i', 'x_{i-1}', 'f(x_{i-1})', 'x_i', 'f(x_i)', 'x_{i+1}', 'f(x_{i+1})', 'Slope', 'ea (%)'];
    const rows = steps.map((s) => [
      s.iteration,
      s.xPrev.toFixed(6),
      s.fxPrev.toFixed(6),
      s.xi.toFixed(6),
      s.fxi.toFixed(6),
      s.xNext.toFixed(6),
      s.fxNext.toFixed(6),
      s.secantSlope.toFixed(6),
      s.ea !== null ? s.ea.toFixed(5) : '-',
    ]);

    const csv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-3">
      {/* Table Header & Copy Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-[#800020]" />
          <h3 className="text-sm font-bold text-stone-900">
            Secant Method Iteration Table
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            ({steps.length} steps computed)
          </span>
        </div>

        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied TSV' : 'Copy Data'}</span>
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 max-h-96 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-stone-50 text-stone-700 font-semibold sticky top-0 border-b border-stone-200 z-10">
            <tr>
              <th className="py-2.5 px-3 text-center">i</th>
              <th className="py-2.5 px-3">x<sub>i-1</sub></th>
              <th className="py-2.5 px-3">f(x<sub>i-1</sub>)</th>
              <th className="py-2.5 px-3">x<sub>i</sub></th>
              <th className="py-2.5 px-3">f(x<sub>i</sub>)</th>
              <th className="py-2.5 px-3 bg-amber-50/70 text-amber-900">x<sub>i+1</sub> (Root)</th>
              <th className="py-2.5 px-3">f(x<sub>i+1</sub>)</th>
              <th className="py-2.5 px-3">Slope m</th>
              <th className="py-2.5 px-3 text-right">&epsilon;<sub>a</sub> (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
            {steps.map((s) => {
              const isActive = s.iteration === currentIter;
              return (
                <tr
                  key={s.iteration}
                  onClick={() => onSelectIter(s.iteration)}
                  className={`cursor-pointer transition ${
                    isActive
                      ? 'bg-[#800020]/10 font-bold text-stone-950 ring-1 ring-inset ring-[#800020]/30'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <td className="py-2 px-3 text-center text-stone-500 font-bold">
                    {s.iteration}
                  </td>
                  <td className="py-2 px-3">{formatNum(s.xPrev)}</td>
                  <td className="py-2 px-3">{formatNum(s.fxPrev)}</td>
                  <td className="py-2 px-3">{formatNum(s.xi)}</td>
                  <td className="py-2 px-3">{formatNum(s.fxi)}</td>
                  <td className="py-2 px-3 text-[#800020] font-bold bg-amber-50/40">
                    {formatNum(s.xNext)}
                  </td>
                  <td className="py-2 px-3">{formatNum(s.fxNext)}</td>
                  <td className="py-2 px-3">{formatNum(s.secantSlope)}</td>
                  <td className="py-2 px-3 text-right">
                    {s.ea === null ? (
                      <span className="text-stone-400">-</span>
                    ) : (
                      <span
                        className={
                          s.ea < 0.001
                            ? 'text-emerald-700 font-bold'
                            : s.ea < 0.1
                            ? 'text-emerald-600'
                            : 'text-stone-700'
                        }
                      >
                        {s.ea < 0.0001 ? s.ea.toExponential(3) : s.ea.toFixed(5)}%
                      </span>
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
