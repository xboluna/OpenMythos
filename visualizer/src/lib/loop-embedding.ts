/**
 * TypeScript port of `loop_index_embedding()` from open_mythos/main.py.
 *
 * RoPE-like sinusoids over recurrence depth (not sequence position).
 */

const DEFAULT_THETA = 10_000;

function loopChannelValue(
  channel: number,
  loopT: number,
  loopDim: number,
  theta = DEFAULT_THETA,
): number {
  const half = Math.max(1, Math.floor(loopDim / 2));
  const pair = Math.floor(channel / 2);
  const freq = 1 / theta ** (pair / loopDim);
  const angle = loopT * freq;
  return channel % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

export type WaveformPoint = { value: number };

/** Values injected into `channel` as loop index sweeps 0 … loops−1. */
export function channelWaveform(
  channel: number,
  loops: number,
  loopDim: number,
): WaveformPoint[] {
  return Array.from({ length: Math.max(1, loops) }, (_, loopT) => ({
    value: loopChannelValue(channel, loopT, loopDim),
  }));
}
