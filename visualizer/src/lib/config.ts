/**
 * TypeScript mirror of `open_mythos/main.py` → `MythosConfig`.
 *
 * This is the single source of truth for the configuration surface the
 * visualizer exposes. Field names and defaults are kept identical to the
 * Python dataclass so labels, formulas, and computed values line up exactly
 * with the real model. When `MythosConfig` changes in Python, update here.
 */

export type AttnType = "mla" | "gqa";

export type MythosConfig = {
  // Core
  vocab_size: number;
  dim: number;
  n_heads: number;
  /** GQA: number of key/value heads (ignored by MLA). */
  n_kv_heads: number;
  max_seq_len: number;
  /** T — default recurrent loop depth at inference. */
  max_loop_iters: number;
  prelude_layers: number;
  coda_layers: number;

  // Attention
  attn_type: AttnType;
  /** [MLA] compressed KV latent cached instead of full K/V. */
  kv_lora_rank: number;
  /** [MLA] compressed Q latent dim. */
  q_lora_rank: number;
  /** [MLA] per-head dims that receive RoPE. */
  qk_rope_head_dim: number;
  /** [MLA] per-head dims without RoPE. */
  qk_nope_head_dim: number;
  /** [MLA] per-head value dim. */
  v_head_dim: number;

  // MoE FFN (recurrent block only)
  n_experts: number;
  n_shared_experts: number;
  /** top-K routed experts per token. */
  n_experts_per_tok: number;
  expert_dim: number;

  // Stability / adaptation
  act_threshold: number;
  rope_theta: number;
  lora_rank: number;

  // Misc
  max_output_tokens: number;
  dropout: number;
};

/** Matches `MythosConfig()` defaults in `open_mythos/main.py`. */
export const DEFAULT_CONFIG: MythosConfig = {
  vocab_size: 32000,
  dim: 2048,
  n_heads: 16,
  n_kv_heads: 4,
  max_seq_len: 4096,
  max_loop_iters: 16,
  prelude_layers: 2,
  coda_layers: 2,
  attn_type: "mla",
  kv_lora_rank: 512,
  q_lora_rank: 1536,
  qk_rope_head_dim: 64,
  qk_nope_head_dim: 128,
  v_head_dim: 128,
  n_experts: 64,
  n_shared_experts: 2,
  n_experts_per_tok: 4,
  expert_dim: 512,
  act_threshold: 0.99,
  rope_theta: 500000.0,
  lora_rank: 16,
  max_output_tokens: 4096,
  dropout: 0.0,
};

/**
 * Per-token KV cache size (in number of cached scalars) for each attention
 * type, derived from the formulas documented in `docs/open_mythos.md`.
 *
 *   GQA: n_kv_heads × head_dim × 2          (full K and V, fewer KV heads)
 *   MLA: kv_lora_rank + n_heads × qk_rope_head_dim   (latent + RoPE keys)
 *
 * The "standard" multi-head attention baseline caches n_heads × head_dim × 2.
 */
export function kvCachePerToken(cfg: MythosConfig) {
  const headDim = Math.floor(cfg.dim / cfg.n_heads);
  const gqa = cfg.n_kv_heads * headDim * 2;
  const mla = cfg.kv_lora_rank + cfg.n_heads * cfg.qk_rope_head_dim;
  const standard = cfg.n_heads * headDim * 2;
  return { gqa, mla, standard, headDim };
}

/** Fraction of routed-expert parameters activated per token. */
export function routedActivationFraction(cfg: MythosConfig) {
  return cfg.n_experts_per_tok / cfg.n_experts;
}
