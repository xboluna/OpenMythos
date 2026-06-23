import type { ParamBreakdown } from "@/lib/variants";

/**
 * The four parameter-breakdown segments shared across the table, chart, and
 * detail panel. Colors are pulled from the design-token CSS variables so the
 * meaning stays consistent everywhere:
 *   embedding      → neutral (muted-foreground)
 *   prelude / coda → blue   (stage-prelude)
 *   recurrent core → amber  (stage-recurrent)
 *   MoE experts    → violet (stage-coda)
 */
export type SegmentKey = Exclude<keyof ParamBreakdown, "total">;

export type Segment = {
  key: SegmentKey;
  label: string;
  color: string;
};

export const SEGMENTS: Segment[] = [
  { key: "embedding", label: "Embedding", color: "var(--muted-foreground)" },
  { key: "preludeCoda", label: "Prelude / Coda", color: "var(--stage-prelude)" },
  {
    key: "recurrentCore",
    label: "Recurrent core",
    color: "var(--stage-recurrent)",
  },
  { key: "moe", label: "MoE experts", color: "var(--stage-coda)" },
];

/**
 * Compact integer formatter that prefers exact binary (×1024) groupings where
 * they apply (so 4096 → "4K", 131072 → "128k") and decimal millions otherwise
 * (1000000 → "1M"). `unit` controls the thousands suffix casing.
 */
function compact(n: number, unit: "K" | "k"): string {
  if (n >= 1_000_000) {
    return n % 1_000_000 === 0
      ? `${n / 1_000_000}M`
      : `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1024 && n % 1024 === 0) return `${n / 1024}${unit}`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}${unit}`;
  return `${n}`;
}

/** Format a context window length, e.g. 1000000 → "1M", 4096 → "4K". */
export const formatContext = (n: number) => compact(n, "K");

/** Format a max-output token count, e.g. 131072 → "128k", 4096 → "4k". */
export const formatTokens = (n: number) => compact(n, "k");

/** Short variant label for chart axes, e.g. "Mythos 1B" → "1B". */
export const shortName = (id: string) => id.toUpperCase();
