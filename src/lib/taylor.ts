import * as math from 'mathjs';

export interface TaylorStep {
  order: number;
  // Raw string / latex of symbolic derivative f^(n)(x)
  derivativeExpr: string;
  derivativeLatex: string;
  // Value of f^(n)(a)
  derivativeAtA: number;
  derivativeAtAFormatted: string;
  // Factorial n!
  factorialVal: number;
  // Coefficient c_n = f^(n)(a) / n!
  coefficient: number;
  // The newly added term e.g. "f''(a)/2! * (x-a)^2"
  termLatex: string;
  termString: string;
  // Running polynomial P_n(x)
  polynomialLatex: string;
  // Compiled evaluator for P_n(x)
  evalPolynomial: (x: number) => number;
}

export interface TaylorModel {
  originalExpr: string;
  a: number;
  xMin: number;
  xMax: number;
  evalOriginal: (x: number) => number;
  steps: TaylorStep[];
  currentOrder: number;
}

/**
 * Normalizes common mathematical user inputs into mathjs-compatible expressions.
 * e.g., e^x -> exp(x), ln(x) -> log(x)
 */
export function normalizeExpression(expr: string): string {
  let clean = expr.trim();
  // Replace all Unicode dash/minus variants (en-dash, em-dash, math minus, etc.) with standard ASCII '-'
  clean = clean.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-');
  // Replace Unicode multiplication symbols (×, ⋅, ·) with '*'
  clean = clean.replace(/[\u00D7\u22C5\u00B7]/g, '*');
  // Replace Unicode division symbols (÷) with '/'
  clean = clean.replace(/[\u00F7]/g, '/');
  // Replace ln(...) with log(...)
  clean = clean.replace(/\bln\b/g, 'log');
  return clean;
}

/**
 * Format a number nicely for math display (rounding tiny floating-point noise)
 */
export function formatNum(val: number, precision: number = 4): string {
  if (isNaN(val)) return 'NaN';
  if (!isFinite(val)) return val > 0 ? '\\infty' : '-\\infty';
  
  // Clean floating point rounding errors (e.g. 0.0000000000000001 -> 0)
  if (Math.abs(val) < 1e-12) return '0';
  
  // If close to integer
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 1e-9) {
    return rounded.toString();
  }

  // Format with limited precision
  const str = Number(val.toFixed(precision)).toString();
  return str;
}

/**
 * Compute the Taylor step for a given order n
 */
export function computeTaylorStep(
  parsedBaseNode: math.MathNode,
  prevStep: TaylorStep | null,
  order: number,
  a: number
): TaylorStep {
  let derivNode: math.MathNode;

  if (order === 0) {
    derivNode = parsedBaseNode;
  } else if (prevStep) {
    // Differentiate previous derivative
    const prevNode = math.parse(prevStep.derivativeExpr);
    derivNode = math.derivative(prevNode, 'x');
  } else {
    // Fallback: differentiate n times from base
    let node = parsedBaseNode;
    for (let i = 0; i < order; i++) {
      node = math.derivative(node, 'x');
    }
    derivNode = node;
  }

  // Simplify derivative for clean readability
  let simplifiedDerivNode = derivNode;
  try {
    simplifiedDerivNode = math.simplify(derivNode);
  } catch {
    // Fallback to unsimplified if simplify encounters unsupported operations
    simplifiedDerivNode = derivNode;
  }

  const derivativeExpr = simplifiedDerivNode.toString();
  let derivativeLatex = '';
  try {
    derivativeLatex = simplifiedDerivNode.toTex({ parenthesis: 'auto' });
  } catch {
    derivativeLatex = derivativeExpr;
  }

  // Evaluate f^(n)(a)
  const compiledDeriv = simplifiedDerivNode.compile();
  let derivativeAtA = 0;
  try {
    const rawVal = compiledDeriv.evaluate({ x: a, e: Math.E, pi: Math.PI });
    derivativeAtA = typeof rawVal === 'number' ? rawVal : Number(rawVal);
    if (isNaN(derivativeAtA) || !isFinite(derivativeAtA)) {
      derivativeAtA = 0;
    }
  } catch {
    derivativeAtA = 0;
  }

  const factorialVal = math.factorial(order);
  const coefficient = derivativeAtA / factorialVal;
  const derivativeAtAFormatted = formatNum(derivativeAtA);

  // Build LaTeX for the added term:
  let termLatex = '';
  let termString = '';

  const xShiftLatex = a === 0 ? 'x' : a > 0 ? `(x - ${formatNum(a)})` : `(x + ${formatNum(Math.abs(a))})`;
  const xShiftStr = a === 0 ? 'x' : a > 0 ? `(x - ${a})` : `(x + ${Math.abs(a)})`;

  if (Math.abs(coefficient) < 1e-12) {
    termLatex = '0';
    termString = '0';
  } else if (order === 0) {
    termLatex = derivativeAtAFormatted;
    termString = `${coefficient}`;
  } else if (order === 1) {
    const coeffStr = formatNum(derivativeAtA);
    const signPrefix = coeffStr.startsWith('-') ? '- ' : '+ ';
    const absCoeff = formatNum(Math.abs(derivativeAtA));
    termLatex = `${signPrefix}${absCoeff === '1' ? '' : absCoeff}${xShiftLatex}`;
    termString = `${coefficient >= 0 ? '+' : ''} ${coefficient} * ${xShiftStr}`;
  } else {
    // order >= 2
    const signPrefix = derivativeAtA < 0 ? '- ' : '+ ';
    const absDeriv = formatNum(Math.abs(derivativeAtA));
    
    let coeffLatex = '';
    if (absDeriv === '1') {
      coeffLatex = `\\frac{1}{${order}!}`;
    } else {
      coeffLatex = `\\frac{${absDeriv}}{${order}!}`;
    }

    termLatex = `${signPrefix}${coeffLatex} ${xShiftLatex}^{${order}}`;
    termString = `${coefficient >= 0 ? '+' : ''} ${coefficient} * ${xShiftStr}^${order}`;
  }

  // Running polynomial evaluator up to this order
  // Precompute list of coefficients up to order n
  const allCoeffs: { order: number; coeff: number }[] = [];
  if (prevStep) {
    // Extract prior components from recursion or closure
  }

  return {
    order,
    derivativeExpr,
    derivativeLatex,
    derivativeAtA,
    derivativeAtAFormatted,
    factorialVal,
    coefficient,
    termLatex,
    termString,
    polynomialLatex: '', // Will be compiled in sequence
    evalPolynomial: () => 0,
  };
}

