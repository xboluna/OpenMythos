/**
 * Adaptive Computation Time (ACT) halting simulation.
 *
 * The accumulation logic here is a faithful port of the loop body in
 * `RecurrentBlock.forward` (`open_mythos/main.py` lines ~857-891), including
 * the ACT *remainder trick* and the `still_running` gate:
 *
 *     remainder = clamp(1 - cumulative_p, min=0)
 *     weight    = (cumulative_p + p >= threshold) ? remainder : p
 *     weight   *= still_running
 *     h_out    += weight * h
 *     cumulative_p += p * still_running
 *     halted    = halted OR (cumulative_p >= threshold)
 *
 * The per-step halting probabilities `p` themselves are NOT measured from a
 * model — in the real model they come from a learned `sigmoid(Linear(h))`.
 * Here we synthesize them with a seeded, deterministic logistic ramp so easy
 * tokens halt early and hard tokens keep looping. Clearly an illustration.
 */

export type TokenSpec = {
  text: string;
  /** 0 = trivial (halts almost immediately) … 1 = hardest (loops longest). */
  difficulty: number;
};

export type TokenActResult = {
  text: string;
  difficulty: number;
  /** Per-loop conditional halting probability p_t (the sigmoid head output). */
  perLoopP: number[];
  /** Per-loop ACT weight actually applied to h (the contribution to h_out). */
  perLoopWeight: number[];
  /** Cumulative halting probability after each loop. */
  cumulative: number[];
  /** Loop index at which this token halted, or null if it never crossed. */
  haltLoop: number | null;
};

/** Deterministic PRNG (mulberry32) so simulations are reproducible/shareable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Synthesize the per-step halting probability for one token at loop `t`.
 * Harder tokens have a later midpoint, so their `p_t` stays small longer.
 */
function haltProbability(
  difficulty: number,
  t: number,
  nLoops: number,
  noise: number,
): number {
  // Midpoint of the logistic ramp scales with difficulty across the loop range.
  const midpoint = 0.5 + difficulty * (nLoops - 1.5);
  const steepness = 1.1;
  const p = sigmoid(steepness * (t - midpoint) + noise);
  // Keep within (0, 1) and avoid exactly 0 so cumulative still advances slowly.
  return Math.min(0.999, Math.max(0.001, p));
}

/**
 * Run the ACT accumulation for a batch of tokens. Returns, per token, the
 * per-loop probabilities, the applied ACT weights, the cumulative curve, and
 * the halting loop.
 */
export function simulateAct(
  tokens: TokenSpec[],
  nLoops: number,
  threshold: number,
  seed = 1234,
): TokenActResult[] {
  return tokens.map((tok, idx) => {
    const rng = mulberry32(seed + idx * 7919);
    const perLoopP: number[] = [];
    const perLoopWeight: number[] = [];
    const cumulativeArr: number[] = [];

    let cumulative = 0;
    let halted = false;
    let haltLoop: number | null = null;

    for (let t = 0; t < nLoops; t++) {
      const noise = (rng() - 0.5) * 0.6;
      const p = haltProbability(tok.difficulty, t, nLoops, noise);
      perLoopP.push(p);

      const stillRunning = halted ? 0 : 1;
      const remainder = Math.max(0, 1 - cumulative);
      const weightRaw =
        cumulative + p >= threshold ? remainder : p;
      const weight = weightRaw * stillRunning;
      perLoopWeight.push(weight);

      cumulative += p * stillRunning;
      cumulativeArr.push(Math.min(1, cumulative));

      if (!halted && cumulative >= threshold) {
        halted = true;
        haltLoop = t;
      }
    }

    return {
      text: tok.text,
      difficulty: tok.difficulty,
      perLoopP,
      perLoopWeight,
      cumulative: cumulativeArr,
      haltLoop,
    };
  });
}

/**
 * A sample heterogeneous-difficulty sequence used as the default scenario in
 * the ACT / recurrent-loop visualizations. Common words are easy; rare or
 * compositional tokens are hard.
 */
export const DEFAULT_TOKENS: TokenSpec[] = [
  { text: "The", difficulty: 0.05 },
  { text: "cat", difficulty: 0.15 },
  { text: "sat", difficulty: 0.2 },
  { text: "on", difficulty: 0.05 },
  { text: "the", difficulty: 0.05 },
  { text: "theorem", difficulty: 0.85 },
  { text: "implies", difficulty: 0.7 },
  { text: "∴", difficulty: 0.95 },
];
