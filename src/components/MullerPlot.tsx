'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { MullerStep } from '@/lib/openMethods';
import { Eye, EyeOff, ZoomIn, Target, Orbit } from 'lucide-react';

const Plot = dynamic<any>(
  async () => {
    const Plotly = (await import('plotly.js-dist-min')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createPlotlyComponent = ((await import('react-plotly.js/factory')) as any).default;
    return createPlotlyComponent(Plotly);
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] flex items-center justify-center bg-[#0a0a0c] rounded-2xl border border-white/10">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Initializing Parabolic Precision Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface MullerPlotProps {
  exprFStr: string;
  evalF: (x: number) => number;
  steps: MullerStep[];
  currentIter: number;
  initialX0: number;
  initialX1: number;
  initialX2: number;
}

export const MullerPlot: React.FC<MullerPlotProps> = ({
  exprFStr,
  evalF,
  steps,
  currentIter,
  initialX0,
  initialX1,
  initialX2,
}) => {
  const [zoomToRoot, setZoomToRoot] = useState(false);
  const [showGhostParabolas, setShowGhostParabolas] = useState(true);

  const currentStep = steps[currentIter - 1] || null;

  // Domain range determination
  const { plotXMin, plotXMax, xValues, yValues, yMinPlot, yMaxPlot } = useMemo(() => {
    const allX = [initialX0, initialX1, initialX2];
    const stepsToConsider = steps.slice(0, currentIter);
    stepsToConsider.forEach((s) => {
      if (isFinite(s.x0)) allX.push(s.x0);
      if (isFinite(s.x1)) allX.push(s.x1);
      if (isFinite(s.x2)) allX.push(s.x2);
      if (isFinite(s.x3Real)) allX.push(s.x3Real);
    });

    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);

    if (zoomToRoot && currentStep) {
      const center = currentStep.x3Real;
      const span = Math.abs(currentStep.x3Real - currentStep.x2) * 4 || 1.0;
      minX = center - span;
      maxX = center + span;
    } else {
      const span = maxX - minX || 2;
      const pad = span * 0.35 || 1;
      minX -= pad;
      maxX += pad;
    }

    const N = 400;
    const stepX = (maxX - minX) / (N - 1);
    const xs: number[] = [];
    const ys: (number | null)[] = [];
    const validYs: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = minX + i * stepX;
      xs.push(x);
      const y = evalF(x);
      if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1e5) {
        ys.push(y);
        validYs.push(y);
      } else {
        ys.push(null);
      }
    }

    let minY = -5;
    let maxY = 5;
    if (validYs.length > 0) {
      minY = Math.min(...validYs);
      maxY = Math.max(...validYs);
      const spanY = maxY - minY;
      const padY = spanY * 0.25 || 1;
      minY -= padY;
      maxY += padY;
    }

    return {
      plotXMin: minX,
      plotXMax: maxX,
      xValues: xs,
      yValues: ys,
      yMinPlot: Math.max(minY, -120),
      yMaxPlot: Math.min(maxY, 120),
    };
  }, [evalF, steps, currentIter, initialX0, initialX1, initialX2, zoomToRoot, currentStep]);

  // Build Plotly data traces
  const plotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [];

    // 1. Function Curve f(x)
    traces.push({
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      name: `f(x) = ${exprFStr}`,
      line: { color: '#f43f5e', width: 3 },
      hoverinfo: 'x+y',
    });

    // 2. Ghost Parabolas from previous iterations
    if (showGhostParabolas && currentIter > 1) {
      for (let idx = 0; idx < currentIter - 1; idx++) {
        const s = steps[idx];
        if (!s) continue;
        const paraYs = xValues.map((x) => {
          const val = s.evalParabola(x);
          return isFinite(val) && Math.abs(val) < 1e5 ? val : null;
        });

        traces.push({
          x: xValues,
          y: paraYs,
          type: 'scatter',
          mode: 'lines',
          name: `Parabola (i=${s.iteration})`,
          line: { color: 'rgba(99, 102, 241, 0.25)', width: 1.5, dash: 'dot' },
          hoverinfo: 'none',
          showlegend: idx === 0,
        });
      }
    }

    // 3. Current Parabola P(x)
    if (currentStep) {
      const curParaYs = xValues.map((x) => {
        const val = currentStep.evalParabola(x);
        return isFinite(val) && Math.abs(val) < 1e5 ? val : null;
      });

      traces.push({
        x: xValues,
        y: curParaYs,
        type: 'scatter',
        mode: 'lines',
        name: `Current Parabola P(x)`,
        line: { color: '#818cf8', width: 2.5 },
        hoverinfo: 'none',
      });

      // Three interpolation points: (x0, f0), (x1, f1), (x2, f2)
      traces.push({
        x: [currentStep.x0, currentStep.x1, currentStep.x2],
        y: [currentStep.f0, currentStep.f1, currentStep.f2],
        type: 'scatter',
        mode: 'markers+text',
        name: 'Triplet (x0, x1, x2)',
        text: ['x₀', 'x₁', 'x₂'],
        textposition: ['top left', 'top center', 'top right'],
        textfont: { size: 10, color: '#c7d2fe', family: 'var(--font-geist-mono), monospace' },
        marker: {
          size: 8,
          color: ['#06b6d4', '#818cf8', '#fbbf24'],
          symbol: 'circle',
        },
      });

      // Next root estimate x3
      if (!currentStep.isComplex) {
        if (currentStep.fx3 !== null) {
          traces.push({
            x: [currentStep.x3Real, currentStep.x3Real],
            y: [0, currentStep.fx3],
            type: 'scatter',
            mode: 'lines',
            name: 'Projection to f(x₃)',
            line: { color: '#10b981', width: 1.5, dash: 'dash' },
            hoverinfo: 'none',
          });
        }

        traces.push({
          x: [currentStep.x3Real],
          y: [0],
          type: 'scatter',
          mode: 'markers+text',
          name: `Root x₃ = ${currentStep.x3Real.toFixed(5)}`,
          text: [`x₃ = ${currentStep.x3Real.toFixed(5)}`],
          textposition: 'bottom center',
          textfont: { size: 10, color: '#34d399', family: 'var(--font-geist-mono), monospace', weight: 700 },
          marker: { size: 11, color: '#10b981', symbol: 'star' },
        });
      } else {
        // Complex root note
        traces.push({
          x: [currentStep.x3Real],
          y: [0],
          type: 'scatter',
          mode: 'markers+text',
          name: `Complex Root Re(x₃)`,
          text: [`Re(x₃)=${currentStep.x3Real.toFixed(4)} ± ${currentStep.x3Imag.toFixed(4)}i`],
          textposition: 'bottom center',
          textfont: { size: 10, color: '#a78bfa', family: 'var(--font-geist-mono), monospace' },
          marker: { size: 10, color: '#8b5cf6', symbol: 'diamond' },
        });
      }
    }

    return traces;
  }, [
    xValues,
    yValues,
    exprFStr,
    showGhostParabolas,
    currentIter,
    steps,
    currentStep,
  ]);

  const layout = useMemo(
    () => ({
      autosize: true,
      margin: { l: 55, r: 25, t: 40, b: 50 },
      plot_bgcolor: '#0a0a0c',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'var(--font-geist-sans), Inter, sans-serif', color: '#a1a1aa' },
      xaxis: {
        title: { text: 'x', font: { size: 12, color: '#a1a1aa' } },
        zeroline: true,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        zerolinewidth: 1.5,
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        tickfont: { size: 11, color: '#71717a' },
        range: [plotXMin, plotXMax],
      },
      yaxis: {
        title: { text: 'y / f(x)', font: { size: 12, color: '#a1a1aa' } },
        zeroline: true,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        zerolinewidth: 1.5,
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        tickfont: { size: 11, color: '#71717a' },
        range: [yMinPlot, yMaxPlot],
      },
      legend: {
        orientation: 'h' as const,
        yanchor: 'bottom' as const,
        y: 1.02,
        xanchor: 'right' as const,
        x: 1,
        font: { size: 11, color: '#e4e4e7' },
        bgcolor: 'rgba(18, 18, 21, 0.85)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
      },
      hovermode: 'closest' as const,
      hoverlabel: {
        bgcolor: '#18181b',
        font: { color: '#FFFFFF', size: 12 },
        bordercolor: 'rgba(255, 255, 255, 0.15)',
      },
    }),
    [plotXMin, plotXMax, yMinPlot, yMaxPlot]
  );

  return (
    <div className="bg-[#121215] rounded-2xl border border-white/10 p-4 space-y-3">
      {/* Plot Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Orbit className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-white">
            Parabolic Fit Interpolation Diagram
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            (Step {currentIter} of {steps.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGhostParabolas(!showGhostParabolas)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
              showGhostParabolas
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-black/40 text-stone-400 border-white/5 hover:bg-white/5'
            }`}
          >
            {showGhostParabolas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Prior Parabolas</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomToRoot(!zoomToRoot)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
              zoomToRoot
                ? 'bg-white text-black border-white'
                : 'bg-black/40 text-stone-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{zoomToRoot ? 'Reset Zoom' : 'Zoom Root'}</span>
          </button>
        </div>
      </div>

      {/* Plot Canvas */}
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-white/10">
        <Plot
          data={plotData}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
          }}
        />
      </div>
    </div>
  );
};
