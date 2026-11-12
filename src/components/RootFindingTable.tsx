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
    <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 space-y-4 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{method === 'bisection' ? 'Bisection Iteration Accounting Table' : 'False Position Accounting Table'}</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Step-by-step bracketing table logging interval shrinking and relative errors
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-stone-300 text-xs font-mono font-semibold transition cursor-pointer"
          title="Copy formatted TSV data to paste into Excel or Google Sheets"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied TSV!' : 'Copy Table TSV'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
        <table className="w-full text-left text-xs text-stone-300 border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-stone-400 font-mono">
              <th className="py-2.5 px-3">Iter <span className="font-serif normal-case">i</span></th>
              <th className="py-2.5 px-3 text-cyan-400">x_l</th>
              <th className="py-2.5 px-3 text-purple-400">x_u</th>
              <th className="py-2.5 px-3 bg-amber-500/10 text-amber-300 font-bold">x_r (Estimate)</th>
              <th className="py-2.5 px-3">f(x_l)</th>
              <th className="py-2.5 px-3">f(x_u)</th>
              <th className="py-2.5 px-3">f(x_r)</th>
              <th className="py-2.5 px-3">f(x_l) &middot; f(x_r)</th>
              <th className="py-2.5 px-3 bg-rose-500/10 text-rose-300">ε_a (%)</th>
              <th className="py-2.5 px-3">Next Step Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {visibleSteps.map((s) => {
              const isCurrent = s.iteration === currentIter;

              return (
                <tr
                  key={s.iteration}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-amber-500/10 font-medium text-amber-200'
                      : s.iteration % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-white/[0.02]'
                  } hover:bg-white/5`}
                >
                  {/* Iteration */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold ${
                        isCurrent
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {s.iteration}
                    </span>
                  </td>

                  {/* xl */}
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">{s.xl.toFixed(6)}</td>

                  {/* xu */}
                  <td className="py-2.5 px-3 text-purple-300 font-semibold">{s.xu.toFixed(6)}</td>

                  {/* xr */}
                  <td className="py-2.5 px-3 bg-amber-500/5 font-bold text-amber-300">
                    {s.xr.toFixed(6)}
                  </td>

                  {/* f(xl) */}
                  <td className="py-2.5 px-3 text-stone-400">{s.fxl.toFixed(5)}</td>

                  {/* f(xu) */}
                  <td className="py-2.5 px-3 text-stone-400">{s.fxu.toFixed(5)}</td>

                  {/* f(xr) */}
                  <td className="py-2.5 px-3 text-white font-semibold">{s.fxr.toFixed(5)}</td>

                  {/* sign test */}
                  <td className="py-2.5 px-3">
                    {s.signTest < 0 ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-bold">
                        &lt; 0 (Opposite)
                      </span>
                    ) : s.signTest > 0 ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-sky-500/20 text-sky-300 font-bold">
                        &gt; 0 (Same)
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 font-bold">
                        = 0 (Root!)
                      </span>
                    )}
                  </td>

                  {/* ea */}
                  <td className="py-2.5 px-3 bg-rose-500/5">
                    {s.ea !== null ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          s.ea < 0.001
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : s.ea < 0.1
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-stone-300'
                        }`}
                      >
                        {s.ea < 0.001 ? s.ea.toExponential(3) : s.ea.toFixed(4)}%
                      </span>
                    ) : (
                      <span className="text-stone-600">---</span>
                    )}
                  </td>

                  {/* Decision */}
                  <td className="py-2.5 px-3 font-sans text-xs">
                    {s.subinterval === 'left' ? (
                      <span className="text-emerald-400 font-medium">
                        Root in left half &rarr; <code className="bg-black/60 px-1 py-0.5 rounded text-[11px] font-mono text-stone-300 border border-white/10">xu = xr</code>
                      </span>
                    ) : s.subinterval === 'right' ? (
                      <span className="text-cyan-400 font-medium">
                        Root in right half &rarr; <code className="bg-black/60 px-1 py-0.5 rounded text-[11px] font-mono text-stone-300 border border-white/10">xl = xr</code>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">
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
