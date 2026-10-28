'use client';

import React, { useState } from 'react';
import { RootFindingStep } from '@/lib/rootFinding';
import { MathView } from './MathView';
import { Copy, Check, Info } from 'lucide-react';

interface RootFindingTableProps {
  method: 'bisection' | 'false-position';
  steps: RootFindingStep[];
  currentIter: number;
}

export const RootFindingTable: React.FC<RootFindingTableProps> = ({
  method,
  steps,
  currentIter,
}) => {
  const [copied, setCopied] = useState(false);

  const visibleSteps = steps.slice(0, currentIter);

  const handleCopyTSV = () => {
    const header = [
      'Iteration (i)',
      'x_l',
      'x_u',
      'x_r',
      'f(x_l)',
      'f(x_u)',
      'f(x_r)',
      'f(x_l)*f(x_r)',
      'ea (%)',
      'New Bracket',
    ].join('\t');

    const rows = visibleSteps.map((s) => [
      s.iteration,
      s.xl.toFixed(6),
      s.xu.toFixed(6),
      s.xr.toFixed(6),
      s.fxl.toFixed(6),
      s.fxu.toFixed(6),
      s.fxr.toFixed(6),
      s.signTest < 0 ? '< 0 (-)' : '> 0 (+)',
      s.ea !== null ? s.ea.toFixed(4) : '---',
      s.subinterval === 'left' ? '[x_l, x_r]' : s.subinterval === 'right' ? '[x_r, x_u]' : 'Exact Root',
    ].join('\t'));

    const tsv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-200/30 p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
            <span>{method === 'bisection' ? 'Bisection Iteration Accounting Table' : 'False Position Accounting Table'}</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Step-by-step bracketing table logging interval shrinking and relative errors
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 text-xs font-semibold transition cursor-pointer"
          title="Copy formatted TSV data to paste into Excel or Google Sheets"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied TSV!' : 'Copy Table TSV'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-xs bg-white">
        <table className="w-full text-left text-xs text-stone-700 border-collapse">
          <thead>
            <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-600 font-semibold">
              <th className="py-2.5 px-3">Iter <span className="font-serif">i</span></th>
              <th className="py-2.5 px-3 text-blue-800">x_l</th>
              <th className="py-2.5 px-3 text-purple-800">x_u</th>
              <th className="py-2.5 px-3 bg-amber-50/60 text-amber-950 font-bold">x_r (Estimate)</th>
              <th className="py-2.5 px-3">f(x_l)</th>
              <th className="py-2.5 px-3">f(x_u)</th>
              <th className="py-2.5 px-3">f(x_r)</th>
              <th className="py-2.5 px-3">f(x_l) &middot; f(x_r)</th>
              <th className="py-2.5 px-3 bg-red-50/40 text-stone-900">ε_a (%)</th>
              <th className="py-2.5 px-3">Next Step Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono">
            {visibleSteps.map((s) => {
              const isCurrent = s.iteration === currentIter;

              return (
                <tr
                  key={s.iteration}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-amber-50/50 font-medium'
                      : s.iteration % 2 === 0
                      ? 'bg-white'
                      : 'bg-stone-50/40'
                  } hover:bg-stone-100/60`}
                >
                  {/* Iteration */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        isCurrent
                          ? 'bg-[#800020] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {s.iteration}
                    </span>
                  </td>

                  {/* xl */}
                  <td className="py-2.5 px-3 text-blue-700 font-semibold">{s.xl.toFixed(6)}</td>

                  {/* xu */}
                  <td className="py-2.5 px-3 text-purple-700 font-semibold">{s.xu.toFixed(6)}</td>

                  {/* xr */}
                  <td className="py-2.5 px-3 bg-amber-50/40 font-bold text-amber-900">
                    {s.xr.toFixed(6)}
                  </td>

                  {/* f(xl) */}
                  <td className="py-2.5 px-3 text-stone-600">{s.fxl.toFixed(5)}</td>

                  {/* f(xu) */}
                  <td className="py-2.5 px-3 text-stone-600">{s.fxu.toFixed(5)}</td>

                  {/* f(xr) */}
                  <td className="py-2.5 px-3 text-stone-900 font-semibold">{s.fxr.toFixed(5)}</td>

                  {/* sign test */}
                  <td className="py-2.5 px-3">
                    {s.signTest < 0 ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 font-bold">
                        &lt; 0 (Opposite)
                      </span>
                    ) : s.signTest > 0 ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-blue-100 text-blue-800 font-bold">
                        &gt; 0 (Same)
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-amber-200 text-amber-900 font-bold">
                        = 0 (Root!)
                      </span>
                    )}
                  </td>

                  {/* ea */}
                  <td className="py-2.5 px-3 bg-red-50/30">
                    {s.ea !== null ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          s.ea < 0.001
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : s.ea < 0.1
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'text-stone-700'
                        }`}
                      >
                        {s.ea < 0.001 ? s.ea.toExponential(3) : s.ea.toFixed(4)}%
                      </span>
                    ) : (
                      <span className="text-stone-400">---</span>
                    )}
                  </td>

                  {/* Decision */}
                  <td className="py-2.5 px-3 font-sans text-xs">
                    {s.subinterval === 'left' ? (
                      <span className="text-emerald-700 font-medium">
                        Root in left half &rarr; <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">xu = xr</code>
                      </span>
                    ) : s.subinterval === 'right' ? (
                      <span className="text-blue-700 font-medium">
                        Root in right half &rarr; <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">xl = xr</code>
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold">
                        Exact root found!
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
