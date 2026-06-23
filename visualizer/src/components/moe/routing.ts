/**
 * Illustrative simulation of `MoEFFN.forward` (open_mythos/main.py:497-533).
 *
 * Router logits here are SYNTHESIZED, not learned — they are a deterministic
 * function of (tokenIndex, loopIndex, expertId) so that:
 *   - the same token routes to a different expert subset at each loop depth, and
 *   - the whole page is reproducible across renders.
 *
 * What is faithful to the real model is the *mechanism*:
 *   logits  = router(token)                       # unbiased
 *   scores  = softmax(logits)                      # gating weights (unbiased)
 *   topk    = topk(logits + router_bias, k)        # SELECTION uses the bias
 *   weights = scores[topk] / sum(scores[topk])     # renormalized combine weights
 * The aux-loss-free load-balancing bias (DeepSeek-V3) shifts only *which*
 * experts are selected; the gating weights still come from the unbiased
 * softmax, so the bias never enters the gradient.
 */

/** Mulberry32 — small, fast, seedable PRNG. Returns a float in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 32-bit seed from a list of integers (FNV-1a style). */
export function hashSeed(...nums: number[]): number {
  let h = 2166136261 >>> 0;
  for (const n of nums) {
    h ^= (n + 0x9e3779b9) | 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Standard-normal sample via Box–Muller, driven by a uniform generator. */
function gaussian(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Per-expert intrinsic "popularity". This is what makes load imbalanced when
 * the router has no balancing bias: a handful of experts are inherently more
 * attractive and would hog the traffic. Deterministic in `nExperts`.
 */
const popularityCache = new Map<number, number[]>();
export function expertPopularity(nExperts: number): number[] {
  const cached = popularityCache.get(nExperts);
  if (cached) return cached;
  const rng = mulberry32(hashSeed(nExperts, 0x10ad));
  // Heavy-tailed: most experts near zero, a few clearly preferred.
  const pop = Array.from({ length: nExperts }, () => {
    const u = rng();
    return Math.pow(u, 2.2) * 5.5;
  });
  popularityCache.set(nExperts, pop);
  return pop;
}

/**
 * Aux-loss-free balancing bias. Conceptually the bias is nudged up for
 * underused experts and down for overused ones; at convergence it roughly
 * cancels the intrinsic popularity skew. We model that directly as the
 * negative, mean-centered popularity (scaled by `strength`).
 */
const biasCache = new Map<string, number[]>();
export function loadBalanceBias(nExperts: number, strength = 1): number[] {
  const key = `${nExperts}:${strength}`;
  const cached = biasCache.get(key);
  if (cached) return cached;
  const pop = expertPopularity(nExperts);
  const mean = pop.reduce((a, b) => a + b, 0) / nExperts;
  const bias = pop.map((p) => -(p - mean) * strength);
  biasCache.set(key, bias);
  return bias;
}

/** Unbiased router logits for one token at one loop depth. */
export function tokenLogits(
  tokenIndex: number,
  loopIndex: number,
  nExperts: number,
): number[] {
  const pop = expertPopularity(nExperts);
  const rng = mulberry32(hashSeed(tokenIndex, loopIndex, nExperts));
  return pop.map((p) => p + gaussian(rng) * 1.6);
}

/** Numerically stable softmax. */
export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

export type RoutingResult = {
  /** Unbiased router logits. */
  logits: number[];
  /** Full gating distribution = softmax(logits). */
  scores: number[];
  /** Selected expert ids (length = topk), highest selection score first. */
  topkIdx: number[];
  /** Gating scores gathered at the selected ids (pre-renormalization). */
  topkScores: number[];
  /** Renormalized combine weights for the selected experts (sum to 1). */
  topkWeights: number[];
  /** Whether the balancing bias was applied to the selection. */
  biasOn: boolean;
};

/**
 * Replicates the routing of `MoEFFN.forward` over a pool of `nExperts`.
 * Selection optionally uses the load-balancing bias; gating weights never do.
 */
export function computeRouting(params: {
  tokenIndex: number;
  loopIndex: number;
  nExperts: number;
  topk: number;
  biasOn: boolean;
}): RoutingResult {
  const { tokenIndex, loopIndex, nExperts, biasOn } = params;
  const topk = Math.min(params.topk, nExperts);

  const logits = tokenLogits(tokenIndex, loopIndex, nExperts);
  const scores = softmax(logits);

  const bias = biasOn ? loadBalanceBias(nExperts) : null;
  const selection = logits.map((l, e) => l + (bias ? bias[e] : 0));

  // top-k by selection score (logits + bias)
  const order = selection
    .map((s, e) => ({ s, e }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topk);

  const topkIdx = order.map((o) => o.e);
  const topkScores = topkIdx.map((e) => scores[e]);
  const sum = topkScores.reduce((a, b) => a + b, 0) || 1;
  const topkWeights = topkScores.map((s) => s / sum);

  return { logits, scores, topkIdx, topkScores, topkWeights, biasOn };
}

/**
 * Tallies how often each expert lands in the top-k across a population of
 * synthetic tokens (at a fixed loop depth). Used by the load-balancing demo.
 */
export function computeLoad(params: {
  nExperts: number;
  topk: number;
  biasOn: boolean;
  nTokens: number;
  loopIndex: number;
}): number[] {
  const { nExperts, topk, biasOn, nTokens, loopIndex } = params;
  const counts = new Array<number>(nExperts).fill(0);
  for (let t = 0; t < nTokens; t++) {
    const { topkIdx } = computeRouting({
      tokenIndex: t,
      loopIndex,
      nExperts,
      topk,
      biasOn,
    });
    for (const e of topkIdx) counts[e] += 1;
  }
  return counts;
}

/** Gini coefficient of a load distribution — 0 = perfectly even, 1 = maximally skewed. */
export function gini(counts: number[]): number {
  const n = counts.length;
  if (n === 0) return 0;
  const sorted = [...counts].sort((a, b) => a - b);
  const total = sorted.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let cum = 0;
  for (let i = 0; i < n; i++) cum += (i + 1) * sorted[i];
  return (2 * cum) / (n * total) - (n + 1) / n;
}

/** Example token strings for the selection row (illustrative). */
export const EXAMPLE_TOKENS: { text: string; hint: string }[] = [
  { text: "The", hint: "function word" },
  { text: "mitochondria", hint: "biology" },
  { text: "≈", hint: "math symbol" },
  { text: "def", hint: "code keyword" },
  { text: "Tokyo", hint: "named entity" },
  { text: "running", hint: "morphology" },
  { text: "因为", hint: "non-Latin script" },
  { text: "42", hint: "numeral" },
];

/** Routed = amber (recurrent FFN); Shared = violet (always-on lane). */
export const ROUTED_COLOR = "var(--stage-recurrent)";
export const SHARED_COLOR = "var(--stage-coda)";

/** Number of expert cells we actually render (representative sample). */
export function visibleExpertCount(nExperts: number): number {
  return Math.min(nExperts, 64);
}
