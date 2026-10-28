'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { RootFindingStep } from '@/lib/rootFinding';
import { Eye, EyeOff, Layers, ZoomIn, Target, Sparkles } from 'lucide-react';

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
      <div className="w-full h-[520px] flex items-center justify-center bg-stone-50/50 rounded-2xl border border-stone-200/80">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <div className="w-8 h-8 border-3 border-[#800020] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Modern Root Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface RootFindingPlotProps {
  method: 'bisection' | 'false-position';
  originalExpr: string;
  evalOriginal: (x: number) => number;
  currentStep: RootFindingStep | null;
  prevStep: RootFindingStep | null;
  initialXl: number;
  initialXu: number;
}

export const RootFindingPlot: React.FC<RootFindingPlotProps> = ({
  method,
  originalExpr,
  evalOriginal,
  currentStep,
  prevStep,
  initialXl,
  initialXu,
}) => {
  const [showDiscardedArea, setShowDiscardedArea] = useState(true);
  const [zoomToBracket, setZoomToBracket] = useState(false);

  const {
    xl,
    xu,
    xr,
    fxl,
    fxu,
    fxr,
    iteration,
  } = currentStep || {
    xl: initialXl,
    xu: initialXu,
    xr: (initialXl + initialXu) / 2,
    fxl: evalOriginal(initialXl),
    fxu: evalOriginal(initialXu),
    fxr: evalOriginal((initialXl + initialXu) / 2),
    iteration: 0,
  };

  // Determine domain range
  const { plotXMin, plotXMax, xValues, yOriginal, yMinPlot, yMaxPlot } = useMemo(() => {
    let domainMin = initialXl;
    let domainMax = initialXu;

    if (zoomToBracket && currentStep) {
      const span = xu - xl;
      const pad = span * 0.4 || 0.5;
      domainMin = xl - pad;
      domainMax = xu + pad;
    } else {
      const span = initialXu - initialXl;
      const pad = span * 0.25 || 1;
      domainMin = initialXl - pad;
      domainMax = initialXu + pad;
    }

    const N = 400;
    const stepX = (domainMax - domainMin) / (N - 1);
    const xs: number[] = [];
    const ys: (number | null)[] = [];
    const validYs: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = domainMin + i * stepX;
      xs.push(x);
      const y = evalOriginal(x);
      if (isFinite(y) && !isNaN(y)) {
        ys.push(y);
        if (Math.abs(y) < 1000) {
          validYs.push(y);
        }
      } else {
        ys.push(null);
      }
    }

    let minY = -5;
    let maxY = 5;
    if (validYs.length > 0) {
      minY = Math.min(...validYs);
      maxY = Math.max(...validYs);
      const span = maxY - minY;
      const pad = span > 0.001 ? span * 0.25 : 2;
      minY -= pad;
      maxY += pad;
    }

    // Ensure 0 is nicely situated in view
    if (minY > -0.5) minY = -0.5;
    if (maxY < 0.5) maxY = 0.5;

    return {
      plotXMin: domainMin,
      plotXMax: domainMax,
      xValues: xs,
      yOriginal: ys,
      yMinPlot: Math.max(-100, minY),
      yMaxPlot: Math.min(100, maxY),
    };
  }, [initialXl, initialXu, zoomToBracket, currentStep, xl, xu, evalOriginal]);

  // Construct Plotly Traces
  const plotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [];

    // 1. Shaded Discarded / Active Interval
    if (showDiscardedArea && currentStep) {
      // Highlight active bracket [xl, xu]
      traces.push({
        x: [xl, xl, xu, xu],
        y: [yMinPlot, yMaxPlot, yMaxPlot, yMinPlot],
        fill: 'toself',
        fillcolor: 'rgba(217, 119, 6, 0.09)', // Warm gold active bracket
        line: { color: 'transparent' },
        name: `Active Bracket [${xl.toFixed(3)}, ${xu.toFixed(3)}]`,
        hoverinfo: 'skip',
      });
    }

    // 2. Zero Reference Axis (y = 0)
    traces.push({
      x: [plotXMin, plotXMax],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#64748B',
        width: 1.5,
        dash: 'dot',
      },
      name: 'Zero Axis (y = 0)',
      hoverinfo: 'skip',
    });

    // 3. True Function f(x) (Royal Maroon)
    traces.push({
      x: xValues,
      y: yOriginal,
      type: 'scatter',
      mode: 'lines',
      name: `f(x) = ${originalExpr}`,
      line: {
        color: '#800020',
        width: 3.5,
      },
      hovertemplate: `<b>f(x)</b>: %{y:.5f}<br>x: %{x:.5f}<extra></extra>`,
    });

    // 4. Ghost Secant Line (False Position only, if prevStep exists)
    if (method === 'false-position' && prevStep) {
      const prevXl = prevStep.xl;
      const prevXu = prevStep.xu;
      const prevFxl = prevStep.fxl;
      const prevFxu = prevStep.fxu;
      traces.push({
        x: [prevXl, prevXu],
        y: [prevFxl, prevFxu],
        type: 'scatter',
        mode: 'lines',
        name: `Prev Secant (Iter ${prevStep.iteration})`,
        line: {
          color: 'rgba(148, 163, 184, 0.7)',
          width: 2,
          dash: 'dash',
        },
        hovertemplate: `<b>Previous Secant Line</b><extra></extra>`,
      });
    }

    // 5. Active Secant Line (False Position only)
    if (method === 'false-position') {
      traces.push({
        x: [xl, xu],
        y: [fxl, fxu],
        type: 'scatter',
        mode: 'lines+markers',
        name: `Secant Chord (Iter ${iteration})`,
        line: {
          color: '#D97706', // Amber gold
          width: 3,
        },
        marker: {
          size: 8,
          color: '#D97706',
        },
        hovertemplate: `<b>Secant Chord Point</b><br>x: %{x:.4f}<br>y: %{y:.4f}<extra></extra>`,
      });
    }

    // 6. Vertical Bracket Guidelines for xl and xu
    // Left bound xl (Blue)
    traces.push({
      x: [xl, xl],
      y: [0, fxl],
      type: 'scatter',
      mode: 'lines+markers',
      name: `xl = ${xl.toFixed(4)}`,
      line: {
        color: '#2563EB', // Blue
        width: 2.2,
        dash: 'dash',
      },
      marker: {
        size: 9,
        color: '#2563EB',
        symbol: 'circle',
      },
      hovertemplate: `<b>Left Bracket xl</b>: %{x:.5f}<br>f(xl): %{y:.5f}<extra></extra>`,
    });

    // Right bound xu (Purple)
    traces.push({
      x: [xu, xu],
      y: [0, fxu],
      type: 'scatter',
      mode: 'lines+markers',
      name: `xu = ${xu.toFixed(4)}`,
      line: {
        color: '#9333EA', // Purple
        width: 2.2,
        dash: 'dash',
      },
      marker: {
        size: 9,
        color: '#9333EA',
        symbol: 'circle',
      },
      hovertemplate: `<b>Right Bracket xu</b>: %{x:.5f}<br>f(xu): %{y:.5f}<extra></extra>`,
    });

    // 7. Root Estimate xr Point & Vertical Line (Gold)
    traces.push({
      x: [xr, xr],
      y: [0, fxr],
      type: 'scatter',
      mode: 'lines',
      name: `xr Vertical Drop`,
      showlegend: false,
      line: {
        color: '#D97706',
        width: 2,
        dash: 'dot',
      },
      hoverinfo: 'skip',
    });

    // Marked Point at (xr, 0)
    traces.push({
      x: [xr],
      y: [0],
      type: 'scatter',
      mode: 'markers+text',
      name: `Root Est xr = ${xr.toFixed(4)}`,
      marker: {
        size: 15,
        color: '#800020',
        symbol: 'circle',
        line: {
          color: '#F59E0B',
          width: 3.5,
        },
      },
      text: [`xr = ${xr.toFixed(4)}`],
      textposition: 'top center',
      textfont: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#800020',
        weight: 700,
      },
      hovertemplate: `<b>Root Estimate xr (Iter ${iteration})</b><br>xr: %{x:.6f}<br>f(xr): ${fxr.toFixed(6)}<extra></extra>`,
    });

    return traces;
  }, [
    showDiscardedArea,
    currentStep,
    xl,
    xu,
    xr,
    fxl,
    fxu,
    fxr,
    iteration,
    plotXMin,
    plotXMax,
    yMinPlot,
    yMaxPlot,
    xValues,
    yOriginal,
    originalExpr,
    method,
    prevStep,
  ]);

  // Layout configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plotLayout: any = useMemo(
    () => ({
      autosize: true,
      height: 520,
      margin: { l: 55, r: 25, t: 45, b: 50 },
      paper_bgcolor: 'rgba(255, 255, 255, 0)',
      plot_bgcolor: '#FAFBFC',
      font: {
        family: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#475569',
      },
      xaxis: {
        title: { text: 'x', font: { size: 13, color: '#475569' } },
        range: [plotXMin, plotXMax],
        fixedrange: false,
        showgrid: true,
        gridcolor: '#EDF2F7',
        gridwidth: 1.2,
        zeroline: true,
        zerolinecolor: '#94A3B8',
        zerolinewidth: 2,
        tickfont: { size: 11, color: '#64748B' },
      },
      yaxis: {
        title: { text: 'f(x)', font: { size: 13, color: '#475569' } },
        range: [yMinPlot, yMaxPlot],
        showgrid: true,
        gridcolor: '#EDF2F7',
        gridwidth: 1.2,
        zeroline: true,
        zerolinecolor: '#94A3B8',
        zerolinewidth: 2,
        tickfont: { size: 11, color: '#64748B' },
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.12,
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        bordercolor: '#E2E8F0',
        borderwidth: 1,
        font: { size: 11.5, color: '#334155' },
      },
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#0F172A',
        font: { color: '#FFFFFF', size: 12 },
        bordercolor: 'transparent',
      },
    }),
    [plotXMin, plotXMax, yMinPlot, yMaxPlot]
  );

  return (
    <div className="relative w-full rounded-2xl bg-white border border-stone-200/90 shadow-xl shadow-stone-200/40 overflow-hidden">
      {/* Top Floating HUD */}
      <div className="px-5 py-3.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-50/80 via-white to-stone-50/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            xl: {xl.toFixed(4)}
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            xu: {xu.toFixed(4)}
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            xr: {xr.toFixed(4)}
          </span>
          {currentStep?.ea !== null && currentStep?.ea !== undefined && (
            <span className="hidden sm:inline-flex text-xs text-stone-500 font-mono bg-stone-100 px-2 py-0.5 rounded">
              εa: {currentStep.ea < 0.001 ? currentStep.ea.toExponential(2) : currentStep.ea.toFixed(3)}%
            </span>
          )}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDiscardedArea(!showDiscardedArea)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              showDiscardedArea
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bracket Band</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomToBracket(!zoomToBracket)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              zoomToBracket
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{zoomToBracket ? 'Global View' : 'Focus Bracket'}</span>
          </button>
        </div>
      </div>

      {/* Plotly Canvas */}
      <div className="w-full relative min-h-[520px]">
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Corner Watermark */}
        <div className="absolute bottom-4 right-4 pointer-events-none select-none">
          <div className="bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-sm text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              Iteration Step
            </div>
            <div className="text-lg font-bold text-[#800020] font-mono leading-none">
              i = {iteration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
