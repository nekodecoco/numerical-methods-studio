'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { TaylorStep } from '@/lib/taylor';
import { Eye, EyeOff, Layers, Sparkles, ZoomIn, RotateCcw } from 'lucide-react';

// Dynamic import with SSR disabled for Plotly.js using lightweight factory bundle
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
          <span className="text-sm font-medium">Initializing Modern Plot Canvas...</span>
        </div>
      </div>
    ),
  }
);

interface TaylorPlotProps {
  originalExpr: string;
  evalOriginal: (x: number) => number;
  steps: TaylorStep[];
  currentOrder: number;
  a: number;
  xMin: number;
  xMax: number;
}

export const TaylorPlot: React.FC<TaylorPlotProps> = ({
  originalExpr,
  evalOriginal,
  steps,
  currentOrder,
  a,
  xMin,
  xMax,
}) => {
  const [showGhost, setShowGhost] = useState(true);
  const [showErrorRegion, setShowErrorRegion] = useState(false);
  const [progressRatio, setProgressRatio] = useState(1);
  const animRef = useRef<number | null>(null);

  // Progressive reveal animation whenever currentOrder changes
  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || currentOrder === 0) {
      setProgressRatio(1);
      return;
    }

    // Cancel prior animation if still running
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const duration = 340; // 340ms: snappy, classroom friendly
    const startTime = performance.now();
    setProgressRatio(0.05);

    const animateTrace = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setProgressRatio(eased);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animateTrace);
      } else {
        setProgressRatio(1);
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(animateTrace);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [currentOrder]);

  // Compute coordinate domain and curve values
  const {
    xValues,
    yOriginal,
    yCurrentPoly,
    yPrevPoly,
    yMinPlot,
    yMaxPlot,
    currentStep,
    prevStep,
    maxError,
  } = useMemo(() => {
    const N = 400;
    const stepX = (xMax - xMin) / (N - 1);
    const xs: number[] = [];
    const yOrig: (number | null)[] = [];
    const validOrigYs: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = xMin + i * stepX;
      xs.push(x);
      const yo = evalOriginal(x);
      if (isFinite(yo) && !isNaN(yo)) {
        yOrig.push(yo);
        // Only consider reasonable values for Y-axis scaling
        if (Math.abs(yo) < 1000) {
          validOrigYs.push(yo);
        }
      } else {
        yOrig.push(null);
      }
    }

    // Determine smart Y range based on original function
    let minY = -5;
    let maxY = 5;
    if (validOrigYs.length > 0) {
      minY = Math.min(...validOrigYs);
      maxY = Math.max(...validOrigYs);
      const span = maxY - minY;
      const padding = span > 0.001 ? span * 0.25 : 2;
      minY -= padding;
      maxY += padding;
    }

    // Safeguard against flat or inverted limits
    if (maxY - minY < 1) {
      minY -= 1;
      maxY += 1;
    }

    // Clamp range to prevent wild polynomial explosions from distorting the chart
    const safeMinY = Math.max(-100, minY);
    const safeMaxY = Math.min(100, maxY);

    // Current and Previous polynomial curves
    const currStep = steps[currentOrder] || null;
    const prStep = currentOrder > 0 ? steps[currentOrder - 1] : null;

    const yCurr: (number | null)[] = [];
    const yPrev: (number | null)[] = [];
    let peakError = 0;

    for (let i = 0; i < N; i++) {
      const x = xs[i];
      if (currStep) {
        const yc = currStep.evalPolynomial(x);
        yCurr.push(isFinite(yc) && !isNaN(yc) ? yc : null);

        const yo = yOrig[i];
        if (yo !== null && isFinite(yc) && !isNaN(yc)) {
          const err = Math.abs(yo - yc);
          if (err > peakError && isFinite(err)) {
            peakError = err;
          }
        }
      } else {
        yCurr.push(null);
      }

      if (prStep) {
        const yp = prStep.evalPolynomial(x);
        yPrev.push(isFinite(yp) && !isNaN(yp) ? yp : null);
      } else {
        yPrev.push(null);
      }
    }

    return {
      xValues: xs,
      yOriginal: yOrig,
      yCurrentPoly: yCurr,
      yPrevPoly: yPrev,
      yMinPlot: safeMinY,
      yMaxPlot: safeMaxY,
      currentStep: currStep,
      prevStep: prStep,
      maxError: peakError,
    };
  }, [xMin, xMax, evalOriginal, steps, currentOrder]);

  // Sliced coordinates for the progressive draw animation
  const { animatedX, animatedYCurr } = useMemo(() => {
    if (progressRatio >= 1) {
      return { animatedX: xValues, animatedYCurr: yCurrentPoly };
    }
    const count = Math.max(2, Math.floor(xValues.length * progressRatio));
    return {
      animatedX: xValues.slice(0, count),
      animatedYCurr: yCurrentPoly.slice(0, count),
    };
  }, [progressRatio, xValues, yCurrentPoly]);

  // Expansion point (a, f(a))
  const fa = useMemo(() => {
    const val = evalOriginal(a);
    return isFinite(val) && !isNaN(val) ? val : 0;
  }, [evalOriginal, a]);

  // Build Plotly Traces with modern styling
  const plotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [];

    // 1. Shaded Error Region between f(x) and P_n(x) (if toggled)
    if (showErrorRegion && currentStep) {
      traces.push({
        x: xValues,
        y: yOriginal,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'transparent' },
        showlegend: false,
        hoverinfo: 'skip',
      });
      traces.push({
        x: xValues,
        y: yCurrentPoly,
        type: 'scatter',
        mode: 'lines',
        fill: 'tonexty',
        fillcolor: 'rgba(217, 119, 6, 0.14)',
        line: { color: 'transparent' },
        name: 'Approximation Error Area',
        hoverinfo: 'skip',
      });
    }

    // 2. Ghost Curve: Previous Order Polynomial P_{n-1}(x)
    if (showGhost && prevStep && currentOrder > 0) {
      traces.push({
        x: xValues,
        y: yPrevPoly,
        type: 'scatter',
        mode: 'lines',
        name: `P${prevStep.order}(x) (Ghost Order ${prevStep.order})`,
        line: {
          color: 'rgba(148, 163, 184, 0.75)', // Muted slate ghost
          width: 2,
          dash: 'dash',
        },
        hovertemplate: `<b>Previous P${prevStep.order}(x)</b>: %{y:.4f}<extra></extra>`,
      });
    }

    // 3. True Function f(x) (Solid Royal Maroon)
    traces.push({
      x: xValues,
      y: yOriginal,
      type: 'scatter',
      mode: 'lines',
      name: `f(x) = ${originalExpr}`,
      line: {
        color: '#800020', // Academic Royal Maroon
        width: 3.5,
      },
      hovertemplate: `<b>f(x)</b>: %{y:.4f}<extra></extra>`,
    });

    // 4. Current Taylor Polynomial P_n(x) (Luminous Gold / Amber)
    if (currentStep) {
      traces.push({
        x: animatedX,
        y: animatedYCurr,
        type: 'scatter',
        mode: 'lines',
        name: `P${currentOrder}(x) (Order ${currentOrder})`,
        line: {
          color: '#D97706', // Warm Amber Gold
          width: 3.5,
        },
        hovertemplate: `<b>P${currentOrder}(x)</b>: %{y:.4f}<extra></extra>`,
      });
    }

    // 5. Expansion Point Marker (a, f(a)) with pulse aesthetic
    traces.push({
      x: [a],
      y: [fa],
      type: 'scatter',
      mode: 'markers+text',
      name: `Center a = ${a}`,
      marker: {
        size: 14,
        color: '#800020',
        symbol: 'circle',
        line: {
          color: '#F59E0B',
          width: 3.5,
        },
      },
      text: [`a = ${a}`],
      textposition: 'top center',
      textfont: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#800020',
      },
      hovertemplate: `<b>Expansion Center</b><br>a: %{x}<br>f(a): %{y:.4f}<extra></extra>`,
    });

    return traces;
  }, [
    showErrorRegion,
    currentStep,
    xValues,
    yOriginal,
    yCurrentPoly,
    showGhost,
    prevStep,
    currentOrder,
    yPrevPoly,
    originalExpr,
    animatedX,
    animatedYCurr,
    a,
    fa,
  ]);

  // Modern Plotly layout configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plotLayout: any = useMemo(
    () => ({
      autosize: true,
      height: 520,
      margin: { l: 55, r: 25, t: 45, b: 50 },
      paper_bgcolor: 'rgba(255, 255, 255, 0)',
      plot_bgcolor: '#FAFBFC',
      font: {
        family: 'var(--font-geist-sans), Inter, system-ui, -apple-system, sans-serif',
        color: '#475569',
      },
      xaxis: {
        title: { text: 'x', font: { size: 13, color: '#475569' } },
        range: [xMin, xMax],
        fixedrange: false,
        showgrid: true,
        gridcolor: '#EDF2F7',
        gridwidth: 1.2,
        zeroline: true,
        zerolinecolor: '#CBD5E1',
        zerolinewidth: 1.5,
        tickfont: { size: 11, color: '#64748B' },
      },
      yaxis: {
        title: { text: 'y', font: { size: 13, color: '#475569' } },
        range: [yMinPlot, yMaxPlot],
        showgrid: true,
        gridcolor: '#EDF2F7',
        gridwidth: 1.2,
        zeroline: true,
        zerolinecolor: '#CBD5E1',
        zerolinewidth: 1.5,
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
    [xMin, xMax, yMinPlot, yMaxPlot]
  );

  return (
    <div className="relative w-full rounded-2xl bg-white border border-stone-200/90 shadow-xl shadow-stone-200/40 overflow-hidden backdrop-blur-sm">
      {/* Sleek Top Floating HUD */}
      <div className="px-5 py-3.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-50/80 via-white to-stone-50/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
              f(x) Royal Maroon
            </span>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300/60">
              P{currentOrder}(x) Luminous Gold
            </span>
          </div>

          {currentOrder > 0 && (
            <span className="hidden sm:inline-flex text-xs text-stone-500 font-mono bg-stone-100 px-2 py-0.5 rounded">
              Peak Interval Gap: {maxError > 1000 ? '>1000' : maxError.toFixed(4)}
            </span>
          )}
        </div>

        {/* Quick HUD Action Toggles */}
        <div className="flex items-center gap-2">
          {currentOrder > 0 && (
            <button
              onClick={() => setShowGhost(!showGhost)}
              title="Toggle ghost curve of previous order"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                showGhost
                  ? 'bg-stone-200 text-stone-800'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
              }`}
            >
              {showGhost ? <Eye className="w-3.5 h-3.5 text-stone-700" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Ghost P{currentOrder - 1}</span>
            </button>
          )}

          <button
            onClick={() => setShowErrorRegion(!showErrorRegion)}
            title="Highlight approximation error region between f(x) and Pn(x)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              showErrorRegion
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Error Area</span>
          </button>
        </div>
      </div>

      {/* Plot Canvas */}
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

        {/* Dynamic Watermark / Order Indicator */}
        <div className="absolute bottom-4 right-4 pointer-events-none select-none">
          <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/70 shadow-sm text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              Polynomial Order
            </div>
            <div className="text-lg font-bold text-[#800020] font-mono leading-none">
              n = {currentOrder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
