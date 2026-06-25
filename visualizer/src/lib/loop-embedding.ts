/**
 * TypeScript port of `loop_index_embedding` from `open_mythos/main.py`
 * (lines ~541-570).
 *
 * Injects a sinusoidal loop-index signal into the first `loop_dim` channels of
 * the hidden state — analogous to RoPE, but over recurrence depth rather than
 * sequence position. This lets the shared recurrent-block weights behave
 * differently at each loop iteration ("same weights, different loop index").
 *
 *     freqs  = 1 / theta^(arange(0, loop_dim, 2) / loop_dim)
 *     angles = loop_t * freqs                         # length loop_dim/2
 *     emb    = concat(sin(angles), cos(angles))[:loop_dim]
 *
 * The embedding is *added* to the first `loop_dim` channels of h.
 */

export const DEFAULT_LOOP_THETA = 10000.0;

/**
 * The additive loop-index embedding vector (length `loopDim`) at iteration
 * `loopT`. `loopDim` should be even (the model uses `dim // 8`).
 */
export function loopIndexEmbedding(
  loopT: number,
  loopDim: number,
  theta: number = DEFAULT_LOOP_THETA,
): number[] {
  const half = Math.floor(loopDim / 2);
  const angles: number[] = [];
  for (let i = 0; i < half; i++) {
    const freq = 1 / Math.pow(theta, (2 * i) / loopDim);
    angles.push(loopT * freq);
  }
  const sin = angles.map(Math.sin);
  const cos = angles.map(Math.cos);
  return [...sin, ...cos].slice(0, loopDim);
}

/**
 * For a fixed channel index, the waveform of its loop-index embedding value as
 * the loop iteration sweeps 0 … nLoops-1. Useful for showing how a single
 * channel's injected signal oscillates across depth.
 */
export function channelWaveform(
  channel: number,
  nLoops: number,
  loopDim: number,
  theta: number = DEFAULT_LOOP_THETA,
): { loop: number; value: number }[] {
  const out: { loop: number; value: number }[] = [];
  for (let t = 0; t < nLoops; t++) {
    const emb = loopIndexEmbedding(t, loopDim, theta);
    out.push({ loop: t, value: emb[channel] ?? 0 });
  }
  return out;
}

/**
 * Full (loop × channel) grid of embedding values — for rendering a heatmap of
 * the loop-index signal across depth.
 */
export function embeddingGrid(
  nLoops: number,
  loopDim: number,
  theta: number = DEFAULT_LOOP_THETA,
): number[][] {
  const grid: number[][] = [];
  for (let t = 0; t < nLoops; t++) {
    grid.push(loopIndexEmbedding(t, loopDim, theta));
  }
  return grid;
}
