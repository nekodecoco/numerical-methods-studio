import * as math from 'mathjs';
import { normalizeExpression, formatNum } from './taylor';

export interface OpenMethodPreset {
  label: string;
  mathDisplay: string;
  expr: string;
  defaultX0: number;
  description: string;
  note?: string;
}

export interface FixedPointCandidateG {
  id: string;
  label: string;
  expr: string;
  latex?: string;
  derivation: string;
  note: string;
  cobwebType?: 'staircase' | 'spiral' | 'divergent';
  defaultX0?: number;
}

export interface FixedPointProblem {
  id: string;
  label: string;
  equationMath: string;
  fExpr: string;
  description: string;
  defaultX0: number;
  expectedRoots?: number[];
  candidates: FixedPointCandidateG[];
}

export interface CandidateConvergenceEvaluation {
  exprGStr: string;
  originalLatex: string;
  derivativeLatex: string;
  gVal: number;
  gPrimeVal: number;
  absGPrime: number;
  status: 'converges' | 'diverges' | 'inconclusive' | 'invalid';
  isContractive: boolean;
  cobwebType: 'staircase' | 'spiral' | 'divergent';
  behaviorNote: string;
  error?: string;
}

export interface FixedPointStep {
  iteration: number;
  xi: number;
  gxi: number; // x_{i+1} = g(x_i)
  gPrimeXi: number; // g'(x_i)
  isContractive: boolean; // |g'(x_i)| < 1
  ea: number | null; // Approximate relative error in percent (%)
  // Coordinates for the cobweb/staircase diagram:
  // Step 1: Vertical line from (xi, xi) on y=x to (xi, g(xi)) on y=g(x)
  // Step 2: Horizontal line from (xi, g(xi)) to (g(xi), g(xi)) = (x_{i+1}, x_{i+1}) on y=x
  vertX: number;
  vertY0: number;
  vertY1: number;
  horizY: number;
  horizX0: number;
  horizX1: number;
}

export interface FixedPointResult {
  exprGStr: string;
  originalLatex: string;
  derivativeLatex: string;
  evalG: (x: number) => number;
  evalGPrime: (x: number) => number;
  steps: FixedPointStep[];
  converged: boolean;
  diverged: boolean;
  finalRoot: number | null;
  error?: string;
  warning?: string;
}

export interface NewtonRaphsonStep {
  iteration: number;
  xi: number;
  fxi: number;
  dfxi: number;
  xNext: number; // x_{i+1} = x_i - f(x_i)/f'(x_i)
  ea: number | null; // % error
  tangentSlope: number;
  tangentIntercept: number;
  zeroSlopeWarning?: boolean;
}

export interface NewtonRaphsonResult {
  exprFStr: string;
  originalLatex: string;
  derivativeLatex: string;
  evalF: (x: number) => number;
  evalDF: (x: number) => number;
  steps: NewtonRaphsonStep[];
  converged: boolean;
  diverged: boolean;
  finalRoot: number | null;
  error?: string;
  warning?: string;
}

export const FIXED_POINT_PRESETS: OpenMethodPreset[] = [
  {
    label: 'Exponential Decay: g(x) = e⁻ˣ',
    mathDisplay: 'g(x) = e^{-x}',
    expr: 'exp(-x)',
    defaultX0: 0,
    description: 'Classic textbook fixed-point iteration for f(x) = e⁻ˣ - x = 0. Spiral cobweb converging to x ≈ 0.56714.',
    note: '|g\'(x*)| = e⁻⁰·⁵⁶⁷ ≈ 0.567 < 1 (Contractive, Alternating Convergence)',
  },
  {
    label: 'Quadratic Sqrt: g(x) = √(x + 2)',
    mathDisplay: 'g(x) = \\sqrt{x + 2}',
    expr: 'sqrt(x + 2)',
    defaultX0: 1,
    description: 'Convergent rearrangement of x² - x - 2 = 0. Monotonic staircase converging to root x = 2.',
    note: '|g\'(2)| = 1 / (2√4) = 0.25 < 1 (Fast Monotonic Convergence)',
  },
  {
    label: 'Quadratic Rearrangement: g(x) = x² - 2 (Diverges!)',
    mathDisplay: 'g(x) = x^2 - 2',
    expr: 'x^2 - 2',
    defaultX0: 2.1,
    description: 'Cautionary divergence demonstration for x² - x - 2 = 0! Because |g\'(2)| = 4 > 1, the iteration rapidly blows up.',
    note: '|g\'(2)| = 4 > 1 (Expansive / Divergent)',
  },
  {
    label: 'Dottie Number: g(x) = cos(x)',
    mathDisplay: 'g(x) = \\cos(x)',
    expr: 'cos(x)',
    defaultX0: 0.5,
    description: 'Fixed point of the cosine function. Beautiful spiral cobweb winding inward to x ≈ 0.739085.',
    note: '|g\'(x*)| = |-sin(0.739)| ≈ 0.673 < 1 (Spiral Convergence)',
  },
  {
    label: 'Plastic Number: g(x) = (x + 1)¹/³',
    mathDisplay: 'g(x) = (x + 1)^{1/3}',
    expr: '(x + 1)^(1/3)',
    defaultX0: 1,
    description: 'Rearrangement of x³ - x - 1 = 0, discovering the plastic ratio x ≈ 1.32472.',
    note: '|g\'(x*)| ≈ 0.190 < 1 (Rapid Convergence)',
  },
];

