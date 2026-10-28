import * as math from 'mathjs';
import { normalizeExpression, formatNum } from './taylor';

export interface RootFindingStep {
  iteration: number;
  xl: number;
  xu: number;
  xr: number;
  fxl: number;
  fxu: number;
  fxr: number;
  signTest: number; // f(xl) * f(xr)
  ea: number | null; // Approximate relative error in percent (%)
  et: number | null; // True error if true root provided
  subinterval: 'left' | 'right' | 'exact';
  // For False Position secant line equation: y = m*x + b
  secantSlope?: number;
  secantIntercept?: number;
}

export interface RootFindingResult {
  method: 'bisection' | 'false-position';
  exprStr: string;
  originalLatex: string;
  evalOriginal: (x: number) => number;
  steps: RootFindingStep[];
  bracketValid: boolean;
  bracketMessage?: string;
  converged: boolean;
  finalRoot: number | null;
  error?: string;
}

export interface RootFindingPreset {
  label: string;
  mathDisplay: string;
  expr: string;
  defaultXl: number;
  defaultXu: number;
  description: string;
}

export const BISECTION_PRESETS: RootFindingPreset[] = [
  {
    label: 'Cubic Polynomial',
    mathDisplay: 'x^3 - x - 2',
    expr: 'x^3 - x - 2',
    defaultXl: 1,
    defaultXu: 2,
    description: 'Classic textbook polynomial with a single real root near x ≈ 1.521.',
  },
  {
    label: 'Chapra Parachutist',
    mathDisplay: '\\frac{9.8 \\cdot 68.1}{c}(1 - e^{-(c/68.1)10}) - 40',
    expr: '(9.8 * 68.1 / x) * (1 - exp(-(x / 68.1) * 10)) - 40',
    defaultXl: 12,
    defaultXu: 16,
    description: 'Bungee/parachutist drag coefficient problem from Chapra Numerical Methods (root ≈ 14.78).',
  },
  {
    label: 'Transcendental',
    mathDisplay: 'e^{-x} - x',
    expr: 'exp(-x) - x',
    defaultXl: 0,
    defaultXu: 1,
    description: 'Exponential decay intersection with diagonal (root ≈ 0.56714).',
  },
  {
    label: 'Trigonometric',
    mathDisplay: '\\cos(x) - x',
    expr: 'cos(x) - x',
    defaultXl: 0,
    defaultXu: 1,
    description: 'The Dottie number root where cos(x) = x (root ≈ 0.739085).',
  },
  {
    label: 'Nonlinear Quadratic',
    mathDisplay: '-0.5x^2 + 2.5x + 4.5',
    expr: '-0.5*x^2 + 2.5*x + 4.5',
    defaultXl: 5,
    defaultXu: 7,
    description: 'Parabola with distinct roots (positive root near x ≈ 6.405).',
  },
];

export const FALSE_POSITION_PRESETS: RootFindingPreset[] = [
  {
    label: 'Standard Polynomial',
    mathDisplay: 'x^3 - x - 2',
    expr: 'x^3 - x - 2',
    defaultXl: 1,
    defaultXu: 2,
    description: 'Fast convergence for False Position, locating root near x ≈ 1.521 in fewer steps than Bisection.',
  },
  {
    label: 'One-Sided Stagnant (x^10 - 1)',
    mathDisplay: 'x^{10} - 1',
    expr: 'x^10 - 1',
    defaultXl: 0,
    defaultXu: 1.3,
    description: 'Famous cautionary example! Extreme convexity causes xu to stagnate at 1.3, making False Position crawl very slowly.',
  },
  {
    label: 'Transcendental',
    mathDisplay: 'x \\cdot e^x - 1',
    expr: 'x * exp(x) - 1',
    defaultXl: 0,
    defaultXu: 1,
    description: 'Lambert-W related root where x*e^x = 1 (root ≈ 0.56714).',
  },
  {
    label: 'Chapra Floating Sphere',
    mathDisplay: 'x^3 - 0.165x^2 + 3.993 \\times 10^{-4}',
    expr: 'x^3 - 0.165*x^2 + 3.993e-4',
    defaultXl: 0,
    defaultXu: 0.11,
    description: 'Depth to which a floating ball of radius 0.055m sinks in water (root ≈ 0.0623m).',
  },
  {
    label: 'Logarithmic Root',
    mathDisplay: 'x \\ln(x) - 1',
    expr: 'x * log(x) - 1',
    defaultXl: 1,
    defaultXu: 2,
    description: 'Root of x*ln(x) = 1 (root ≈ 1.76322).',
  },
];

/**
 * Executes bracketing root-finding (Bisection or False Position) up to maxIterations
 */
