/**
 * Hand-authored mirror of `open_mythos/variants.py`. Values are copied
 * verbatim from the Python factory functions. There is intentionally NO build
 * step (per PLAN §3.8 / §8) — update this file manually when the Python
 * variants change.
 *
 * `estimateParams` reconstructs the parameter breakdown from the same module
 * shapes used in `open_mythos/main.py`. Counts are *estimates* of total (not
 * activated) parameters and are labeled as such in the UI.
 */

import type { MythosConfig } from "./config";
import { DEFAULT_CONFIG } from "./config";

export type VariantId =
  | "1b"
  | "3b"
  | "10b"
  | "50b"
  | "100b"
  | "500b"
  | "1t";

export type Variant = {
  id: VariantId;
  /** Display name, e.g. "Mythos 1B". */
  name: string;
  /** Short description from the Python docstring. */
  blurb: string;
  config: MythosConfig;
};

function cfg(overrides: Partial<MythosConfig>): MythosConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

export const VARIANTS: Variant[] = [
  {
    id: "1b",
    name: "Mythos 1B",
    blurb:
      "Small research / fine-tuning model. dim=2048, 64 experts, 16 loop iters, 4k context.",
    config: cfg({
      vocab_size: 32000,
      dim: 2048,
      n_heads: 16,
      n_kv_heads: 4,
      max_seq_len: 4096,
      max_loop_iters: 16,
      prelude_layers: 2,
      coda_layers: 2,
      attn_type: "mla",
      kv_lora_rank: 256,
      q_lora_rank: 512,
      qk_rope_head_dim: 32,
      qk_nope_head_dim: 64,
      v_head_dim: 64,
      n_experts: 64,
      n_shared_experts: 2,
      n_experts_per_tok: 4,
      expert_dim: 2048,
      act_threshold: 0.99,
      rope_theta: 500000.0,
      lora_rank: 8,
    }),
  },
  {
    id: "3b",
    name: "Mythos 3B",
    blurb:
      "Compact inference model. dim=3072, 64 experts, 16 loop iters, 4k context.",
    config: cfg({
      vocab_size: 32000,
      dim: 3072,
      n_heads: 24,
      n_kv_heads: 6,
      max_seq_len: 4096,
      max_loop_iters: 16,
      prelude_layers: 2,
      coda_layers: 2,
      attn_type: "mla",
      kv_lora_rank: 384,
      q_lora_rank: 768,
      qk_rope_head_dim: 32,
      qk_nope_head_dim: 96,
      v_head_dim: 96,
      n_experts: 64,
      n_shared_experts: 2,
      n_experts_per_tok: 4,
      expert_dim: 4096,
      act_threshold: 0.99,
      rope_theta: 500000.0,
      lora_rank: 8,
    }),
  },
  {
    id: "10b",
    name: "Mythos 10B",
    blurb:
      "Mid-scale general model. dim=4096, 128 experts, 24 loop iters, 8k context.",
    config: cfg({
      vocab_size: 32000,
      dim: 4096,
      n_heads: 32,
      n_kv_heads: 8,
      max_seq_len: 8192,
      max_loop_iters: 24,
      prelude_layers: 2,
      coda_layers: 2,
      attn_type: "mla",
      kv_lora_rank: 512,
      q_lora_rank: 1024,
      qk_rope_head_dim: 64,
      qk_nope_head_dim: 128,
      v_head_dim: 128,
      n_experts: 128,
      n_shared_experts: 2,
      n_experts_per_tok: 4,
      expert_dim: 5632,
      act_threshold: 0.99,
      rope_theta: 500000.0,
      lora_rank: 16,
    }),
  },
  {
    id: "50b",
    name: "Mythos 50B",
    blurb:
      "Large reasoning model. dim=6144, 256 experts, 32 loop iters, 8k context.",
    config: cfg({
      vocab_size: 32000,
      dim: 6144,
      n_heads: 48,
      n_kv_heads: 8,
      max_seq_len: 8192,
      max_loop_iters: 32,
      prelude_layers: 3,
      coda_layers: 3,
      attn_type: "mla",
      kv_lora_rank: 512,
      q_lora_rank: 1536,
      qk_rope_head_dim: 64,
      qk_nope_head_dim: 128,
      v_head_dim: 128,
      n_experts: 256,
      n_shared_experts: 4,
      n_experts_per_tok: 4,
      expert_dim: 9728,
      act_threshold: 0.99,
      rope_theta: 500000.0,
      lora_rank: 32,
    }),
  },
  {
    id: "100b",
    name: "Mythos 100B",
    blurb:
      "Frontier-class model. dim=8192, 256 experts, 32 loop iters, 1M context, 128k output.",
    config: cfg({
      vocab_size: 32000,
      dim: 8192,
      n_heads: 64,
      n_kv_heads: 8,
      max_seq_len: 1000000,
      max_loop_iters: 32,
      prelude_layers: 4,
      coda_layers: 4,
      attn_type: "mla",
      kv_lora_rank: 512,
      q_lora_rank: 2048,
      qk_rope_head_dim: 64,
      qk_nope_head_dim: 128,
      v_head_dim: 128,
      n_experts: 256,
      n_shared_experts: 4,
      n_experts_per_tok: 8,
      expert_dim: 13568,
      act_threshold: 0.99,
      rope_theta: 1000000.0,
      lora_rank: 64,
      max_output_tokens: 131072,
    }),
  },
  {
    id: "500b",
    name: "Mythos 500B",
    blurb:
      "Ultra-scale MoE model. dim=12288, 512 experts, 48 loop iters, 1M context, 128k output.",
    config: cfg({
      vocab_size: 100000,
      dim: 12288,
      n_heads: 96,
      n_kv_heads: 16,
      max_seq_len: 1000000,
      max_loop_iters: 48,
      prelude_layers: 4,
      coda_layers: 4,
      attn_type: "mla",
      kv_lora_rank: 1024,
      q_lora_rank: 3072,
      qk_rope_head_dim: 64,
      qk_nope_head_dim: 128,
      v_head_dim: 128,
      n_experts: 512,
      n_shared_experts: 8,
      n_experts_per_tok: 8,
      expert_dim: 23040,
      act_threshold: 0.99,
      rope_theta: 1000000.0,
      lora_rank: 128,
      max_output_tokens: 131072,
    }),
  },
  {
    id: "1t",
    name: "Mythos 1T",
    blurb:
      "Maximum scale. dim=16384, 512 experts, 64 loop iters, 1M context, 128k output.",
    config: cfg({
      vocab_size: 100000,
      dim: 16384,
      n_heads: 128,
      n_kv_heads: 16,
      max_seq_len: 1000000,
      max_loop_iters: 64,
      prelude_layers: 6,
      coda_layers: 6,
      attn_type: "mla",
      kv_lora_rank: 1024,
      q_lora_rank: 4096,
      qk_rope_head_dim: 64,
      qk_nope_head_dim: 128,
      v_head_dim: 128,
      n_experts: 512,
      n_shared_experts: 8,
      n_experts_per_tok: 8,
      expert_dim: 34560,
      act_threshold: 0.99,
      rope_theta: 2000000.0,
      lora_rank: 256,
      max_output_tokens: 131072,
    }),
  },
];

