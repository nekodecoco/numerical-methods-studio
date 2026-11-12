'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { FixedPointStep } from '@/lib/openMethods';
import { Eye, EyeOff, ZoomIn, Target, Sparkles } from 'lucide-react';

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
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Initializing Cobweb Precision Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface FixedPointPlotProps {
  exprGStr: string;
  evalG: (x: number) => number;
  steps: FixedPointStep[];
  currentIter: number;
  initialX0: number;
}

export const FixedPointPlot: React.FC<FixedPointPlotProps> = ({
  exprGStr,
  evalG,
  steps,
  currentIter,
  initialX0,
}) => {
  const [zoomToCluster, setZoomToCluster] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(true);

  const currentStep = steps[currentIter - 1] || null;

  // Compute viewing range based on initial guess and steps seen so far
  const { plotXMin, plotXMax, xValues, yGValues, yMinPlot, yMaxPlot } = useMemo(() => {
    const allX = [initialX0];
    const stepsToConsider = steps.slice(0, currentIter);
    stepsToConsider.forEach((s) => {
      if (isFinite(s.xi)) allX.push(s.xi);
      if (isFinite(s.gxi)) allX.push(s.gxi);
    });

    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);

    if (zoomToCluster && currentStep) {
      const center = currentStep.gxi;
      const span = Math.abs(currentStep.gxi - currentStep.xi) * 3 || 0.5;
      minX = center - span;
      maxX = center + span;
    } else {
      const span = maxX - minX || 2;
      const pad = span * 0.35 || 1;
      minX -= pad;
      maxX += pad;
    }

    // Generate sampling points for y = g(x)
    const N = 400;
    const stepX = (maxX - minX) / (N - 1);
    const xs: number[] = [];
    const yg: (number | null)[] = [];
    const validYs: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = minX + i * stepX;
      xs.push(x);
      const y = evalG(x);
      if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1e5) {
        yg.push(y);
        validYs.push(y);
      } else {
        yg.push(null);
      }
    }

    let minY = minX;
    let maxY = maxX;
    if (validYs.length > 0) {
      const gMin = Math.min(...validYs);
      const gMax = Math.max(...validYs);
      minY = Math.min(minX, gMin);
      maxY = Math.max(maxX, gMax);
      const spanY = maxY - minY;
      const padY = spanY * 0.15 || 1;
      minY -= padY;
      maxY += padY;
    }

    return {
      plotXMin: minX,
      plotXMax: maxX,
      xValues: xs,
      yGValues: yg,
      yMinPlot: Math.max(-100, minY),
      yMaxPlot: Math.min(100, maxY),
    };
  }, [initialX0, steps, currentIter, zoomToCluster, currentStep, evalG]);

  // Construct Traces
  const plotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [];

    // 1. Diagonal Line y = x (Fixed Point Reference)
    traces.push({
      x: [plotXMin, plotXMax],
      y: [plotXMin, plotXMax],
      type: 'scatter',
      mode: 'lines',
      name: 'y = x (Fixed Points)',
      line: {
        color: '#64748B',
        width: 2,
        dash: 'dash',
      },
      hovertemplate: '<b>y = x</b>: %{y:.4f}<extra></extra>',
    });

    // 2. Iteration Function y = g(x) (Luminous Emerald)
    traces.push({
      x: xValues,
      y: yGValues,
      type: 'scatter',
      mode: 'lines',
      name: `g(x) = ${exprGStr}`,
      line: {
        color: '#10b981',
        width: 3,
      },
      hovertemplate: `<b>g(x)</b>: %{y:.5f}<br>x: %{x:.5f}<extra></extra>`,
    });

    // 3. Ghost Cobweb Steps (prior iterations)
    if (showAllSteps && currentIter > 1) {
      const ghostXs: number[] = [];
      const ghostYs: number[] = [];

      for (let i = 0; i < currentIter - 1; i++) {
        const s = steps[i];
        if (i === 0) {
          ghostXs.push(s.xi, s.xi, s.gxi);
          ghostYs.push(0, s.gxi, s.gxi);
        } else {
          ghostXs.push(s.xi, s.xi, s.gxi);
          ghostYs.push(s.xi, s.gxi, s.gxi);
        }
      }

      traces.push({
        x: ghostXs,
        y: ghostYs,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Prior Steps (Ghost)',
        line: {
          color: 'rgba(148, 163, 184, 0.45)',
          width: 1.5,
          dash: 'dot',
        },
        marker: {
          size: 4,
          color: 'rgba(148, 163, 184, 0.45)',
        },
        hoverinfo: 'skip',
      });
    }

    // 4. Active Step Cobweb / Staircase (Amber Gold)
    if (currentStep) {
      const activeXs: number[] = [];
      const activeYs: number[] = [];

      if (currentIter === 1) {
        // From (x0, 0) up to (x0, g(x0)), then horizontal to (g(x0), g(x0))
        activeXs.push(currentStep.xi, currentStep.xi, currentStep.gxi);
        activeYs.push(0, currentStep.gxi, currentStep.gxi);
      } else {
        // From (xi, xi) on y=x to (xi, g(xi)), then horizontal to (g(xi), g(xi)) on y=x
        activeXs.push(currentStep.xi, currentStep.xi, currentStep.gxi);
        activeYs.push(currentStep.xi, currentStep.gxi, currentStep.gxi);
      }

      traces.push({
        x: activeXs,
        y: activeYs,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Active Step ${currentIter}`,
        line: {
          color: '#fbbf24', // Amber gold
          width: 2.8,
        },
        marker: {
          size: 7,
          color: '#fbbf24',
        },
        hovertemplate: `<b>Cobweb Step ${currentIter}</b><br>x: %{x:.5f}<br>y: %{y:.5f}<extra></extra>`,
      });

      // Point on g(x): (xi, g(xi))
      traces.push({
        x: [currentStep.xi],
        y: [currentStep.gxi],
        type: 'scatter',
        mode: 'markers',
        name: `g(x_${currentIter - 1})`,
        marker: {
          size: 11,
          color: '#10b981',
          symbol: 'diamond',
          line: {
            color: '#fbbf24',
            width: 2,
          },
        },
        hovertemplate: `<b>Evaluation Point</b><br>x_${currentIter - 1}: %{x:.5f}<br>g(x): %{y:.5f}<extra></extra>`,
      });

      // New Estimate on y = x: (x_{i+1}, x_{i+1})
      traces.push({
        x: [currentStep.gxi],
        y: [currentStep.gxi],
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
        text: [`x_${currentIter} = ${currentStep.gxi.toFixed(4)}`],
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
    yGValues,
    exprGStr,
    showAllSteps,
    currentIter,
    steps,
    currentStep,
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
        title: { text: 'y', font: { size: 12, color: '#a1a1aa' } },
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
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            y = g(x) Curve
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/5 text-stone-300 border border-white/10">
            y = x Diagonal
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Cobweb Staircase
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-mono text-stone-400 flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAllSteps}
              onChange={(e) => setShowAllSteps(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Show ghost steps</span>
          </label>

          <label className="text-xs font-mono text-stone-400 flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={zoomToCluster}
              onChange={(e) => setZoomToCluster(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <ZoomIn className="w-3.5 h-3.5 text-stone-400" />
            <span>Focus point</span>
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