export const FIXED_POINT_PROBLEMS: FixedPointProblem[] = [
  {
    id: 'quadratic',
    label: 'Quadratic: x² - x - 2 = 0',
    equationMath: 'x^2 - x - 2 = 0',
    fExpr: 'x^2 - x - 2',
    description: 'Standard textbook benchmark with roots at x = 2 and x = -1. Compares convergent vs runaway diverging algebraic forms.',
    defaultX0: 1,
    expectedRoots: [2, -1],
    candidates: [
      {
        id: 'quad-sqrt',
        label: 'Form 1: Square Root Isolation',
        expr: 'sqrt(x + 2)',
        latex: '\\sqrt{x + 2}',
        derivation: 'x^2 = x + 2 \\implies x = \\sqrt{x + 2}',
        note: 'Monotonic staircase convergence. |g\'(2)| = 0.25 < 1 (Contractive).',
        cobwebType: 'staircase',
        defaultX0: 1,
      },
      {
        id: 'quad-linear',
        label: 'Form 2: Linear Term Isolation (Diverges!)',
        expr: 'x^2 - 2',
        latex: 'x^2 - 2',
        derivation: 'Isolate linear x: x = x^2 - 2',
        note: 'Cautionary divergence! |g\'(2)| = 4 > 1 (Expansive). Rapid runaway blowup.',
        cobwebType: 'divergent',
        defaultX0: 2.1,
      },
      {
        id: 'quad-recip',
        label: 'Form 3: Factoring & Reciprocal',
        expr: '1 + 2/x',
        latex: '1 + \\frac{2}{x}',
        derivation: 'Divide by x: x - 1 - 2/x = 0 \\implies x = 1 + 2/x',
        note: 'Alternating spiral cobweb converging to x = 2. |g\'(2)| = 0.5 < 1.',
        cobwebType: 'spiral',
        defaultX0: 1.5,
      },
      {
        id: 'quad-factor',
        label: 'Form 4: Factored Linear Term (Diverges!)',
        expr: '2 / (x - 1)',
        latex: '\\frac{2}{x - 1}',
        derivation: 'Factor: x(x - 1) = 2 \\implies x = 2/(x - 1)',
        note: 'Divergent alternating iteration near x = 2: |g\'(2)| = 2 > 1.',
        cobwebType: 'divergent',
        defaultX0: 1.5,
      },
    ],
  },
  {
    id: 'burden-faires',
    label: 'Burden & Faires Benchmark: x³ + 4x² - 10 = 0',
    equationMath: 'x^3 + 4x^2 - 10 = 0',
    fExpr: 'x^3 + 4*x^2 - 10',
    description: 'The premier university benchmark from Burden & Faires Chapter 2.2. Compares 5 classic rearrangements for root p ≈ 1.36523.',
    defaultX0: 1.5,
    expectedRoots: [1.36523],
    candidates: [
      {
        id: 'bf-sqrt-cubic',
        label: 'Form A: Isolating 4x² Sqrt (Burden Form c)',
        expr: '0.5 * sqrt(10 - x^3)',
        latex: '\\frac{1}{2}\\sqrt{10 - x^3}',
        derivation: '4x^2 = 10 - x^3 \\implies x = \\frac{1}{2}\\sqrt{10 - x^3}',
        note: 'Converges smoothly! |g\'(p)| ≈ 0.154 < 1. Inward spiral cobweb.',
        cobwebType: 'spiral',
        defaultX0: 1.5,
      },
      {
        id: 'bf-factored-sqrt',
        label: 'Form B: Factoring x²(x + 4) (Burden Form d)',
        expr: 'sqrt(10 / (x + 4))',
        latex: '\\sqrt{\\frac{10}{x + 4}}',
        derivation: 'x^2(x + 4) = 10 \\implies x = \\sqrt{\\frac{10}{x + 4}}',
        note: 'Fast monotonic convergence! |g\'(p)| ≈ 0.123 < 1.',
        cobwebType: 'staircase',
        defaultX0: 1.5,
      },
      {
        id: 'bf-additive',
        label: 'Form C: Additive x = x - f(x) (Burden Form a - Diverges!)',
        expr: 'x - x^3 - 4*x^2 + 10',
        latex: 'x - x^3 - 4x^2 + 10',
        derivation: 'x = x - (x^3 + 4x^2 - 10)',
        note: 'Violent divergence! |g\'(1.5)| = 17.75 ≫ 1. Rapidly overflows.',
        cobwebType: 'divergent',
        defaultX0: 1.5,
      },
      {
        id: 'bf-cube-root',
        label: 'Form D: Isolating x³ Cube Root (Diverges!)',
        expr: '(10 - 4*x^2)^(1/3)',
        latex: '(10 - 4x^2)^{1/3}',
        derivation: 'x^3 = 10 - 4x^2 \\implies x = (10 - 4x^2)^{1/3}',
        note: 'Expansive near root: |g\'(1.365)| ≈ 1.34 > 1 (Diverges).',
        cobwebType: 'divergent',
        defaultX0: 1.5,
      },
      {
        id: 'bf-newton-fixed',
        label: 'Form E: Newton-Steffensen Fixed Point (Burden Form e)',
        expr: 'x - (x^3 + 4*x^2 - 10) / (3*x^2 + 8*x)',
        latex: 'x - \\frac{x^3 + 4x^2 - 10}{3x^2 + 8x}',
        derivation: 'x = x - f(x)/f\'(x)',
        note: 'Superfast quadratic convergence! Locates root p in only 3 iterations.',
        cobwebType: 'staircase',
        defaultX0: 1.5,
      },
    ],
  },
  {
    id: 'transcendental',
    label: 'Exponential Balance: e⁻ˣ - x = 0',
    equationMath: 'e^{-x} - x = 0',
    fExpr: 'exp(-x) - x',
    description: 'Classic transcendental equation discovering the Omega fixed point x ≈ 0.567143.',
    defaultX0: 0,
    expectedRoots: [0.567143],
    candidates: [
      {
        id: 'trans-exp',
        label: 'Form 1: Direct Exponential Isolation',
        expr: 'exp(-x)',
        latex: 'e^{-x}',
        derivation: 'Isolate x: x = e^{-x}',
        note: 'Iconic alternating spiral cobweb! |g\'(x*)| = e⁻⁰·⁵⁶⁷ ≈ 0.567 < 1.',
        cobwebType: 'spiral',
        defaultX0: 0,
      },
      {
        id: 'trans-log',
        label: 'Form 2: Natural Logarithm (Diverges!)',
        expr: '-log(x)',
        latex: '-\\ln(x)',
        derivation: 'Take ln of both sides: -x = ln(x) \\implies x = -\\ln(x)',
        note: 'Expansive spiral divergence: |g\'(0.567)| ≈ 1.763 > 1.',
        cobwebType: 'divergent',
        defaultX0: 0.5,
      },
      {
        id: 'trans-avg',
        label: 'Form 3: Averaging Relaxation',
        expr: '(x + exp(-x)) / 2',
        latex: '\\frac{x + e^{-x}}{2}',
        derivation: 'Average of x and e^{-x}: x = \\frac{x + e^{-x}}{2}',
        note: 'Accelerated convergence! Dampens spiral oscillations: |g\'| ≈ 0.216 < 1.',
        cobwebType: 'staircase',
        defaultX0: 0,
      },
    ],
  },
  {
    id: 'plastic-cubic',
    label: 'Plastic Ratio: x³ - x - 1 = 0',
    equationMath: 'x^3 - x - 1 = 0',
    fExpr: 'x^3 - x - 1',
    description: 'Discovers the unique real root known as the Plastic Ratio (Padovan constant) x ≈ 1.324718.',
    defaultX0: 1,
    expectedRoots: [1.324718],
    candidates: [
      {
        id: 'plastic-cube-root',
        label: 'Form 1: Cube Root Isolation',
        expr: '(x + 1)^(1/3)',
        latex: '(x + 1)^{1/3}',
        derivation: 'x^3 = x + 1 \\implies x = (x + 1)^{1/3}',
        note: 'Clean monotonic staircase! |g\'(1.325)| ≈ 0.190 < 1.',
        cobwebType: 'staircase',
        defaultX0: 1,
      },
      {
        id: 'plastic-linear',
        label: 'Form 2: Linear Isolation (Diverges!)',
        expr: 'x^3 - 1',
        latex: 'x^3 - 1',
        derivation: 'Isolate linear x: x = x^3 - 1',
        note: 'Runaway divergence: |g\'(1.325)| ≈ 5.265 > 1.',
        cobwebType: 'divergent',
        defaultX0: 1.2,
      },
      {
        id: 'plastic-recip',
        label: 'Form 3: Factoring Reciprocal (Diverges!)',
        expr: '1 / (x^2 - 1)',
        latex: '\\frac{1}{x^2 - 1}',
        derivation: 'Factor: x(x^2 - 1) = 1 \\implies x = 1/(x^2 - 1)',
        note: 'Severe divergence: |g\'(1.325)| ≈ 4.67 > 1.',
        cobwebType: 'divergent',
        defaultX0: 1.5,
      },
      {
        id: 'plastic-sqrt-recip',
        label: 'Form 4: Divided Sqrt Rearrangement',
        expr: 'sqrt(1 + 1/x)',
        latex: '\\sqrt{1 + \\frac{1}{x}}',
        derivation: 'Divide by x^2: x^2 = 1 + 1/x \\implies x = \\sqrt{1 + 1/x}',
        note: 'Alternating spiral convergence: |g\'(1.325)| ≈ 0.216 < 1.',
        cobwebType: 'spiral',
        defaultX0: 1,
      },
    ],
  },
  {
    id: 'trigonometric',
    label: 'Dottie Number: cos(x) - x = 0',
    equationMath: '\\cos(x) - x = 0',
    fExpr: 'cos(x) - x',
    description: 'Solves cos(x) = x, converging to the transcendental Dottie number x ≈ 0.739085.',
    defaultX0: 0.5,
    expectedRoots: [0.739085],
    candidates: [
      {
        id: 'dottie-cos',
        label: 'Form 1: Direct Cosine Iteration',
        expr: 'cos(x)',
        latex: '\\cos(x)',
        derivation: 'Isolate x: x = cos(x)',
        note: 'Iconic spiral cobweb winding inward! |g\'(0.739)| ≈ 0.673 < 1.',
        cobwebType: 'spiral',
        defaultX0: 0.5,
      },
      {
        id: 'dottie-acos',
        label: 'Form 2: Arccosine (Diverges!)',
        expr: 'acos(x)',
        latex: '\\arccos(x)',
        derivation: 'Take inverse cosine: x = arccos(x)',
        note: 'Expansive spiral: |g\'(0.739)| ≈ 1.485 > 1.',
        cobwebType: 'divergent',
        defaultX0: 0.7,
      },
      {
        id: 'dottie-avg',
        label: 'Form 3: Averaging Relaxation',
        expr: '(x + cos(x)) / 2',
        latex: '\\frac{x + \\cos(x)}{2}',
        derivation: 'Average iteration: x = \\frac{x + cos(x)}{2}',
        note: 'Fast, smooth convergence: |g\'(0.739)| ≈ 0.163 < 1.',
        cobwebType: 'staircase',
        defaultX0: 0.5,
      },
    ],
  },
  {
    id: 'two-roots',
    label: 'Two Real Roots: 2x² - 5x + 2 = 0',
    equationMath: '2x^2 - 5x + 2 = 0',
    fExpr: '2*x^2 - 5*x + 2',
    description: 'Demonstrates how different rearrangements converge to different roots (x = 2 or x = 0.5)!',
    defaultX0: 0.2,
    expectedRoots: [0.5, 2],
    candidates: [
      {
        id: 'two-linear',
        label: 'Form 1: Linear 5x Isolation (Targets x = 0.5)',
        expr: '(2*x^2 + 2) / 5',
        latex: '\\frac{2x^2 + 2}{5}',
        derivation: '5x = 2x^2 + 2 \\implies x = (2x^2 + 2)/5',
        note: 'Converges to root x = 0.5 (|g\'(0.5)| = 0.4 < 1), but diverges at root x = 2 (|g\'(2)| = 1.6 > 1).',
        cobwebType: 'staircase',
        defaultX0: 0.2,
      },
      {
        id: 'two-sqrt',
        label: 'Form 2: Sqrt Isolation (Targets x = 2)',
        expr: 'sqrt((5*x - 2) / 2)',
        latex: '\\sqrt{\\frac{5x - 2}{2}}',
        derivation: '2x^2 = 5x - 2 \\implies x = \\sqrt{(5x - 2)/2}',
        note: 'Converges to root x = 2 (|g\'(2)| = 0.625 < 1). Undefined for x < 0.4.',
        cobwebType: 'staircase',
        defaultX0: 1.5,
      },
      {
        id: 'two-factor',
        label: 'Form 3: Factoring Form (Targets x = 0.5)',
        expr: '2 / (5 - 2*x)',
        latex: '\\frac{2}{5 - 2x}',
        derivation: 'x(5 - 2x) = 2 \\implies x = 2/(5 - 2x)',
        note: 'Rapid convergence to x = 0.5 (|g\'(0.5)| = 0.25 < 1).',
        cobwebType: 'staircase',
        defaultX0: 0.1,
      },
    ],
  },
  {
    id: 'logarithmic',
    label: 'Logarithmic Balance: x - ln(x) - 2 = 0',
    equationMath: 'x - \\ln(x) - 2 = 0',
    fExpr: 'x - log(x) - 2',
    description: 'Two roots at x ≈ 3.14619 and x ≈ 0.15859. Different rearrangements target each root.',
    defaultX0: 3.0,
    expectedRoots: [3.14619, 0.15859],
    candidates: [
      {
        id: 'log-direct',
        label: 'Form 1: Direct Log Isolation (Targets x ≈ 3.146)',
        expr: 'log(x) + 2',
        latex: '\\ln(x) + 2',
        derivation: 'Isolate x: x = ln(x) + 2',
        note: 'Converges to root x ≈ 3.146! |g\'(3.146)| ≈ 0.318 < 1.',
        cobwebType: 'staircase',
        defaultX0: 3.0,
      },
      {
        id: 'log-exp',
        label: 'Form 2: Exponential Inversion (Targets x ≈ 0.158)',
        expr: 'exp(x - 2)',
        latex: 'e^{x - 2}',
        derivation: 'ln(x) = x - 2 \\implies x = e^{x - 2}',
        note: 'Converges to root x ≈ 0.158 (|g\'(0.158)| ≈ 0.158 < 1). Diverges near x ≈ 3.146 (|g\'| ≈ 3.146 > 1).',
        cobwebType: 'staircase',
        defaultX0: 0.1,
      },
    ],
  },
];

