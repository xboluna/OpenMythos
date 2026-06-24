export type AttnType = "mla" | "gqa";

export type MythosConfig = {
  vocab_size: number;
  dim: number;
  n_heads: number;
  n_kv_heads: number;
  max_seq_len: number;
  max_loop_iters: number;
  prelude_layers: number;
  coda_layers: number;
  attn_type: AttnType;
  kv_lora_rank: number;
  q_lora_rank: number;
  qk_rope_head_dim: number;
  qk_nope_head_dim: number;
  v_head_dim: number;
  n_experts: number;
  n_shared_experts: number;
  n_experts_per_tok: number;
  expert_dim: number;
  act_threshold: number;
  rope_theta: number;
  lora_rank: number;
  max_output_tokens: number;
};

export type KvCacheBreakdown = {
  standard: number;
  gqa: number;
  mla: number;
  headDim: number;
};

/** Scalars stored per token in the KV cache for each attention method. */
export function kvCachePerToken(config: MythosConfig): KvCacheBreakdown {
  const headDim = config.dim / config.n_heads;
  return {
    standard: config.n_heads * headDim * 2,
    gqa: config.n_kv_heads * headDim * 2,
    mla: config.kv_lora_rank + config.n_heads * config.qk_rope_head_dim,
    headDim,
  };
}

/** Fraction of routed-expert parameters activated per token (top-K / N). */
export function routedActivationFraction(config: MythosConfig): number {
  return config.n_experts_per_tok / config.n_experts;
}
