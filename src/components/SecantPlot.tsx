'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SecantStep } from '@/lib/openMethods';
import { Eye, EyeOff, ZoomIn, Target, Spline } from 'lucide-react';

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
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Initializing Secant Precision Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface SecantPlotProps {
  exprFStr: string;
  evalF: (x: number) => number;
  steps: SecantStep[];
  currentIter: number;
  initialX0: number;
  initialX1: number;
}

export const SecantPlot: React.FC<SecantPlotProps> = ({
  exprFStr,
  evalF,
  steps,
  currentIter,
  initialX0,
  initialX1,
}) => {
  const [zoomToRoot, setZoomToRoot] = useState(false);
  const [showGhostSecants, setShowGhostSecants] = useState(true);

  const currentStep = steps[currentIter - 1] || null;

  // Domain range determination
  const { plotXMin, plotXMax, xValues, yValues, yMinPlot, yMaxPlot } = useMemo(() => {
    const allX = [initialX0, initialX1];
    const stepsToConsider = steps.slice(0, currentIter);
    stepsToConsider.forEach((s) => {
      if (isFinite(s.xPrev)) allX.push(s.xPrev);
      if (isFinite(s.xi)) allX.push(s.xi);
      if (isFinite(s.xNext)) allX.push(s.xNext);
    });

    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);

    if (zoomToRoot && currentStep) {
      const center = currentStep.xNext;
      const span = Math.abs(currentStep.xNext - currentStep.xi) * 3 || 0.5;
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
      const padY = spanY * 0.2 || 1;
      minY -= padY;
      maxY += padY;
    }

    return {
      plotXMin: minX,
      plotXMax: maxX,
      xValues: xs,
      yValues: ys,
      yMinPlot: Math.max(minY, -100),
      yMaxPlot: Math.min(maxY, 100),
    };
  }, [evalF, steps, currentIter, initialX0, initialX1, zoomToRoot, currentStep]);

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

    // 2. Ghost Secants from previous iterations
    if (showGhostSecants && currentIter > 1) {
      for (let idx = 0; idx < currentIter - 1; idx++) {
        const s = steps[idx];
        if (!s) continue;
        const xA = Math.min(s.xPrev, s.xi, s.xNext) - 0.5;
        const xB = Math.max(s.xPrev, s.xi, s.xNext) + 0.5;
        const yA = s.secantSlope * xA + s.secantIntercept;
        const yB = s.secantSlope * xB + s.secantIntercept;

        traces.push({
          x: [xA, xB],
          y: [yA, yB],
          type: 'scatter',
          mode: 'lines',
          name: `Secant (i=${s.iteration})`,
          line: { color: 'rgba(6, 182, 212, 0.25)', width: 1.5, dash: 'dot' },
          hoverinfo: 'none',
          showlegend: idx === 0,
        });
      }
    }

    // 3. Active Secant Line for current iteration
    if (currentStep) {
      const xA = Math.min(currentStep.xPrev, currentStep.xi, currentStep.xNext) - 0.8;
      const xB = Math.max(currentStep.xPrev, currentStep.xi, currentStep.xNext) + 0.8;
      const yA = currentStep.secantSlope * xA + currentStep.secantIntercept;
      const yB = currentStep.secantSlope * xB + currentStep.secantIntercept;

      traces.push({
        x: [xA, xB],
        y: [yA, yB],
        type: 'scatter',
        mode: 'lines',
        name: `Current Secant Line`,
        line: { color: '#06b6d4', width: 2.5 },
        hoverinfo: 'none',
      });

      // Point 1: (x_{i-1}, f(x_{i-1}))
      traces.push({
        x: [currentStep.xPrev],
        y: [currentStep.fxPrev],
        type: 'scatter',
        mode: 'markers+text',
        name: `Point (x_{i-1})`,
        text: [`x_{i-1} (${currentStep.xPrev.toFixed(4)})`],
        textposition: 'top left',
        textfont: { size: 10, color: '#38bdf8', family: 'var(--font-geist-mono), monospace' },
        marker: { size: 8, color: '#38bdf8', symbol: 'circle' },
      });

      // Point 2: (x_i, f(x_i))
      traces.push({
        x: [currentStep.xi],
        y: [currentStep.fxi],
        type: 'scatter',
        mode: 'markers+text',
        name: `Point (x_i)`,
        text: [`x_i (${currentStep.xi.toFixed(4)})`],
        textposition: 'top right',
        textfont: { size: 10, color: '#06b6d4', family: 'var(--font-geist-mono), monospace' },
        marker: { size: 8, color: '#06b6d4', symbol: 'circle' },
      });

      // Vertical guideline to new root estimate
      traces.push({
        x: [currentStep.xNext, currentStep.xNext],
        y: [0, currentStep.fxNext],
        type: 'scatter',
        mode: 'lines',
        name: 'Projection to f(x_{i+1})',
        line: { color: '#fbbf24', width: 1.5, dash: 'dash' },
        hoverinfo: 'none',
      });

      // New Root Estimate on x-axis: (x_{i+1}, 0)
      traces.push({
        x: [currentStep.xNext],
        y: [0],
        type: 'scatter',
        mode: 'markers+text',
        name: `Next Root x_{i+1}`,
        text: [`x_{i+1} = ${currentStep.xNext.toFixed(5)}`],
        textposition: 'bottom center',
        textfont: { size: 10, color: '#fbbf24', family: 'var(--font-geist-mono), monospace', weight: 700 },
        marker: { size: 11, color: '#fbbf24', symbol: 'star' },
      });
    }

    return traces;
  }, [
    xValues,
    yValues,
    exprFStr,
    showGhostSecants,
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
          <Spline className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">
            Secant Line Projection Diagram
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            (Step {currentIter} of {steps.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGhostSecants(!showGhostSecants)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
              showGhostSecants
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-black/40 text-stone-400 border-white/5 hover:bg-white/5'
            }`}
          >
            {showGhostSecants ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Prior Secants</span>
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
            <span>{zoomToRoot ? 'Reset Zoom' : 'Focus Root'}</span>
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