/**
 * Evaluates candidate g(x) and its derivative g'(x) at x0 for convergence classification
 */
export function evaluateCandidateG(exprGStr: string, x0: number): CandidateConvergenceEvaluation {
  const normalized = normalizeExpression(exprGStr);
  let baseNode: math.MathNode;
  let derivNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      exprGStr,
      originalLatex: exprGStr,
      derivativeLatex: "g'(x)",
      gVal: NaN,
      gPrimeVal: NaN,
      absGPrime: NaN,
      status: 'invalid',
      isContractive: false,
      cobwebType: 'divergent',
      behaviorNote: `Parse error: ${msg}`,
      error: msg,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprGStr;
  }

  try {
    derivNode = math.derivative(baseNode, 'x');
  } catch {
    derivNode = baseNode;
  }

  let derivativeLatex = '';
  try {
    derivativeLatex = derivNode.toTex({ parenthesis: 'auto' });
  } catch {
    derivativeLatex = "g'(x)";
  }

  let compiledG: math.EvalFunction;
  let compiledGPrime: math.EvalFunction;
  try {
    compiledG = baseNode.compile();
    compiledGPrime = derivNode.compile();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Compilation error';
    return {
      exprGStr,
      originalLatex,
      derivativeLatex,
      gVal: NaN,
      gPrimeVal: NaN,
      absGPrime: NaN,
      status: 'invalid',
      isContractive: false,
      cobwebType: 'divergent',
      behaviorNote: `Compilation error: ${msg}`,
      error: msg,
    };
  }

  const evalSingle = (compiled: math.EvalFunction, val: number): number => {
    try {
      const res = compiled.evaluate({ x: val, e: Math.E, pi: Math.PI });
      if (res && typeof res === 'object' && 're' in res) {
        return NaN; // Complex number out of real domain
      }
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const gVal = evalSingle(compiledG, x0);
  let gPrimeVal = evalSingle(compiledGPrime, x0);

  // Fallback numerical derivative if symbolic evaluation fails
  if (isNaN(gPrimeVal) && !isNaN(gVal)) {
    const h = 1e-6;
    const gPlus = evalSingle(compiledG, x0 + h);
    const gMinus = evalSingle(compiledG, x0 - h);
    if (!isNaN(gPlus) && !isNaN(gMinus)) {
      gPrimeVal = (gPlus - gMinus) / (2 * h);
    }
  }

  const absGPrime = isNaN(gPrimeVal) ? NaN : Math.abs(gPrimeVal);

  if (isNaN(gVal) || isNaN(absGPrime) || !isFinite(absGPrime)) {
    return {
      exprGStr,
      originalLatex,
      derivativeLatex,
      gVal,
      gPrimeVal,
      absGPrime: NaN,
      status: 'invalid',
      isContractive: false,
      cobwebType: 'divergent',
      behaviorNote: 'Undefined or complex outside real domain at initial guess x₀',
    };
  }

  const isContractive = absGPrime < 0.9999;
  let status: 'converges' | 'diverges' | 'inconclusive' | 'invalid' = 'diverges';
  let cobwebType: 'staircase' | 'spiral' | 'divergent' = 'divergent';
  let behaviorNote = '';

  if (absGPrime < 0.9999) {
    status = 'converges';
    if (gPrimeVal >= 0) {
      cobwebType = 'staircase';
      behaviorNote = `Monotonic Staircase (Contractive, approaches root directly without oscillation)`;
    } else {
      cobwebType = 'spiral';
      behaviorNote = `Oscillating Spiral Cobweb (Contractive, winds inward across root)`;
    }
    if (absGPrime < 0.05) {
      behaviorNote = `Rapid Superlinear Convergence (|g'(x₀)| ≈ 0 near root)`;
    }
  } else if (absGPrime > 1.0001) {
    status = 'diverges';
    cobwebType = 'divergent';
    if (gPrimeVal > 0) {
      behaviorNote = `Monotonic Runaway Divergence (Expansive, |g'(x₀)| > 1 shoots away from root)`;
    } else {
      behaviorNote = `Oscillating Outward Spiral Divergence (Expansive, oscillates with growing amplitude)`;
    }
  } else {
    status = 'inconclusive';
    cobwebType = 'divergent';
    behaviorNote = `Marginally Stable (|g'(x₀)| ≈ 1, very slow convergence or unstable boundary)`;
  }

  return {
    exprGStr,
    originalLatex,
    derivativeLatex,
    gVal,
    gPrimeVal,
    absGPrime,
    status,
    isContractive,
    cobwebType,
    behaviorNote,
  };
}

/**
 * Automatically derives candidate g(x) rearrangements from an equation f(x) = 0
 */
export function autoGenerateCandidateGs(
  fExprStr: string,
  x0: number = 1
): FixedPointCandidateG[] {
  let fClean = normalizeExpression(fExprStr);
  fClean = fClean.replace(/=\s*0$/, '').trim();
  if (!fClean) return [];

  const candidates: FixedPointCandidateG[] = [];
  const seen = new Set<string>();

  const register = (
    expr: string,
    label: string,
    derivation: string,
    defaultX0Val?: number
  ) => {
    const trimmed = expr.trim();
    if (!trimmed || seen.has(trimmed)) return;
    try {
      const evalRes = evaluateCandidateG(trimmed, x0);
      if (evalRes.status === 'invalid') return;
      seen.add(trimmed);
      candidates.push({
        id: `auto-${candidates.length + 1}`,
        label,
        expr: trimmed,
        latex: evalRes.originalLatex,
        derivation,
        note: evalRes.behaviorNote,
        cobwebType: evalRes.cobwebType,
        defaultX0: defaultX0Val ?? x0,
      });
    } catch {
      // Skip invalid expressions
    }
  };

  // 1. Additive Rearrangements
  register(
    `x - (${fClean})`,
    'Additive Relaxation: x = x - f(x)',
    'Formed by rearranging f(x) = 0 into x = x - f(x)'
  );
  register(
    `x + (${fClean})`,
    'Additive Form: x = x + f(x)',
    'Formed by adding x to both sides: x = x + f(x)'
  );

  // 2. Newton-Steffensen Quadratic Order Form
  try {
    const fNode = math.parse(fClean);
    const dfNode = math.derivative(fNode, 'x');
    register(
      `x - (${fClean}) / (${dfNode.toString()})`,
      "Newton-Steffensen Fixed Point: x = x - f(x)/f'(x)",
      "High-order contractive rearrangement ensuring quadratic convergence"
    );
  } catch {
    // Ignore derivative failure
  }

  // 3. Polynomial term isolations
  try {
    const fNode = math.parse(fClean);
    interface TermInfo {
      node: math.MathNode;
      sign: number;
    }
    const terms: TermInfo[] = [];

    const traverse = (n: math.MathNode, sign: number = 1) => {
      if (n.type === 'OperatorNode' && ((n as any).op === '+' || (n as any).op === '-')) {
        const opNode = n as any;
        traverse(opNode.args[0], sign);
        const rightSign = opNode.op === '+' ? sign : -sign;
        traverse(opNode.args[1], rightSign);
      } else {
        terms.push({ node: n, sign });
      }
    };
    traverse(fNode, 1);

    for (let i = 0; i < terms.length; i++) {
      const t = terms[i];
      const restTerms = terms.filter((_, idx) => idx !== i);
      let restStr = '';
      restTerms.forEach((rt, idx) => {
        const effectiveSign = -rt.sign * t.sign;
        const signStr = effectiveSign > 0 ? (idx === 0 ? '' : ' + ') : ' - ';
        restStr += signStr + rt.node.toString();
      });
      if (!restStr) restStr = '0';

      const tStr = t.node.toString().replace(/\s+/g, '');

      if (tStr === 'x') {
        register(
          restStr,
          'Isolate linear x',
          `Linear term isolated: x = ${restStr}`
        );
      } else if (tStr === 'x^2') {
        register(
          `sqrt(${restStr})`,
          'Isolate x² (Square Root)',
          `x² = ${restStr} ⟹ x = √(${restStr})`
        );
      } else if (tStr === 'x^3') {
        register(
          `(${restStr})^(1/3)`,
          'Isolate x³ (Cube Root)',
          `x³ = ${restStr} ⟹ x = (${restStr})^(1/3)`
        );
      } else if (tStr.endsWith('*x^2') || tStr.includes('*x^2')) {
        const coeff = tStr.split('*x^2')[0] || '1';
        register(
          `sqrt((${restStr}) / ${coeff})`,
          `Isolate ${coeff}x² (Square Root)`,
          `${coeff}x² = ${restStr} ⟹ x = √((${restStr})/${coeff})`
        );
      } else if (tStr.endsWith('*x') || tStr.includes('*x')) {
        const coeff = tStr.split('*x')[0] || '1';
        register(
          `(${restStr}) / ${coeff}`,
          `Isolate ${coeff}x (Linear)`,
          `${coeff}x = ${restStr} ⟹ x = (${restStr})/${coeff}`
        );
      }
    }
  } catch {
    // Ignore AST parsing errors
  }

  // 4. Transcendental patterns
  if (fClean.includes('exp(-x)')) {
    register('exp(-x)', 'Isolate Exponential: x = e⁻ˣ', 'e⁻ˣ = x ⟹ x = e⁻ˣ');
    register('-log(x)', 'Natural Logarithm: x = -ln(x)', 'Take ln of both sides: -x = ln(x) ⟹ x = -ln(x)');
    register('(x + exp(-x)) / 2', 'Relaxed Average: (x + e⁻ˣ)/2', 'Average of x and e⁻ˣ to dampen oscillations');
  }
  if (fClean.includes('cos(x)')) {
    register('cos(x)', 'Isolate Cosine: x = cos(x)', 'x = cos(x)');
    register('acos(x)', 'Inverse Cosine: x = arccos(x)', 'x = arccos(x)');
    register('(x + cos(x)) / 2', 'Averaged Cosine: (x + cos(x))/2', 'Relaxed iteration for faster convergence');
  }

  return candidates;
}

export const NEWTON_RAPHSON_PRESETS: OpenMethodPreset[] = [
  {
    label: 'Cubic Polynomial: x³ - x - 2',
    mathDisplay: 'f(x) = x^3 - x - 2',
    expr: 'x^3 - x - 2',
    defaultX0: 1,
    description: 'Standard textbook cubic. Exhibits dramatic quadratic convergence, locating root x ≈ 1.52095 in just 4 iterations!',
    note: 'f\'(x) = 3x² - 1',
  },
  {
    label: 'Square Root of 5: x² - 5',
    mathDisplay: 'f(x) = x^2 - 5',
    expr: 'x^2 - 5',
    defaultX0: 2,
    description: 'The ancient Babylonian / Heron\'s method for calculating √5 ≈ 2.236068 with doubled precision every step.',
    note: 'f\'(x) = 2x',
  },
  {
    label: 'Transcendental: e⁻ˣ - x',
    mathDisplay: 'f(x) = e^{-x} - x',
    expr: 'exp(-x) - x',
    defaultX0: 0,
    description: 'Nonlinear exponential-linear balance. Rapid convergence to x ≈ 0.567143.',
    note: 'f\'(x) = -e⁻ˣ - 1',
  },
  {
    label: 'Trigonometric: cos(x) - x',
    mathDisplay: 'f(x) = \\cos(x) - x',
    expr: 'cos(x) - x',
    defaultX0: 1,
    description: 'Solves cos(x) = x. Reaches 6-decimal precision in 3 steps.',
    note: 'f\'(x) = -\\sin(x) - 1',
  },
  {
    label: 'Cycling Trap: x³ - 5x (Cautionary)',
    mathDisplay: 'f(x) = x^3 - 5x',
    expr: 'x^3 - 5*x',
    defaultX0: 1,
    description: 'Famous pitfall! With initial guess x₀ = 1, Newton-Raphson bounces indefinitely between +1 and -1 in an endless cycle.',
    note: 'f(1) = -4, f\'(1) = -2 -> x₁ = -1 -> x₂ = 1 (Infinite Loop)',
  },
  {
    label: 'Inflection / Extremum Trap: x³ - 2x + 2',
    mathDisplay: 'f(x) = x^3 - 2x + 2',
    expr: 'x^3 - 2*x + 2',
    defaultX0: 0,
    description: 'Near local extremum where f\'(x) ≈ 0, the tangent line shoots far away, illustrating sensitivity to initial guess.',
    note: 'f\'(x) = 3x² - 2',
  },
];

/**
 * Executes Fixed-Point Iteration (x_{i+1} = g(x_i))
 */
export function solveFixedPoint(
  exprGStr: string,
  initialX0: number,
  maxIterations: number = 25,
  stoppingToleranceEa: number = 0.0001
): FixedPointResult {
  const normalized = normalizeExpression(exprGStr);
  let baseNode: math.MathNode;
  let derivNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      exprGStr,
      originalLatex: '',
      derivativeLatex: '',
      evalG: () => 0,
      evalGPrime: () => 0,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `Parse error in g(x): ${msg}`,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprGStr;
  }

  try {
    derivNode = math.derivative(baseNode, 'x');
  } catch {
    derivNode = baseNode; // Fallback
  }

  let derivativeLatex = '';
  try {
    derivativeLatex = derivNode.toTex({ parenthesis: 'auto' });
  } catch {
    derivativeLatex = "g'(x)";
  }

  const compiledG = baseNode.compile();
  const compiledGPrime = derivNode.compile();

  const evalG = (x: number): number => {
    try {
      const res = compiledG.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const evalGPrime = (x: number): number => {
    try {
      const res = compiledGPrime.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      // Numerical approximation fallback if symbolic derivative fails
      const h = 1e-6;
      return (evalG(x + h) - evalG(x - h)) / (2 * h);
    }
  };

  // Evaluate initial guess
  const g0 = evalG(initialX0);
  if (isNaN(g0)) {
    return {
      exprGStr,
      originalLatex,
      derivativeLatex,
      evalG,
      evalGPrime,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `g(x) evaluated to NaN or is undefined at initial guess x₀ = ${initialX0}.`,
    };
  }

  let xi = initialX0;
  const steps: FixedPointStep[] = [];
  let converged = false;
  let diverged = false;
  let warning: string | undefined = undefined;

  for (let i = 0; i < maxIterations; i++) {
    const gxi = evalG(xi);
    const gPrimeXi = evalGPrime(xi);

    if (isNaN(gxi) || !isFinite(gxi) || Math.abs(gxi) > 1e12) {
      diverged = true;
      warning = `Iteration diverged: values exceeded numerical bounds (|x| > 10¹²) at iteration ${i + 1}. |g'(x)| > 1 causing runaway divergence.`;
      break;
    }

    const isContractive = Math.abs(gPrimeXi) < 1.0;

    let ea: number | null = null;
    if (i > 0 && Math.abs(gxi) > 1e-14) {
      ea = Math.abs((gxi - xi) / gxi) * 100;
    }

    // Cobweb coordinates:
    // First step (i=0): from (x0, 0) up to (x0, g(x0)), then horizontal to (g(x0), g(x0))
    // Subsequent steps: from (xi, xi) on y=x up/down to (xi, g(xi)), then horizontal to (g(xi), g(xi))
    const vertX = xi;
    const vertY0 = i === 0 ? 0 : xi;
    const vertY1 = gxi;
    const horizY = gxi;
    const horizX0 = xi;
    const horizX1 = gxi;

    steps.push({
      iteration: i + 1,
      xi,
      gxi,
      gPrimeXi,
      isContractive,
      ea,
      vertX,
      vertY0,
      vertY1,
      horizY,
      horizX0,
      horizX1,
    });

    if (ea !== null && ea < stoppingToleranceEa) {
      converged = true;
      break;
    }

    // Exact match
    if (Math.abs(gxi - xi) < 1e-14) {
      converged = true;
      break;
    }

    xi = gxi;
  }

  const finalRoot = steps.length > 0 ? steps[steps.length - 1].gxi : null;

  return {
    exprGStr,
    originalLatex,
    derivativeLatex,
    evalG,
    evalGPrime,
    steps,
    converged,
    diverged,
    finalRoot,
    warning,
  };
}

/**
 * Executes Newton-Raphson Method: x_{i+1} = x_i - f(x_i)/f'(x_i)
 */
export function solveNewtonRaphson(
  exprFStr: string,
  initialX0: number,
  maxIterations: number = 25,
  stoppingToleranceEa: number = 0.0001
): NewtonRaphsonResult {
  const normalized = normalizeExpression(exprFStr);
  let baseNode: math.MathNode;
  let derivNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      exprFStr,
      originalLatex: '',
      derivativeLatex: '',
      evalF: () => 0,
      evalDF: () => 0,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `Parse error in f(x): ${msg}`,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprFStr;
  }

  try {
    derivNode = math.derivative(baseNode, 'x');
  } catch {
    derivNode = baseNode;
  }

  let derivativeLatex = '';
  try {
    derivativeLatex = derivNode.toTex({ parenthesis: 'auto' });
  } catch {
    derivativeLatex = "f'(x)";
  }

  const compiledF = baseNode.compile();
  const compiledDF = derivNode.compile();

  const evalF = (x: number): number => {
    try {
      const res = compiledF.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const evalDF = (x: number): number => {
    try {
      const res = compiledDF.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      const h = 1e-6;
      return (evalF(x + h) - evalF(x - h)) / (2 * h);
    }
  };

  const f0 = evalF(initialX0);
  if (isNaN(f0)) {
    return {
      exprFStr,
      originalLatex,
      derivativeLatex,
      evalF,
      evalDF,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `f(x) evaluated to NaN or is undefined at initial guess x₀ = ${initialX0}.`,
    };
  }

  let xi = initialX0;
  const steps: NewtonRaphsonStep[] = [];
  let converged = false;
  let diverged = false;
  let warning: string | undefined = undefined;

  for (let i = 0; i < maxIterations; i++) {
    const fxi = evalF(xi);
    const dfxi = evalDF(xi);

    if (isNaN(fxi) || !isFinite(fxi) || Math.abs(fxi) > 1e12 || Math.abs(xi) > 1e12) {
      diverged = true;
      warning = `Iteration diverged: values exceeded numerical bounds (|x| > 10¹²) at iteration ${i + 1}.`;
      break;
    }

    let zeroSlope = false;
    let xNext: number;

    if (Math.abs(dfxi) < 1e-12) {
      zeroSlope = true;
      warning = `Zero or near-zero derivative encountered at x = ${formatNum(xi)} (f'(x) ≈ 0). Tangent line is horizontal and cannot intersect the x-axis.`;
      xNext = xi + 0.001; // small nudge to prevent complete crash
    } else {
      xNext = xi - fxi / dfxi;
    }

    let ea: number | null = null;
    if (i > 0 && Math.abs(xNext) > 1e-14) {
      ea = Math.abs((xNext - xi) / xNext) * 100;
    }

    // Tangent equation: y - fxi = dfxi * (x - xi) => y = dfxi*x + (fxi - dfxi*xi)
    const tangentSlope = dfxi;
    const tangentIntercept = fxi - dfxi * xi;

    steps.push({
      iteration: i + 1,
      xi,
      fxi,
      dfxi,
      xNext,
      ea,
      tangentSlope,
      tangentIntercept,
      zeroSlopeWarning: zeroSlope,
    });

    if (ea !== null && ea < stoppingToleranceEa) {
      converged = true;
      break;
    }

    // If exact zero
    if (Math.abs(fxi) < 1e-14) {
      converged = true;
      break;
    }

    // Cycle detection check (e.g. oscillating between 2 values)
    if (steps.length >= 3) {
      const prev2 = steps[steps.length - 3];
      if (Math.abs(xNext - prev2.xi) < 1e-6 && Math.abs(xNext - xi) > 0.01) {
        warning = `Cycle detected! Newton-Raphson is trapped oscillating between x ≈ ${formatNum(xi)} and x ≈ ${formatNum(xNext)}. Try a different initial guess.`;
        break;
      }
    }

    xi = xNext;
  }

  const finalRoot = steps.length > 0 ? steps[steps.length - 1].xNext : null;

  return {
    exprFStr,
    originalLatex,
    derivativeLatex,
    evalF,
    evalDF,
    steps,
    converged,
    diverged,
    finalRoot,
    warning,
  };
}

// ==========================================
// SECANT METHOD
// ==========================================

export interface SecantPreset {
  label: string;
  mathDisplay: string;
  expr: string;
  defaultX0: number; // x_{i-1}
  defaultX1: number; // x_i
  description: string;
  note?: string;
}

export interface SecantStep {
  iteration: number;
  xPrev: number; // x_{i-1}
  fxPrev: number; // f(x_{i-1})
  xi: number; // x_i
  fxi: number; // f(x_i)
  xNext: number; // x_{i+1}
  fxNext: number; // f(x_{i+1})
  secantSlope: number; // (f(x_i) - f(x_{i-1})) / (x_i - x_{i-1})
  secantIntercept: number; // y - f(x_i) = m*(x - x_i) => b = f(x_i) - m*x_i
  ea: number | null; // % error |(xNext - xi)/xNext| * 100
  zeroSlopeWarning?: boolean;
}

export interface SecantResult {
  exprFStr: string;
  originalLatex: string;
  evalF: (x: number) => number;
  steps: SecantStep[];
  converged: boolean;
  diverged: boolean;
  finalRoot: number | null;
  error?: string;
  warning?: string;
}

export const SECANT_PRESETS: SecantPreset[] = [
  {
    label: 'Cubic Polynomial: x³ - x - 2',
    mathDisplay: 'f(x) = x^3 - x - 2',
    expr: 'x^3 - x - 2',
    defaultX0: 1,
    defaultX1: 2,
    description: 'Textbook cubic solved without computing derivatives! Secant lines converge rapidly to root x ≈ 1.52095.',
    note: 'Order of convergence: Golden Ratio φ ≈ 1.618 (Superlinear)',
  },
  {
    label: 'Square Root of 5: x² - 5',
    mathDisplay: 'f(x) = x^2 - 5',
    expr: 'x^2 - 5',
    defaultX0: 2,
    defaultX1: 3,
    description: 'Calculates √5 ≈ 2.236068 from secants through points on the parabola.',
    note: 'Initial guesses x₀ = 2, x₁ = 3',
  },
  {
    label: 'Transcendental: e⁻ˣ - x',
    mathDisplay: 'f(x) = e^{-x} - x',
    expr: 'exp(-x) - x',
    defaultX0: 0,
    defaultX1: 1,
    description: 'Locates root x ≈ 0.567143 with just one function evaluation per step after initial guesses.',
    note: 'Superlinear convergence without analytical f\'(x)',
  },
  {
    label: 'Trigonometric: cos(x) - x',
    mathDisplay: 'f(x) = \\cos(x) - x',
    expr: 'cos(x) - x',
    defaultX0: 0.5,
    defaultX1: 1.0,
    description: 'Finds intersection cos(x) = x at x ≈ 0.739085 in 4-5 iterations.',
    note: 'Guesses bracket the root smoothly',
  },
  {
    label: 'Polynomial: x³ - 2x - 5',
    mathDisplay: 'f(x) = x^3 - 2x - 5',
    expr: 'x^3 - 2*x - 5',
    defaultX0: 2,
    defaultX1: 3,
    description: 'Classic equation used by John Wallis (1685). Rapidly converges to root x ≈ 2.09455.',
    note: 'Superlinear speed without bracket requirement',
  },
  {
    label: 'Equal Values Trap: x² - 4 (Cautionary)',
    mathDisplay: 'f(x) = x^2 - 4',
    expr: 'x^2 - 4',
    defaultX0: -2,
    defaultX1: 2,
    description: 'Horizontal secant trap! Since f(-2) = f(2) = 0, the denominator f(x₁) - f(x₀) vanishes, causing division by zero.',
    note: 'f(x₁) - f(x₀) = 0 -> Division by zero',
  },
];

/**
 * Executes Secant Method:
 * x_{i+1} = x_i - f(x_i) * (x_i - x_{i-1}) / (f(x_i) - f(x_{i-1}))
 */
export function solveSecant(
  exprFStr: string,
  initialX0: number, // x_{i-1}
  initialX1: number, // x_i
  maxIterations: number = 25,
  stoppingToleranceEa: number = 0.0001
): SecantResult {
  const normalized = normalizeExpression(exprFStr);
  let baseNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      exprFStr,
      originalLatex: '',
      evalF: () => 0,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `Parse error in f(x): ${msg}`,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprFStr;
  }

  const compiledF = baseNode.compile();

  const evalF = (x: number): number => {
    try {
      const res = compiledF.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const f0 = evalF(initialX0);
  const f1 = evalF(initialX1);

  if (isNaN(f0)) {
    return {
      exprFStr,
      originalLatex,
      evalF,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `f(x) evaluated to NaN at initial guess x₀ = ${initialX0}.`,
    };
  }

  if (isNaN(f1)) {
    return {
      exprFStr,
      originalLatex,
      evalF,
      steps: [],
      converged: false,
      diverged: false,
      finalRoot: null,
      error: `f(x) evaluated to NaN at second guess x₁ = ${initialX1}.`,
    };
  }

  let xPrev = initialX0;
  let xi = initialX1;
  const steps: SecantStep[] = [];
  let converged = false;
  let diverged = false;
  let warning: string | undefined = undefined;

  for (let i = 0; i < maxIterations; i++) {
    const fxPrev = evalF(xPrev);
    const fxi = evalF(xi);

    if (
      isNaN(fxPrev) ||
      isNaN(fxi) ||
      !isFinite(fxPrev) ||
      !isFinite(fxi) ||
      Math.abs(xi) > 1e12 ||
      Math.abs(xPrev) > 1e12
    ) {
      diverged = true;
      warning = `Secant iteration diverged: values exceeded numerical bounds (|x| > 10¹²) at iteration ${i + 1}.`;
      break;
    }

    const deltaF = fxi - fxPrev;
    const deltaX = xi - xPrev;

    let zeroSlope = false;
    let xNext: number;

    if (Math.abs(deltaF) < 1e-14) {
      zeroSlope = true;
      warning = `Near-zero denominator: f(x_i) ≈ f(x_{i-1}) (${formatNum(fxi)} vs ${formatNum(fxPrev)}). Secant line is horizontal.`;
      xNext = xi + 0.001;
    } else {
      xNext = xi - (fxi * deltaX) / deltaF;
    }

    const fxNext = evalF(xNext);

    let ea: number | null = null;
    if (i > 0 && Math.abs(xNext) > 1e-14) {
      ea = Math.abs((xNext - xi) / xNext) * 100;
    }

    // Secant equation: y - f(xi) = m * (x - xi) where m = deltaF / deltaX
    const secantSlope = Math.abs(deltaX) > 1e-14 ? deltaF / deltaX : 0;
    const secantIntercept = fxi - secantSlope * xi;

    steps.push({
      iteration: i + 1,
      xPrev,
      fxPrev,
      xi,
      fxi,
      xNext,
      fxNext,
      secantSlope,
      secantIntercept,
      ea,
      zeroSlopeWarning: zeroSlope,
    });

    if (ea !== null && ea < stoppingToleranceEa) {
      converged = true;
      break;
    }

    if (Math.abs(fxi) < 1e-14 || Math.abs(fxNext) < 1e-14) {
      converged = true;
      break;
    }

    // Shift for next iteration: x_{i-1} <- x_i, x_i <- x_{i+1}
    xPrev = xi;
    xi = xNext;
  }

  const finalRoot = steps.length > 0 ? steps[steps.length - 1].xNext : null;

  return {
    exprFStr,
    originalLatex,
    evalF,
    steps,
    converged,
    diverged,
    finalRoot,
    warning,
  };
}

// ==========================================
// MULLER'S METHOD
// ==========================================

export interface MullerPreset {
  label: string;
  mathDisplay: string;
  expr: string;
  defaultX0: number;
  defaultX1: number;
  defaultX2: number;
  description: string;
  note?: string;
}

export interface MullerStep {
  iteration: number;
  x0: number;
  f0: number;
  x1: number;
  f1: number;
  x2: number;
  f2: number;
  h0: number;
  h1: number;
  d0: number;
  d1: number;
  a: number;
  b: number;
  c: number;
  discriminant: number; // b^2 - 4ac
  x3Real: number; // Real part of root estimate
  x3Imag: number; // Imaginary part
  fx3: number | null; // f(x3Real)
  isComplex: boolean;
  ea: number | null; // % relative error |(x3 - x2)/x3| * 100
  evalParabola: (x: number) => number;
}

export interface MullerResult {
  exprFStr: string;
  originalLatex: string;
  evalF: (x: number) => number;
  steps: MullerStep[];
  converged: boolean;
  diverged: boolean;
  finalRootReal: number | null;
  finalRootImag: number | null;
  isComplex: boolean;
  error?: string;
  warning?: string;
}

export const MULLER_PRESETS: MullerPreset[] = [
  {
    label: 'Cubic Polynomial: x³ - 13x - 12 (Chapra & Canale)',
    mathDisplay: 'f(x) = x^3 - 13x - 12',
    expr: 'x^3 - 13*x - 12',
    defaultX0: 4.5,
    defaultX1: 5.5,
    defaultX2: 5.0,
    description: 'Classic textbook example from Numerical Methods for Engineers. Three points parabolic interpolation converges to root x = 4.',
    note: 'Parabolic fitting order ≈ 1.84',
  },
  {
    label: 'Plastic Ratio: x³ - x - 1',
    mathDisplay: 'f(x) = x^3 - x - 1',
    expr: 'x^3 - x - 1',
    defaultX0: 1.0,
    defaultX1: 2.0,
    defaultX2: 1.5,
    description: 'Fits a parabola to locate the plastic constant x ≈ 1.324718 with near-quadratic speed.',
    note: 'Fast convergence from guesses 1.0, 2.0, 1.5',
  },
  {
    label: 'Transcendental: e⁻ˣ - x',
    mathDisplay: 'f(x) = e^{-x} - x',
    expr: 'exp(-x) - x',
    defaultX0: 0.0,
    defaultX1: 0.5,
    defaultX2: 1.0,
    description: 'Demonstrates parabolic curvature matching transcendental exponential-linear root x ≈ 0.567143.',
    note: 'Locates root in 3 iterations',
  },
  {
    label: 'Cubic with Complex Conjugate Roots: x³ - 0.5x² + 4x - 2',
    mathDisplay: 'f(x) = x^3 - 0.5x^2 + 4x - 2',
    expr: 'x^3 - 0.5*x^2 + 4*x - 2',
    defaultX0: 0.0,
    defaultX1: 1.0,
    defaultX2: 0.5,
    description: 'Roots are x = 0.5 and x = ±2i. Muller\'s method seamlessly handles complex discriminants when b² - 4ac < 0!',
    note: 'Discovers real root x = 0.5 or complex roots ±2i',
  },
  {
    label: 'Quadratic Polynomial: x² - x - 2',
    mathDisplay: 'f(x) = x^2 - x - 2',
    expr: 'x^2 - x - 2',
    defaultX0: 0.0,
    defaultX1: 1.0,
    defaultX2: 3.0,
    description: 'Since f(x) is already quadratic, Muller\'s method fits the exact parabola and discovers root x = 2 in just 1-2 steps!',
    note: 'Exact quadratic match',
  },
];

/**
 * Executes Muller's Method:
 * Fits a parabola P(x) = a(x - x_2)^2 + b(x - x_2) + c through (x0, f0), (x1, f1), (x2, f2)
 * x_3 = x_2 - 2c / (b ± sqrt(b^2 - 4ac))
 */
export function solveMuller(
  exprFStr: string,
  initialX0: number,
  initialX1: number,
  initialX2: number,
  maxIterations: number = 20,
  stoppingToleranceEa: number = 0.0001
): MullerResult {
  const normalized = normalizeExpression(exprFStr);
  let baseNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return {
      exprFStr,
      originalLatex: '',
      evalF: () => 0,
      steps: [],
      converged: false,
      diverged: false,
      finalRootReal: null,
      finalRootImag: null,
      isComplex: false,
      error: `Parse error in f(x): ${msg}`,
    };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprFStr;
  }

  const compiledF = baseNode.compile();

  const evalF = (x: number): number => {
    try {
      const res = compiledF.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  let x0 = initialX0;
  let x1 = initialX1;
  let x2 = initialX2;

  const f0Check = evalF(x0);
  const f1Check = evalF(x1);
  const f2Check = evalF(x2);

  if (isNaN(f0Check) || isNaN(f1Check) || isNaN(f2Check)) {
    return {
      exprFStr,
      originalLatex,
      evalF,
      steps: [],
      converged: false,
      diverged: false,
      finalRootReal: null,
      finalRootImag: null,
      isComplex: false,
      error: `f(x) evaluated to NaN at initial guesses. Please check function domain.`,
    };
  }

  const steps: MullerStep[] = [];
  let converged = false;
  let diverged = false;
  let warning: string | undefined = undefined;

  for (let i = 0; i < maxIterations; i++) {
    const f0 = evalF(x0);
    const f1 = evalF(x1);
    const f2 = evalF(x2);

    if (
      isNaN(f0) ||
      isNaN(f1) ||
      isNaN(f2) ||
      !isFinite(f0) ||
      !isFinite(f1) ||
      !isFinite(f2) ||
      Math.abs(x2) > 1e12
    ) {
      diverged = true;
      warning = `Muller iteration diverged: numerical overflow at step ${i + 1}.`;
      break;
    }

    const h0 = x1 - x0;
    const h1 = x2 - x1;

    if (Math.abs(h0) < 1e-14 || Math.abs(h1) < 1e-14 || Math.abs(h1 + h0) < 1e-14) {
      warning = `Coincident points encountered: two or more guesses are too close (${formatNum(x0)}, ${formatNum(x1)}, ${formatNum(x2)}).`;
      break;
    }

    const d0 = (f1 - f0) / h0;
    const d1 = (f2 - f1) / h1;

    const a = (d1 - d0) / (h1 + h0);
    const b = a * h1 + d1;
    const c = f2;

    const disc = b * b - 4 * a * c;

    let x3Real = x2;
    let x3Imag = 0;
    let isComplex = false;

    if (disc >= 0) {
      const sqrtDisc = Math.sqrt(disc);
      // Choose sign to maximize denominator magnitude: |b + sgn(b)*sqrtDisc|
      const sign = b >= 0 ? 1 : -1;
      const den = b + sign * sqrtDisc;

      if (Math.abs(den) < 1e-14) {
        warning = `Zero denominator in Muller formula at iteration ${i + 1}.`;
        x3Real = x2 + 0.001;
      } else {
        const dx = (-2 * c) / den;
        x3Real = x2 + dx;
      }
    } else {
      isComplex = true;
      const sqrtAbsDisc = Math.sqrt(-disc);
      // Denominator is complex: b +/- i*sqrtAbsDisc.
      // Magnitude of den is sqrt(b^2 + |disc|) = sqrt(4ac)
      // dx = -2c / (b + i*sqrtAbsDisc) = -2c * (b - i*sqrtAbsDisc) / (b^2 + |disc|)
      const denMagSq = b * b + (-disc);
      if (denMagSq < 1e-14) {
        warning = `Zero complex denominator at iteration ${i + 1}.`;
      } else {
        const dxReal = (-2 * c * b) / denMagSq;
        const dxImag = (2 * c * sqrtAbsDisc) / denMagSq;
        x3Real = x2 + dxReal;
        x3Imag = dxImag;
      }
    }

    const fx3 = isComplex ? null : evalF(x3Real);

    // Approximate relative error
    let ea: number | null = null;
    if (i > 0) {
      const diffMag = Math.sqrt(
        (x3Real - x2) * (x3Real - x2) + x3Imag * x3Imag
      );
      const x3Mag = Math.sqrt(x3Real * x3Real + x3Imag * x3Imag);
      if (x3Mag > 1e-14) {
        ea = (diffMag / x3Mag) * 100;
      }
    }

    // Parabola evaluation closure: P(x) = a*(x - x2)^2 + b*(x - x2) + c
    const curA = a;
    const curB = b;
    const curC = c;
    const curX2 = x2;
    const evalParabola = (x: number): number => {
      const dx = x - curX2;
      return curA * dx * dx + curB * dx + curC;
    };

    steps.push({
      iteration: i + 1,
      x0,
      f0,
      x1,
      f1,
      x2,
      f2,
      h0,
      h1,
      d0,
      d1,
      a,
      b,
      c,
      discriminant: disc,
      x3Real,
      x3Imag,
      fx3,
      isComplex,
      ea,
      evalParabola,
    });

    if (ea !== null && ea < stoppingToleranceEa) {
      converged = true;
      break;
    }

    if (!isComplex && fx3 !== null && Math.abs(fx3) < 1e-14) {
      converged = true;
      break;
    }

    // Update triplet for next step: x0 <- x1, x1 <- x2, x2 <- x3Real
    x0 = x1;
    x1 = x2;
    x2 = x3Real;
  }

  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return {
    exprFStr,
    originalLatex,
    evalF,
    steps,
    converged,
    diverged,
    finalRootReal: lastStep ? lastStep.x3Real : null,
    finalRootImag: lastStep && lastStep.isComplex ? lastStep.x3Imag : 0,
    isComplex: lastStep ? lastStep.isComplex : false,
    warning,
  };
}