/**
 * Builds the full sequence of steps from order 0 up to maxOrder
 */
export function buildTaylorSeries(
  exprStr: string,
  a: number,
  maxOrder: number
): { originalEval: (x: number) => number; originalLatex: string; steps: TaylorStep[]; error?: string } {
  const normalized = normalizeExpression(exprStr);
  let baseNode: math.MathNode;

  try {
    baseNode = math.parse(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid mathematical expression';
    return { originalEval: () => 0, originalLatex: '', steps: [], error: `Parse error: ${msg}` };
  }

  let originalLatex = '';
  try {
    originalLatex = baseNode.toTex({ parenthesis: 'auto' });
  } catch {
    originalLatex = exprStr;
  }

  const compiledBase = baseNode.compile();
  const originalEval = (x: number): number => {
    try {
      const res = compiledBase.evaluate({ x, e: Math.E, pi: Math.PI });
      const num = typeof res === 'number' ? res : Number(res);
      return isFinite(num) ? num : NaN;
    } catch {
      return NaN;
    }
  };

  const steps: TaylorStep[] = [];
  let currentStep: TaylorStep | null = null;

  for (let ord = 0; ord <= maxOrder; ord++) {
    try {
      const step = computeTaylorStep(baseNode, currentStep, ord, a);
      currentStep = step;
      steps.push(step);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error differentiating function';
      // If we already have order 0, we can still return up to the prior order
      if (steps.length > 0) {
        break;
      }
      return { originalEval, originalLatex, steps: [], error: `Differentiation error: ${msg}` };
    }
  }

  // Now assemble cumulative polynomial LaTeX and evaluators for each step
  for (let i = 0; i < steps.length; i++) {
    const activeSteps = steps.slice(0, i + 1);

    // Filter out zero terms for polynomial LaTeX display (unless only term 0 is zero)
    const nonZeroTerms = activeSteps.filter(s => Math.abs(s.coefficient) > 1e-12);

    let polyLatex = '0';
    if (nonZeroTerms.length > 0) {
      polyLatex = nonZeroTerms.map((s, idx) => {
        let t = s.termLatex.trim();
        if (idx === 0 && t.startsWith('+ ')) {
          t = t.substring(2);
        }
        return t;
      }).join(' ');
    } else if (activeSteps.length > 0) {
      polyLatex = '0';
    }

    steps[i].polynomialLatex = polyLatex;

    // Evaluator for P_i(x) = sum( c_k * (x - a)^k )
    const coeffs = activeSteps.map(s => ({ order: s.order, c: s.coefficient }));
    steps[i].evalPolynomial = (x: number): number => {
      let sum = 0;
      const dx = x - a;
      for (const item of coeffs) {
        if (item.c !== 0) {
          sum += item.c * Math.pow(dx, item.order);
        }
      }
      return isFinite(sum) ? sum : NaN;
    };
  }

  return { originalEval, originalLatex, steps };
}