export function solveRootFinding(
  method: 'bisection' | 'false-position',
  exprStr: string,
  initialXl: number,
  initialXu: number,
  maxIterations: number = 20,
  stoppingToleranceEa: number = 0.0001 // 0.0001%
): RootFindingResult {
  const normalized = normalizeExpression(exprStr);
  let baseNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      method,
      exprStr,
      originalLatex: '',
      evalOriginal: () => 0,
      steps: [],
      bracketValid: false,
      converged: false,
      finalRoot: null,
      error: `Parse error: ${msg}`,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprStr;
  }

  const compiledBase = baseNode.compile();
  const evalOriginal = (x: number): number => {
    try {
      const res = compiledBase.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const fxlInit = evalOriginal(initialXl);
  const fxuInit = evalOriginal(initialXu);

  if (isNaN(fxlInit) || isNaN(fxuInit)) {
    return {
      method,
      exprStr,
      originalLatex,
      evalOriginal,
      steps: [],
      bracketValid: false,
      bracketMessage: 'Function evaluated to NaN or is undefined at one of the interval endpoints.',
      converged: false,
      finalRoot: null,
    };
  }

  // Check Intermediate Value Theorem condition: f(xl) * f(xu) <= 0
  const initialProduct = fxlInit * fxuInit;
  if (initialProduct > 0) {
    return {
      method,
      exprStr,
      originalLatex,
      evalOriginal,
      steps: [],
      bracketValid: false,
      bracketMessage: `Bracketing condition violated: f(xl) = ${formatNum(fxlInit)} and f(xu) = ${formatNum(fxuInit)} have the same sign (product = ${formatNum(initialProduct)} > 0). Intermediate Value Theorem cannot guarantee a root in [${initialXl}, ${initialXu}].`,
      converged: false,
      finalRoot: null,
    };
  }

  let xl = initialXl;
  let xu = initialXu;
  let prevXr: number | null = null;
  const steps: RootFindingStep[] = [];
  let converged = false;

  for (let i = 1; i <= maxIterations; i++) {
    const fxl = evalOriginal(xl);
    const fxu = evalOriginal(xu);

    let xr: number;
    let secantSlope: number | undefined;
    let secantIntercept: number | undefined;

    if (method === 'bisection') {
      xr = (xl + xu) / 2;
    } else {
      // False Position formula: xr = xu - [fxu * (xl - xu)] / (fxl - fxu)
      const denominator = fxl - fxu;
      if (Math.abs(denominator) < 1e-15) {
        xr = (xl + xu) / 2; // fallback if slope is virtually flat
      } else {
        xr = xu - (fxu * (xl - xu)) / denominator;
      }

      // Secant line equation: y - fxl = m * (x - xl) => y = m*x + (fxl - m*xl)
      if (Math.abs(xu - xl) > 1e-15) {
        secantSlope = (fxu - fxl) / (xu - xl);
        secantIntercept = fxl - secantSlope * xl;
      }
    }

    const fxr = evalOriginal(xr);
    const signTest = fxl * fxr;

    // Approximate relative error: ea = |(xr - prevXr) / xr| * 100%
    let ea: number | null = null;
    if (prevXr !== null && Math.abs(xr) > 1e-15) {
      ea = Math.abs((xr - prevXr) / xr) * 100;
    }

    let subinterval: 'left' | 'right' | 'exact' = 'exact';
    if (Math.abs(fxr) < 1e-14 || Math.abs(signTest) < 1e-14) {
      subinterval = 'exact';
      converged = true;
    } else if (signTest < 0) {
      // Root lies in left subinterval [xl, xr] => xu becomes xr
      subinterval = 'left';
    } else {
      // Root lies in right subinterval [xr, xu] => xl becomes xr
      subinterval = 'right';
    }

    steps.push({
      iteration: i,
      xl,
      xu,
      xr,
      fxl,
      fxu,
      fxr,
      signTest,
      ea,
      et: null,
      subinterval,
      secantSlope,
      secantIntercept,
    });

    if (ea !== null && ea < stoppingToleranceEa) {
      converged = true;
    }

    if (converged && i >= 2) {
      break;
    }

    // Update interval for next round
    if (subinterval === 'left') {
      xu = xr;
    } else if (subinterval === 'right') {
      xl = xr;
    } else {
      break; // exact root found
    }

    prevXr = xr;
  }

  const finalRoot = steps.length > 0 ? steps[steps.length - 1].xr : null;

  return {
    method,
    exprStr,
    originalLatex,
    evalOriginal,
    steps,
    bracketValid: true,
    converged,
    finalRoot,
  };
}
