'use client';

import React, { useState } from 'react';
import { MullerStep } from '@/lib/openMethods';
import { Copy, Check, Table as TableIcon } from 'lucide-react';
import { formatNum } from '@/lib/taylor';

interface MullerTableProps {
  steps: MullerStep[];
  currentIter: number;
  onSelectIter: (iter: number) => void;
}

export const MullerTable: React.FC<MullerTableProps> = ({
  steps,
  currentIter,
  onSelectIter,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const headers = ['i', 'x0', 'x1', 'x2', 'a', 'b', 'c', 'Discriminant', 'x3 (Root)', 'f(x3)', 'ea (%)'];
    const rows = steps.map((s) => [
      s.iteration,
      s.x0.toFixed(6),
      s.x1.toFixed(6),
      s.x2.toFixed(6),
      s.a.toFixed(6),
      s.b.toFixed(6),
      s.c.toFixed(6),
      s.discriminant.toFixed(6),
      s.isComplex
        ? `${s.x3Real.toFixed(6)} ± ${s.x3Imag.toFixed(6)}i`
        : s.x3Real.toFixed(6),
      s.fx3 !== null ? s.fx3.toFixed(6) : 'Complex',
      s.ea !== null ? s.ea.toFixed(5) : '-',
    ]);

    const csv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-3 text-white">
      {/* Table Header & Copy Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">
            Muller&apos;s Method Iteration Table
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            ({steps.length} steps computed)
          </span>
        </div>

        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-stone-300 transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
          <span>{copied ? 'Copied TSV' : 'Copy Data'}</span>
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto rounded-xl border border-white/10 max-h-96 overflow-y-auto bg-black/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#0a0a0c] text-stone-400 font-mono font-semibold sticky top-0 border-b border-white/10 z-10 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 text-center">i</th>
              <th className="py-2.5 px-3">x<sub>0</sub></th>
              <th className="py-2.5 px-3">x<sub>1</sub></th>
              <th className="py-2.5 px-3">x<sub>2</sub></th>
              <th className="py-2.5 px-3">a</th>
              <th className="py-2.5 px-3">b</th>
              <th className="py-2.5 px-3">c</th>
              <th className="py-2.5 px-3">D = b² - 4ac</th>
              <th className="py-2.5 px-3 bg-indigo-500/10 text-indigo-300 font-bold">x<sub>3</sub> (Root)</th>
              <th className="py-2.5 px-3">f(x<sub>3</sub>)</th>
              <th className="py-2.5 px-3 text-right text-amber-300">&epsilon;<sub>a</sub> (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px] text-stone-300">
            {steps.map((s) => {
              const isActive = s.iteration === currentIter;
              return (
                <tr
                  key={s.iteration}
                  onClick={() => onSelectIter(s.iteration)}
                  className={`cursor-pointer transition ${
                    isActive
                      ? 'bg-indigo-500/10 font-bold text-indigo-200 border-l-2 border-l-indigo-400'
                      : 'hover:bg-white/5 text-stone-300'
                  }`}
                >
                  <td className="py-2 px-3 text-center text-indigo-400 font-bold">
                    {s.iteration}
                  </td>
                  <td className="py-2 px-3">{formatNum(s.x0)}</td>
                  <td className="py-2 px-3">{formatNum(s.x1)}</td>
                  <td className="py-2 px-3">{formatNum(s.x2)}</td>
                  <td className="py-2 px-3">{formatNum(s.a)}</td>
                  <td className="py-2 px-3">{formatNum(s.b)}</td>
                  <td className="py-2 px-3">{formatNum(s.c)}</td>
                  <td className={`py-2 px-3 ${s.discriminant < 0 ? 'text-purple-400 font-bold' : ''}`}>
                    {formatNum(s.discriminant)}
                  </td>
                  <td className="py-2 px-3 text-indigo-300 font-bold bg-indigo-500/5">
                    {s.isComplex
                      ? `${formatNum(s.x3Real)} ± ${formatNum(s.x3Imag)}i`
                      : formatNum(s.x3Real)}
                  </td>
                  <td className="py-2 px-3">
                    {s.fx3 !== null ? formatNum(s.fx3) : <span className="text-purple-400">Complex</span>}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {s.ea === null ? (
                      <span className="text-stone-600">-</span>
                    ) : (
                      <span
                        className={
                          s.ea < 0.001
                            ? 'text-emerald-400 font-bold'
                            : s.ea < 0.1
                            ? 'text-indigo-300'
                            : 'text-amber-300'
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
