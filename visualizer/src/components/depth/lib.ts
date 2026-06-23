/**
 * Parametric, ILLUSTRATIVE model of inference-time depth scaling for the
 * recurrent (looped) transformer. NONE of these numbers are measured eval
 * results — they are a hand-tuned parametric curve inspired by Parcae-style
 * inference-time scaling laws, used purely to make the qualitative shape
 * (saturating gains → peak → overthinking decline) legible.
 *
 * The shape teaches three facts from the README:
 *   1. More test-time loops improve quality with SATURATING (diminishing) gains.
 *   2. Beyond a peak depth, excess recurrence DEGRADES the output — the hidden
 *      state drifts past the solution ("overthinking"). ACT halting mitigates it.
 *   3. A fixed-depth (vanilla) transformer is a FLAT baseline: it cannot add
 *      reasoning depth at inference time.
 */

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));

export type DepthModel = {
  /** Training default loop depth (config.max_loop_iters). */
  trainDefault: number;
  /** Upper end of the slider / chart x-axis. */
  maxLoops: number;
  /** Saturation time-constant of the rising phase. */
  tau: number;
  /** Quality ceiling the rising phase asymptotes toward. */
  qCeiling: number;
  /** Depth at which the overthinking penalty begins (the peak). */
  lPeak: number;
  /** Curvature of the overthinking decline. */
  penaltyExp: number;
  /** Total penalty accrued by maxLoops (sets how hard it degrades). */
  penaltyMax: number;
  /** Flat quality of a fixed-depth vanilla transformer (cannot extrapolate). */
  baseline: number;
};

/** Build the illustrative model from the selected variant's training default. */
export function buildModel(trainDefault: number): DepthModel {
  const maxLoops = Math.max(64, trainDefault * 4);
  const lPeak = Math.round(trainDefault * 1.5);
  return {
    trainDefault,
    maxLoops,
    tau: Math.max(trainDefault / 2, 2),
    qCeiling: 0.94,
    lPeak,
    penaltyExp: 1.8,
    penaltyMax: 0.42,
    baseline: 0.5,
  };
}

/** Saturating exponential rise toward the ceiling. */
export function rise(L: number, m: DepthModel): number {
  return m.qCeiling * (1 - Math.exp(-L / m.tau));
}

/** Overthinking penalty: zero until lPeak, then a smooth accelerating decline. */
export function penalty(L: number, m: DepthModel): number {
  if (L <= m.lPeak) return 0;
  const span = Math.max(1, m.maxLoops - m.lPeak);
  return m.penaltyMax * Math.pow((L - m.lPeak) / span, m.penaltyExp);
}

/** Final illustrative looped-model quality at depth L (clamped to [0, 1]). */
export function quality(L: number, m: DepthModel): number {
  return clamp(rise(L, m) - penalty(L, m), 0, 1);
}

export type DepthPoint = {
  loops: number;
  /** Looped-model quality (saturating rise then overthinking decline). */
  quality: number;
  /** Looped-model quality only inside the overthinking zone (for red fill). */
  overthink: number | null;
  /** Flat fixed-depth baseline. */
  baseline: number;
};

/** Sample the curve over every integer loop depth 1…maxLoops. */
export function sampleCurve(m: DepthModel): DepthPoint[] {
  const peak = peakLoops(m);
  return Array.from({ length: m.maxLoops }, (_, i) => {
    const loops = i + 1;
    const q = quality(loops, m);
    return {
      loops,
      quality: q,
      overthink: loops >= peak ? q : null,
      baseline: m.baseline,
    };
  });
}

/** Integer loop depth that maximizes illustrative quality. */
export function peakLoops(m: DepthModel): number {
  let best = 1;
  let bestQ = -Infinity;
  for (let L = 1; L <= m.maxLoops; L++) {
    const q = quality(L, m);
    if (q > bestQ) {
      bestQ = q;
      best = L;
    }
  }
  return best;
}

/**
 * Where the overthinking zone begins for display purposes: the loop depth at
 * which net quality stops improving (the peak). Beyond it, extra loops degrade.
 */
export function overthinkStart(m: DepthModel): number {
  return peakLoops(m);
}

// ---------------------------------------------------------------------------
// N-hop reasoning toy (illustrative)
// ---------------------------------------------------------------------------

/** Hops in the trained-on chain (illustrative framing: "trained on 5-hop"). */
export const TRAINED_HOPS = 5;
/** Total hops drawn in the toy chain graphic. */
export const TOTAL_HOPS = 9;

export type HopState = "solved" | "pending" | "broken";

/**
 * Map a loop depth to a chain of hop states. More loops complete more hops
 * (relative to the peak quality), but inside the overthinking zone the deepest
 * solved hops scramble — the hidden state has drifted past the answer.
 */
export function hopStates(L: number, m: DepthModel): HopState[] {
  const peak = peakLoops(m);
  const peakQ = quality(peak, m);
  const frac = peakQ > 0 ? clamp(quality(L, m) / peakQ, 0, 1) : 0;
  // How far the chain has been reasoned through, scaled by relative quality.
  let solved = Math.round(frac * TOTAL_HOPS);

  // Overthinking corrupts the frontier hops it had already solved.
  let broken = 0;
  if (L > peak) {
    const span = Math.max(1, m.maxLoops - peak);
    broken = Math.min(
      solved,
      Math.round((TOTAL_HOPS - TRAINED_HOPS + 1) * ((L - peak) / span)),
    );
    solved -= broken;
  }

  return Array.from({ length: TOTAL_HOPS }, (_, i) => {
    if (i < solved) return "solved";
    if (i < solved + broken) return "broken";
    return "pending";
  });
}

/** Relative inference compute (∝ loops) vs the training default depth. */
export function computeMultiple(L: number, trainDefault: number): number {
  return L / trainDefault;
}
