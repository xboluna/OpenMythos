/**
 * Shared constants for the /stability page.
 *
 * The numbers here mirror the real `LTIInjection` defaults so the page teaches
 * the same dynamics the model actually has. Everything is computed client-side
 * from `@/lib/lti` — never measured from a checkpoint.
 */

/** B initialization in the model: the input matrix is initialized at 0.1. */
export const B_INIT = 0.1;
/** Frozen encoded input magnitude used for the illustrative scalar recurrence. */
export const E_INPUT = 1;
/** Initial hidden state for the trajectory simulations. */
export const H0 = 1;
/** Number of loop iterations to simulate in the trajectory charts. */
export const STEPS = 30;

/** Slider range for the learned log_A parameter. */
export const LOG_A_RANGE = { min: -4, max: 4, step: 0.05 } as const;
/** Slider range for the learned log_dt parameter. */
export const LOG_DT_RANGE = { min: -4, max: 4, step: 0.05 } as const;
/** Slider range for the unconstrained `a` (can be pushed to ≥ 1 to diverge). */
export const A_RAW_RANGE = { min: 0, max: 1.6, step: 0.01 } as const;

/** Default parameter values: log_A = 0, log_dt = 0 → A = exp(-1) ≈ 0.368. */
export const DEFAULT_LOG_A = 0;
export const DEFAULT_LOG_DT = 0;
/** Default unconstrained `a` starts just past 1 to show the explosion. */
export const DEFAULT_A_RAW = 1.05;

/** Upper bound shown on the ρ(A) gauge (the stable zone is [0, 1)). */
export const GAUGE_MAX = 1.2;

/** Absolute source lines of `get_A()` in open_mythos/main.py (Parcae). */
export const GET_A_LINES = [722, 723, 724, 725];

export function formatNum(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return "∞";
  return x.toFixed(digits);
}
