import type { AttnType } from "@/lib/config";

/**
 * Shared constants + helpers for the /attention page.
 *
 * Accent colors are taken from the global design tokens so the two methods stay
 * visually distinct everywhere on the page:
 *   - MLA  → stage-coda (violet)
 *   - GQA  → stage-prelude (blue)
 *   - standard multi-head baseline → neutral / muted
 */

export const METHOD_COLOR = {
  mla: "var(--stage-coda)",
  gqa: "var(--stage-prelude)",
  standard: "var(--muted-foreground)",
} as const;

export type CacheMethod = keyof typeof METHOD_COLOR;

export const METHOD_LABEL: Record<CacheMethod, string> = {
  standard: "Standard MHA",
  gqa: "GQA",
  mla: "MLA",
};

export function methodColor(method: CacheMethod): string {
  return METHOD_COLOR[method];
}

export function accentFor(attn: AttnType): string {
  return METHOD_COLOR[attn];
}

/** Compact scalar count, e.g. 2_097_152 → "2.10M". */
export function formatScalars(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}G`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

/** Grouped thousands, e.g. 2097152 → "2,097,152". */
export function formatInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** A short "Nx smaller" reduction factor string. */
export function formatFactor(factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0) return "—";
  if (factor >= 100) return `${Math.round(factor)}×`;
  if (factor >= 10) return `${factor.toFixed(1)}×`;
  return `${factor.toFixed(2)}×`;
}

/** Context-length presets surfaced on the slider, in tokens. */
export const CONTEXT_PRESETS = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];

/** Snap a continuous slider index to a power-of-two-ish context length. */
export function contextFromIndex(index: number): number {
  const clamped = Math.max(0, Math.min(CONTEXT_PRESETS.length - 1, index));
  return CONTEXT_PRESETS[clamped];
}

export function indexFromContext(ctx: number): number {
  const i = CONTEXT_PRESETS.indexOf(ctx);
  return i === -1 ? 3 : i;
}