export function getVariant(id: VariantId): Variant {
  const v = VARIANTS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown variant: ${id}`);
  return v;
}

// ---------------------------------------------------------------------------
// Parameter estimation (mirrors module shapes in open_mythos/main.py)
// ---------------------------------------------------------------------------

/** Linear weight param count (bias-free): in × out. */
function linear(inDim: number, outDim: number): number {
  return inDim * outDim;
}

/** Attention parameter count for one block, per attn_type. */
export function attnParams(c: MythosConfig): number {
  if (c.attn_type === "mla") {
    const qDown = linear(c.dim, c.q_lora_rank);
    const qNorm = c.q_lora_rank;
    const qUpNope = linear(c.q_lora_rank, c.n_heads * c.qk_nope_head_dim);
    const qUpRope = linear(c.q_lora_rank, c.n_heads * c.qk_rope_head_dim);
    const kvDown = linear(c.dim, c.kv_lora_rank + c.qk_rope_head_dim);
    const kvNorm = c.kv_lora_rank;
    const kvUp = linear(
      c.kv_lora_rank,
      c.n_heads * (c.qk_nope_head_dim + c.v_head_dim),
    );
    const wo = linear(c.n_heads * c.v_head_dim, c.dim);
    return qDown + qNorm + qUpNope + qUpRope + kvDown + kvNorm + kvUp + wo;
  }
  // GQA
  const headDim = Math.floor(c.dim / c.n_heads);
  const wq = linear(c.dim, c.n_heads * headDim);
  const wk = linear(c.dim, c.n_kv_heads * headDim);
  const wv = linear(c.dim, c.n_kv_heads * headDim);
  const wo = linear(c.n_heads * headDim, c.dim);
  return wq + wk + wv + wo;
}

/** Dense SwiGLU FFN (prelude/coda) — Expert(dim, dim*4//3). */
function denseFfnParams(c: MythosConfig): number {
  const hidden = Math.floor((c.dim * 4) / 3);
  return 3 * c.dim * hidden;
}

/** MoE FFN parameter count (recurrent block only). */
export function moeParams(c: MythosConfig): number {
  const router = linear(c.dim, c.n_experts);
  const routed = c.n_experts * (3 * c.dim * c.expert_dim);
  const shared =
    c.n_shared_experts * (3 * c.dim * (c.expert_dim * c.n_experts_per_tok));
  return router + routed + shared;
}

const blockNorms = (c: MythosConfig) => 2 * c.dim; // attn_norm + ffn_norm

export type ParamBreakdown = {
  embedding: number;
  preludeCoda: number;
  /** Recurrent block, everything except the MoE FFN (attn, norms, LTI/ACT/LoRA). */
  recurrentCore: number;
  moe: number;
  total: number;
};

export function estimateParams(c: MythosConfig): ParamBreakdown {
  const embedding = linear(c.vocab_size, c.dim); // tied with LM head → counted once

  const oneDenseBlock = attnParams(c) + denseFfnParams(c) + blockNorms(c);
  const preludeCoda = (c.prelude_layers + c.coda_layers) * oneDenseBlock;

  const recurrentAttn = attnParams(c) + blockNorms(c);
  const lti = 2 * c.dim + 1; // log_A (dim) + B (dim) + log_dt (1)
  const act = c.dim + 1; // halt Linear(dim, 1)
  const lora =
    linear(c.dim, c.lora_rank) + // down
    c.lora_rank * c.dim + // B
    c.max_loop_iters * c.lora_rank; // per-loop scale embedding
  const recurrentNorm = c.dim;
  const recurrentCore = recurrentAttn + lti + act + lora + recurrentNorm;

  const moe = moeParams(c);

  const finalNorm = c.dim;
  const total = embedding + preludeCoda + recurrentCore + moe + finalNorm;

  return { embedding, preludeCoda, recurrentCore, moe, total };
}

/** Human-readable parameter count, e.g. 1_234_567_890 → "1.23B". */
export function formatParams(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}
