import type { MythosConfig } from "@/lib/config";

/**
 * The forward-pass pipeline as a sequence of "packet" steps. The token packet
 * travels through these stages one at a time; each step maps to the absolute
 * source lines in `open_mythos/main.py` → `OpenMythos.forward` so the
 * <CodeRefPanel> can highlight the matching implementation live.
 */

export type StageKind = "neutral" | "prelude" | "recurrent" | "coda";

export type StageDetail = { label: string; value: string };

export type Stage = {
  id: string;
  title: string;
  kind: StageKind;
  /** Tensor shape annotation (rendered in font-mono). */
  shape: string;
  /** Absolute source lines in open_mythos/main.py. */
  activeLines: number[];
  /** Short corner badge, e.g. "× 16". */
  badge?: string;
  /** One-line description shown under the title. */
  blurb: string;
  /** Tooltip rows. */
  details: StageDetail[];
  /** Recurrent block — links through to /recurrent-loop. */
  clickable?: boolean;
  /** Freeze-e — rendered as a tapped-off branch. */
  branch?: boolean;
};

/** Index of the recurrent stage in the step sequence. */
export const RECURRENT_STEP = 3;

/** CSS variable for a stage colour (SVG / inline-style use). */
export function stageVar(kind: StageKind): string {
  switch (kind) {
    case "prelude":
      return "var(--stage-prelude)";
    case "recurrent":
      return "var(--stage-recurrent)";
    case "coda":
      return "var(--stage-coda)";
    default:
      return "var(--border)";
  }
}

export function buildStages(config: MythosConfig, loops: number): Stage[] {
  const { dim, vocab_size } = config;
  return [
    {
      id: "embedding",
      title: "Embedding",
      kind: "neutral",
      shape: `(B, T) → (B, T, ${dim})`,
      activeLines: [1019],
      blurb: "Look up token IDs in the embedding table (weight-tied with the LM head).",
      details: [
        { label: "op", value: "embed(input_ids)" },
        { label: "out", value: `(B, T, ${dim})` },
      ],
    },
    {
      id: "prelude",
      title: "Prelude",
      kind: "prelude",
      shape: `(B, T, ${dim})`,
      activeLines: [1025, 1026],
      badge: `× ${config.prelude_layers}`,
      blurb: "Standard transformer blocks with a dense SwiGLU FFN. Encodes the input — runs once.",
      details: [
        { label: "layers", value: `${config.prelude_layers} × TransformerBlock` },
        { label: "ffn", value: "dense SwiGLU" },
        { label: "runs", value: "once" },
      ],
    },
    {
      id: "freeze-e",
      title: "Freeze e = x",
      kind: "prelude",
      shape: `e : (B, T, ${dim})`,
      activeLines: [1028],
      branch: true,
      blurb: "Capture the encoded input. It is re-injected into the recurrent block at every loop.",
      details: [
        { label: "capture", value: "e = x" },
        { label: "used in", value: "every loop iteration" },
      ],
    },
    {
      id: "recurrent",
      title: "Recurrent Block",
      kind: "recurrent",
      shape: `(B, T, ${dim})`,
      activeLines: [1029],
      badge: `× ${loops} loops`,
      clickable: true,
      blurb: "One MoE transformer block, looped with shared weights. Re-injects e and updates a stable state.",
      details: [
        { label: "block", value: "1 × TransformerBlock (MoE FFN)" },
        { label: "loops", value: `${loops} × shared weights` },
        { label: "experts", value: `${config.n_experts} (top-${config.n_experts_per_tok})` },
        { label: "update", value: "h ← A·h + B·e + T(h, e)" },
      ],
    },
    {
      id: "coda",
      title: "Coda",
      kind: "coda",
      shape: `(B, T, ${dim})`,
      activeLines: [1031, 1032],
      badge: `× ${config.coda_layers}`,
      blurb: "Standard transformer blocks with a dense FFN. Decodes the looped state — runs once.",
      details: [
        { label: "layers", value: `${config.coda_layers} × TransformerBlock` },
        { label: "ffn", value: "dense SwiGLU" },
        { label: "runs", value: "once" },
      ],
    },
    {
      id: "head",
      title: "RMSNorm → LM Head",
      kind: "neutral",
      shape: `(B, T, ${dim}) → (B, T, ${vocab_size})`,
      activeLines: [1034],
      blurb: "Final RMSNorm, then the weight-tied LM head projects to vocabulary logits.",
      details: [
        { label: "norm", value: "RMSNorm" },
        { label: "head", value: "weight-tied with embedding" },
        { label: "out", value: `(B, T, ${vocab_size})` },
      ],
    },
  ];
}
