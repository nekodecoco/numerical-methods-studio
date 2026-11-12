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
      <div className="w-full h-[520px] flex items-center justify-center bg-[#0a0a0c] rounded-2xl border border-white/10">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Initializing Precision Canvas...</span>
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

    // 3. True Function f(x) (Solid Crimson Glow)
    traces.push({
      x: xValues,
      y: yOriginal,
      type: 'scatter',
      mode: 'lines',
      name: `f(x) = ${originalExpr}`,
      line: {
        color: '#f43f5e', // Vibrant Rose Crimson
        width: 3,
      },
      hovertemplate: `<b>f(x)</b>: %{y:.4f}<extra></extra>`,
    });

    // 4. Current Taylor Polynomial P_n(x) (Luminous Amber)
    if (currentStep) {
      traces.push({
        x: animatedX,
        y: animatedYCurr,
        type: 'scatter',
        mode: 'lines',
        name: `P${currentOrder}(x) (Order ${currentOrder})`,
        line: {
          color: '#fbbf24', // Luminous Amber Gold
          width: 3,
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
        size: 13,
        color: '#f43f5e',
        symbol: 'circle',
        line: {
          color: '#fbbf24',
          width: 2.5,
        },
      },
      text: [`a = ${a}`],
      textposition: 'top center',
      textfont: {
        family: 'var(--font-geist-mono), monospace',
        size: 11,
        color: '#fbbf24',
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
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: '#0a0a0c',
      font: {
        family: 'var(--font-geist-sans), Inter, system-ui, -apple-system, sans-serif',
        color: '#a1a1aa',
      },
      xaxis: {
        title: { text: 'x', font: { size: 12, color: '#a1a1aa' } },
        range: [xMin, xMax],
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
        y: 1.12,
        bgcolor: 'rgba(18, 18, 21, 0.85)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
        borderwidth: 1,
        font: { size: 11, color: '#e4e4e7' },
      },
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#18181b',
        font: { color: '#FFFFFF', size: 12 },
        bordercolor: 'rgba(255, 255, 255, 0.15)',
      },
    }),
    [xMin, xMax, yMinPlot, yMaxPlot]
  );

  return (
    <div className="relative w-full rounded-2xl bg-[#121215] border border-white/10 overflow-hidden">
      {/* Sleek Top Floating HUD */}
      <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              f(x) Crimson
            </span>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              P{currentOrder}(x) Gold
            </span>
          </div>

          {currentOrder > 0 && (
            <span className="hidden sm:inline-flex text-xs text-stone-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Peak Gap: {maxError > 1000 ? '>1000' : maxError.toFixed(4)}
            </span>
          )}
        </div>

        {/* Quick HUD Action Toggles */}
        <div className="flex items-center gap-2">
          {currentOrder > 0 && (
            <button
              onClick={() => setShowGhost(!showGhost)}
              title="Toggle ghost curve of previous order"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg transition-all border ${
                showGhost
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-black/40 text-stone-400 border-white/5 hover:bg-white/5'
              }`}
            >
              {showGhost ? <Eye className="w-3.5 h-3.5 text-stone-300" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Ghost P{currentOrder - 1}</span>
            </button>
          )}

          <button
            onClick={() => setShowErrorRegion(!showErrorRegion)}
            title="Highlight approximation error region between f(x) and Pn(x)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg transition-all border ${
              showErrorRegion
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-black/40 text-stone-400 border-white/5 hover:bg-white/5'
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
          <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-sm text-right">
            <div className="text-[10px] uppercase tracking-wider font-mono text-stone-500">
              Polynomial Order
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono leading-none mt-0.5">
              n = {currentOrder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
