/**
 * Illustrative ACT halting simulation (Graves, 2016).
 *
 * Per-token halting probabilities are synthesized with a seeded PRNG so easy
 * tokens halt early and hard tokens keep looping — matching the behavior shown
 * in RecurrentBlock.forward without requiring a trained checkpoint.
 */

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_TOKENS = [
  "the",
  "a",
  "is",
  "on",
  "mat",
  ".",
  "Given",
  "x",
  "=",
  "2",
  "theorem",
  "∴",
  "QED",
];

export type ActTokenResult = {
  text: string;
  /** Cumulative halting probability after each loop index (length = loops). */
  cumulative: number[];
  /** Loop index where this token crossed the threshold, or null if still running. */
  haltLoop: number | null;
};

function tokenDifficulty(text: string, index: number): number {
  if (text.length <= 2 || text === ".") return 0.12;
  if (/^[0-9=]$/.test(text)) return 0.18;
  if (text === "theorem" || text === "∴" || text === "QED") return 0.55;
  return 0.22 + (index % 5) * 0.04;
}

export function simulateAct(
  tokens: string[],
  loops: number,
  threshold: number,
): ActTokenResult[] {
  const rng = mulberry32(42);
  return tokens.map((text, i) => {
    const base = tokenDifficulty(text, i);
    let cumulative = 0;
    const cumulativeByLoop: number[] = [];
    let haltLoop: number | null = null;

    for (let t = 0; t < loops; t++) {
      if (haltLoop !== null) {
        cumulativeByLoop.push(cumulative);
        continue;
      }
      const p = Math.min(0.45, base * (0.55 + rng() * 0.9) * (1 + t * 0.08));
      const remainder = Math.max(0, 1 - cumulative);
      const weight =
        cumulative + p >= threshold ? remainder : p;
      cumulative = Math.min(1, cumulative + weight);
      cumulativeByLoop.push(cumulative);
      if (cumulative >= threshold) {
        haltLoop = t;
      }
    }

    return { text, cumulative: cumulativeByLoop, haltLoop };
  });
}
