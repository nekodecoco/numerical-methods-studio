'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { NewtonRaphsonStep } from '@/lib/openMethods';
import { Eye, EyeOff, ZoomIn, Target, Sparkles, TrendingUp } from 'lucide-react';

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
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Initializing Tangent Precision Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface NewtonRaphsonPlotProps {
  exprFStr: string;
  evalF: (x: number) => number;
  steps: NewtonRaphsonStep[];
  currentIter: number;
  initialX0: number;
}

export const NewtonRaphsonPlot: React.FC<NewtonRaphsonPlotProps> = ({
  exprFStr,
  evalF,
  steps,
  currentIter,
  initialX0,
}) => {
  const [zoomToRoot, setZoomToRoot] = useState(false);
  const [showGhostTangent, setShowGhostTangent] = useState(true);

  const currentStep = steps[currentIter - 1] || null;
  const prevStep = currentIter > 1 ? steps[currentIter - 2] : null;

  // Domain range determination
  const { plotXMin, plotXMax, xValues, yValues, yMinPlot, yMaxPlot } = useMemo(() => {
    const allX = [initialX0];
    const stepsToConsider = steps.slice(0, currentIter);
    stepsToConsider.forEach((s) => {
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
    if (minY > -0.5) minY = -0.5;
    if (maxY < 0.5) maxY = 0.5;

    return {
      plotXMin: minX,
      plotXMax: maxX,
      xValues: xs,
      yValues: ys,
      yMinPlot: Math.max(-100, minY),
      yMaxPlot: Math.min(100, maxY),
    };
  }, [initialX0, steps, currentIter, zoomToRoot, currentStep, evalF]);

  // Construct Traces
  const plotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [];

    // 1. Zero Reference Axis (y = 0)
    traces.push({
      x: [plotXMin, plotXMax],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      name: 'Zero Axis (y = 0)',
      line: {
        color: 'rgba(255, 255, 255, 0.2)',
        width: 1.5,
        dash: 'dot',
      },
      hoverinfo: 'skip',
    });

    // 2. True Function Curve f(x) (Vibrant Rose Crimson)
    traces.push({
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      name: `f(x) = ${exprFStr}`,
      line: {
        color: '#f43f5e',
        width: 3,
      },
      hovertemplate: `<b>f(x)</b>: %{y:.5f}<br>x: %{x:.5f}<extra></extra>`,
    });

    // 3. Ghost Tangent Line (Previous Iteration)
    if (showGhostTangent && prevStep) {
      const pX0 = prevStep.xi;
      const pY0 = prevStep.fxi;
      const pX1 = prevStep.xNext;
      const pY1 = 0;

      traces.push({
        x: [pX0, pX1],
        y: [pY0, pY1],
        type: 'scatter',
        mode: 'lines',
        name: `Prev Tangent (Iter ${prevStep.iteration})`,
        line: {
          color: 'rgba(148, 163, 184, 0.45)',
          width: 1.8,
          dash: 'dash',
        },
        hovertemplate: `<b>Previous Tangent</b><extra></extra>`,
      });
    }

    // 4. Active Tangent Line
    if (currentStep) {
      const tx0 = currentStep.xi;
      const ty0 = currentStep.fxi;
      const tx1 = currentStep.xNext;
      const ty1 = 0;

      // Extend tangent slightly beyond endpoints for visual clarity
      const dx = tx1 - tx0;
      const xStart = tx0 - dx * 0.15;
      const yStart = ty0 + (currentStep.tangentSlope * (xStart - tx0));
      const xEnd = tx1 + dx * 0.15;
      const yEnd = ty1 + (currentStep.tangentSlope * (xEnd - tx1));

      traces.push({
        x: [xStart, tx0, tx1, xEnd],
        y: [yStart, ty0, ty1, yEnd],
        type: 'scatter',
        mode: 'lines',
        name: `Active Tangent (Iter ${currentIter})`,
        line: {
          color: '#fbbf24', // Amber Gold
          width: 2.8,
        },
        hovertemplate: `<b>Tangent Line</b>: slope = ${currentStep.dfxi.toFixed(4)}<extra></extra>`,
      });

      // Point at (xi, f(xi))
      traces.push({
        x: [currentStep.xi],
        y: [currentStep.fxi],
        type: 'scatter',
        mode: 'markers+text',
        name: `(x_${currentIter - 1}, f(x_${currentIter - 1}))`,
        marker: {
          size: 11,
          color: '#f43f5e',
          symbol: 'diamond',
          line: {
            color: '#fbbf24',
            width: 2,
          },
        },
        text: [`(x_${currentIter - 1}, f)`],
        textposition: currentStep.fxi >= 0 ? 'top center' : 'bottom center',
        textfont: { size: 10, color: '#fbbf24', family: 'var(--font-geist-mono), monospace' },
        hovertemplate: `<b>Curve Point</b><br>x: %{x:.5f}<br>f(x): %{y:.5f}<extra></extra>`,
      });

      // Vertical projection line from xNext to curve f(xNext)
      const nextY = evalF(currentStep.xNext);
      if (isFinite(nextY)) {
        traces.push({
          x: [currentStep.xNext, currentStep.xNext],
          y: [0, nextY],
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Vertical Projection',
          line: {
            color: '#38bdf8', // Sky Blue
            width: 1.8,
            dash: 'dot',
          },
          marker: {
            size: 6,
            color: '#38bdf8',
          },
          hoverinfo: 'skip',
        });
      }

      // Root Estimate Marker on x-axis: (x_{i+1}, 0)
      traces.push({
        x: [currentStep.xNext],
        y: [0],
        type: 'scatter',
        mode: 'markers+text',
        name: `Root Estimate x_${currentIter}`,
        marker: {
          size: 13,
          color: '#f59e0b',
          symbol: 'circle',
          line: {
            color: '#ffffff',
            width: 2.5,
          },
        },
        text: [`x_${currentIter} = ${currentStep.xNext.toFixed(4)}`],
        textposition: 'top center',
        textfont: {
          family: 'var(--font-geist-mono), monospace',
          size: 11,
          color: '#fbbf24',
          weight: 700,
        },
        hovertemplate: `<b>New Estimate x_${currentIter}</b>: %{x:.6f}<extra></extra>`,
      });
    }

    return traces;
  }, [
    plotXMin,
    plotXMax,
    xValues,
    yValues,
    exprFStr,
    showGhostTangent,
    prevStep,
    currentStep,
    currentIter,
    evalF,
  ]);

  // Layout configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plotLayout: any = useMemo(
    () => ({
      autosize: true,
      height: 520,
      margin: { l: 55, r: 25, t: 45, b: 50 },
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: '#0a0a0c',
      font: {
        family: 'var(--font-geist-sans), Inter, system-ui, -apple-system, sans-serif',
        color: '#a1a1aa',
      },
      xaxis: {
        title: { text: 'x', font: { size: 12, color: '#a1a1aa' } },
        range: [plotXMin, plotXMax],
        fixedrange: false,
        showgrid: true,
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        gridwidth: 1,
        zeroline: true,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        zerolinewidth: 1.5,
        tickfont: { size: 11, color: '#71717a' },
      },
      yaxis: {
        title: { text: 'f(x)', font: { size: 12, color: '#a1a1aa' } },
        range: [yMinPlot, yMaxPlot],
        fixedrange: false,
        showgrid: true,
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        gridwidth: 1,
        zeroline: true,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        zerolinewidth: 1.5,
        tickfont: { size: 11, color: '#71717a' },
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.14,
        font: { size: 11, color: '#e4e4e7' },
        bgcolor: 'rgba(18, 18, 21, 0.85)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
      },
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#18181b',
        font: { color: '#FFFFFF', size: 12 },
        bordercolor: 'rgba(255, 255, 255, 0.15)',
      },
    }),
    [plotXMin, plotXMax, yMinPlot, yMaxPlot]
  );

  return (
    <div className="relative w-full rounded-2xl bg-[#121215] border border-white/10 overflow-hidden">
      {/* Graph Toolbar */}
      <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0c]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
            f(x) Curve
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Active Tangent Line
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Vertical Projection
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-mono text-stone-400 flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGhostTangent}
              onChange={(e) => setShowGhostTangent(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Show previous ghost tangent</span>
          </label>

          <label className="text-xs font-mono text-stone-400 flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={zoomToRoot}
              onChange={(e) => setZoomToRoot(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <ZoomIn className="w-3.5 h-3.5 text-stone-400" />
            <span>Focus root</span>
          </label>
        </div>
      </div>

      {/* Plot Canvas */}
      <div className="w-full h-[520px]">
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
