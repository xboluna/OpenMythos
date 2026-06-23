/**
 * Deterministic, illustrative synthesis helpers for the /recurrent-loop page.
 *
 * NONE of these values are measured from a trained model. They are seeded
 * simulations derived from the same update rule the real `RecurrentBlock.forward`
 * uses (LTI injection + per-loop transformer contribution), so the visuals
 * evolve smoothly and tell the right story:
 *   - `e` is frozen (identical every loop),
 *   - `h` evolves and converges toward a fixed point when `e` is injected,
 *   - `h` decays toward zero (loses the input) when injection is off.
 */

import { mulberry32 } from "@/lib/act";

/** Number of cells rendered per 1-D state heat strip. */
export const STRIP_CELLS = 40;

function clamp1(x: number): number {
  return Math.max(-1, Math.min(1, x));
}

/** The frozen encoded input `e` — generated once, reused every loop. */
export function frozenE(cells: number = STRIP_CELLS, seed = 7): number[] {
  const rng = mulberry32(seed);
  return Array.from({ length: cells }, (_, i) => {
    const base =
      Math.sin(i * 0.45 + 0.5) * 0.55 +
      Math.cos(i * 0.19) * 0.32 +
      (rng() - 0.5) * 0.16;
    return clamp1(base);
  });
}

/** Per-channel stable LTI parameters (diagonal A in (0,1), input gain B). */
function channelParams(cells: number, seed = 13) {
  const rng = mulberry32(seed);
  return Array.from({ length: cells }, () => ({
    a: 0.55 + rng() * 0.3, // spectral entry in (0.55, 0.85): always stable
    b: 0.36 + rng() * 0.16,
  }));
}

export type LoopFields = {
  /** Frozen encoded input, length `cells`. */
  e: number[];
  /** Hidden state per loop: `h[t]` is the state entering loop `t` (length nLoops+1). */
  h: number[][];
  /** Transformer contribution per loop, `transOut[t]` (length nLoops). */
  transOut: number[][];
};

/**
 * Roll out the (illustrative) hidden-state trajectory for `nLoops` iterations
 * using `h_{t+1} = A·h_t + B·e + transformer(h_t)`. When `inject` is false the
 * `B·e` term is dropped, so the state drifts toward zero and loses the input.
 */
export function synthFields(
  nLoops: number,
  inject: boolean,
  cells: number = STRIP_CELLS,
): LoopFields {
  const e = frozenE(cells);
  const params = channelParams(cells);
  const h: number[][] = [];
  const transOut: number[][] = [];

  const rng0 = mulberry32(99);
  let cur = Array.from({ length: cells }, () => (rng0() - 0.5) * 0.15);
  h.push([...cur]);

  const tau = Math.max(4, nLoops * 0.6);
  for (let t = 0; t < nLoops; t++) {
    // Per-loop transformer contribution: a slowly shifting pattern whose
    // magnitude decays as the state settles (smaller residual updates).
    const scale = 0.55 * Math.exp(-t / tau);
    const to = Array.from({ length: cells }, (_, i) => {
      const sig =
        Math.sin(i * 0.3 + t * 0.55) * 0.6 +
        Math.cos(i * 0.12 - t * 0.2) * 0.4;
      return clamp1(scale * sig);
    });
    transOut.push(to);

    cur = cur.map((hi, i) => {
      const { a, b } = params[i];
      const inj = inject ? b * e[i] : 0;
      return clamp1(a * hi + inj + to[i]);
    });
    h.push([...cur]);
  }

  return { e, h, transOut };
}

/**
 * Smooth per-loop LoRA delta magnitude in [~0.15, 1]. Depth-wise LoRA shifts
 * behavior per loop index; here we synthesize a smooth bump that peaks in the
 * middle loops (illustrative).
 */
export function loraScale(t: number, nLoops: number): number {
  if (nLoops <= 1) return 0.6;
  const x = t / (nLoops - 1);
  const bump = Math.exp(-((x - 0.45) ** 2) / 0.12);
  return 0.18 + 0.82 * bump;
}

/**
 * Diverging blue → neutral → amber color scale for signed values in [-1, 1].
 * Negative leans blue (prelude), positive leans amber (recurrent), zero is a
 * dark neutral that reads on the dark theme.
 */
export function divergingColor(value: number): string {
  const x = Math.max(-1, Math.min(1, value));
  const mag = Math.abs(x);
  const neutral = [42, 42, 48];
  const blue = [59, 130, 246];
  const amber = [245, 158, 11];
  const target = x < 0 ? blue : amber;
  const r = Math.round(neutral[0] + (target[0] - neutral[0]) * mag);
  const g = Math.round(neutral[1] + (target[1] - neutral[1]) * mag);
  const b = Math.round(neutral[2] + (target[2] - neutral[2]) * mag);
  return `rgb(${r} ${g} ${b})`;
}

/** L2 norm of a vector — used to summarize how big a state/contribution is. */
export function norm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}
