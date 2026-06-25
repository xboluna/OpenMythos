/**
 * TypeScript port of `LTIInjection` from `open_mythos/main.py` (lines ~684-742).
 *
 * The recurrent hidden state evolves as the discrete linear time-invariant
 * (LTI) system:
 *
 *     h_{t+1} = A · h_t + B · e + transformer_out
 *
 * `A` is a diagonal matrix parameterized (Parcae, Prairie et al. 2026) so that
 * its spectral radius ρ(A) is guaranteed < 1 by construction:
 *
 *     A_continuous = Diag(-exp(log_A))         (always-negative diagonal)
 *     A_discrete   = exp(Δt · A_continuous)     (ZOH discretization, ∈ (0, 1))
 *
 * Implemented in log space exactly as the Python `get_A()`:
 *
 *     A = exp( -exp( clamp(log_dt + log_A, -20, 20) ) )
 *
 * All values are computed here on the client from the same formula — never
 * measured from a trained checkpoint.
 */

const CLAMP_LO = -20;
const CLAMP_HI = 20;

function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

/**
 * Discretized diagonal entry A_discrete for a single channel, matching
 * `LTIInjection.get_A()`. For scalar `logA` and `logDt`, returns a value
 * strictly in (0, 1).
 */
export function discreteA(logA: number, logDt: number): number {
  return Math.exp(-Math.exp(clamp(logDt + logA, CLAMP_LO, CLAMP_HI)));
}

/**
 * Spectral radius of the constrained diagonal A. Because A is diagonal with
 * all entries in (0, 1), ρ(A) = max(entries), which is always < 1.
 */
export function spectralRadiusConstrained(logA: number, logDt: number): number {
  return discreteA(logA, logDt);
}

/**
 * One step of the *linear* part of the update (ignoring the transformer term),
 * which is what governs stability:  h_{t+1} = A·h + B·e.
 */
export function ltiStep(h: number, e: number, a: number, b: number): number {
  return a * h + b * e;
}

/**
 * Simulate the linear recurrence for `steps` iterations from initial state h0,
 * holding the injected input `e` constant (as the real model does — `e` is
 * frozen after the Prelude). Returns the trajectory including h0.
 *
 * Works for both the constrained Parcae A (always stable) and an arbitrary
 * user-chosen `a` (which can be ≥ 1 to demonstrate divergence).
 */
export function simulateTrajectory(opts: {
  a: number;
  b: number;
  e: number;
  h0: number;
  steps: number;
}): number[] {
  const { a, b, e, h0, steps } = opts;
  const traj: number[] = [h0];
  let h = h0;
  for (let t = 0; t < steps; t++) {
    h = ltiStep(h, e, a, b);
    traj.push(h);
    // Guard against Infinity/NaN runaway so charts stay renderable.
    if (!Number.isFinite(h)) break;
  }
  return traj;
}

/**
 * Closed-form fixed point of h_{t+1} = a·h + b·e (for |a| < 1):
 *   h* = b·e / (1 - a)
 * Returns null when a == 1 (no fixed point / linear drift).
 */
export function fixedPoint(a: number, b: number, e: number): number | null {
  if (a === 1) return null;
  return (b * e) / (1 - a);
}

/**
 * Sample the constrained spectral radius across a range of `logA` values for a
 * fixed `logDt` — useful for plotting how Parcae keeps ρ(A) < 1 everywhere.
 */
export function sampleConstrainedRho(
  logDt: number,
  logAFrom = -4,
  logATo = 4,
  points = 120,
): { logA: number; rho: number }[] {
  const out: { logA: number; rho: number }[] = [];
  for (let i = 0; i < points; i++) {
    const logA = logAFrom + ((logATo - logAFrom) * i) / (points - 1);
    out.push({ logA, rho: discreteA(logA, logDt) });
  }
  return out;
}
