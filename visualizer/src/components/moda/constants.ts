/**
 * Shared constants + seeded illustrative-math helpers for the /moda page.
 *
 * Values mirror `MoDAConfig` defaults in `open_mythos/moda.py` (the
 * experimental MoDA + DeepSeek-MoE architecture). All scores produced by the
 * helpers here are *seeded, illustrative simulations* — never real model
 * activations.
 */

/** Defaults from `MoDAConfig` (open_mythos/moda.py ~L59). */
export const MODA_CONFIG = {
  dModel: 2048,
  nLayers: 24,
  nHeadsQ: 16,
  nHeadsKv: 8,
  headDim: 128,
  // DeepSeek MoE FFN
  nSharedExperts: 2, // K_s — always active
  nRoutedExperts: 64, // N_r — routed pool
  nActivatedExperts: 6, // K' — top-K per token
  expertHiddenDim: 704,
  moeBalanceAlpha: 0.001,
  moeScoreFunc: "softmax" as const,
} as const;

/** Teal "experimental / alternative track" accent — distinct from the core
 * stage palette (prelude=blue, recurrent=amber, coda=violet). */
export const MODA_ACCENT = "#2dd4bf"; // teal-400
export const MODA_SEQ = "#94a3b8"; // slate-400 (sequence keys)

/** Deterministic PRNG (mulberry32) so every render is reproducible. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Numerically-stable softmax over a flat array. */
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const m = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

/** Seeded logits in roughly [-1.5, 1.5], used to fake attention affinities. */
export function seededLogits(seed: number, n: number): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => (rand() - 0.5) * 3);
}
