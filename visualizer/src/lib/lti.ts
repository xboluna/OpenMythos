/**
 * TypeScript port of `LTIInjection` from open_mythos/main.py.
 *
 * Scalar helpers mirror the diagonal update used in the stability and recurrent
 * visualizations. ρ(A) for the constrained system is simply |A| when A is a
 * scalar (or max diagonal entry in the full model).
 */

const CLAMP = 20;

/** Discretized diagonal entry A = exp(−exp(log_dt + log_A)), always in (0, 1). */
export function discreteA(logA: number, logDt: number): number {
  const x = Math.max(-CLAMP, Math.min(CLAMP, logDt + logA));
  return Math.exp(-Math.exp(x));
}

/** Spectral radius of the constrained diagonal A (scalar case). */
export function spectralRadiusConstrained(logA: number, logDt: number): number {
  return discreteA(logA, logDt);
}

/** Fixed point h* = b·e / (1 − a) for |a| < 1. */
export function fixedPoint(a: number, b: number, e: number): number {
  if (a >= 1) return Number.POSITIVE_INFINITY;
  return (b * e) / (1 - a);
}

export function simulateTrajectory({
  a,
  b,
  e,
  h0,
  steps,
  transformer = 0,
}: {
  a: number;
  b: number;
  e: number;
  h0: number;
  steps: number;
  transformer?: number;
}): number[] {
  const out: number[] = [h0];
  let h = h0;
  for (let t = 0; t < steps; t++) {
    h = a * h + b * e + transformer;
    out.push(h);
  }
  return out;
}

/** Sample ρ(A) across log_A for a fixed log_dt — always strictly below 1. */
export function sampleConstrainedRho(
  logDt: number,
  logAMin: number,
  logAMax: number,
  count: number,
): { logA: number; rho: number }[] {
  const n = Math.max(2, count);
  const out: { logA: number; rho: number }[] = [];
  for (let i = 0; i < n; i++) {
    const logA = logAMin + ((logAMax - logAMin) * i) / (n - 1);
    out.push({ logA, rho: discreteA(logA, logDt) });
  }
  return out;
}
