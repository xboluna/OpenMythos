import type { MythosConfig, AttnType } from "./config";

export type VariantId =
  | "mythos_1b"
  | "mythos_3b"
  | "mythos_10b"
  | "mythos_50b"
  | "mythos_100b"
  | "mythos_500b"
  | "mythos_1t";

export type Variant = {
  id: VariantId;
  name: string;
  blurb: string;
  config: MythosConfig;
};

export type ParamBreakdown = {
  embedding: number;
  preludeCoda: number;
  recurrentCore: number;
  moe: number;
  total: number;
};

const base = (
  config: Omit<MythosConfig, "max_output_tokens"> & { max_output_tokens?: number },
): MythosConfig => ({
  ...config,
  max_output_tokens: config.max_output_tokens ?? 4096,
});

export const VARIANTS: Variant[] = [
  {
    id: "mythos_1b",
    name: "Mythos 1B",
    blurb:
      "Small research/fine-tuning model. dim=2048, 64 experts, 16 loop iters, 4k context.",
    config: base({
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
      rope_theta: 500_000,
      lora_rank: 8,
    }),
  },
  {
    id: "mythos_3b",
    name: "Mythos 3B",
    blurb:
      "Compact inference model. dim=3072, 64 experts, 16 loop iters, 4k context.",
    config: base({
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
      rope_theta: 500_000,
      lora_rank: 8,
    }),
  },
  {
    id: "mythos_10b",
    name: "Mythos 10B",
    blurb:
      "Mid-scale general model. dim=4096, 128 experts, 24 loop iters, 8k context.",
    config: base({
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
      rope_theta: 500_000,
      lora_rank: 16,
    }),
  },
  {
    id: "mythos_50b",
    name: "Mythos 50B",
    blurb:
      "Large reasoning model. dim=6144, 256 experts, 32 loop iters, 8k context.",
    config: base({
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
      rope_theta: 500_000,
      lora_rank: 32,
    }),
  },
  {
    id: "mythos_100b",
    name: "Mythos 100B",
    blurb:
      "Frontier-class model. dim=8192, 256 experts, 32 loop iters, 1M context, 128k output.",
    config: base({
      vocab_size: 32000,
      dim: 8192,
      n_heads: 64,
      n_kv_heads: 8,
      max_seq_len: 1_000_000,
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
      rope_theta: 1_000_000,
      lora_rank: 64,
      max_output_tokens: 131_072,
    }),
  },
  {
    id: "mythos_500b",
    name: "Mythos 500B",
    blurb:
      "Ultra-scale MoE model. dim=12288, 512 experts, 48 loop iters, 1M context, 128k output.",
    config: base({
      vocab_size: 100_000,
      dim: 12_288,
      n_heads: 96,
      n_kv_heads: 16,
      max_seq_len: 1_000_000,
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
      expert_dim: 23_040,
      act_threshold: 0.99,
      rope_theta: 1_000_000,
      lora_rank: 128,
      max_output_tokens: 131_072,
    }),
  },
  {
    id: "mythos_1t",
    name: "Mythos 1T",
    blurb:
      "Maximum scale. dim=16384, 512 experts, 64 loop iters, 1M context, 128k output.",
    config: base({
      vocab_size: 100_000,
      dim: 16_384,
      n_heads: 128,
      n_kv_heads: 16,
      max_seq_len: 1_000_000,
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
      expert_dim: 34_560,
      act_threshold: 0.99,
      rope_theta: 2_000_000,
      lora_rank: 256,
      max_output_tokens: 131_072,
    }),
  },
];

const variantIds = VARIANTS.map((v) => v.id);

export function getVariant(id: VariantId): Variant {
  return VARIANTS.find((v) => v.id === id) ?? VARIANTS[0];
}

function mlaAttentionParams(c: MythosConfig): number {
  const qOut = c.n_heads * (c.qk_nope_head_dim + c.qk_rope_head_dim);
  const wq = c.dim * c.q_lora_rank + c.q_lora_rank * qOut;
  const wkvDown = c.dim * (c.kv_lora_rank + c.qk_rope_head_dim);
  const wkvUp =
    c.kv_lora_rank * (c.n_heads * (c.qk_nope_head_dim + c.v_head_dim));
  const wo = c.n_heads * c.v_head_dim * c.dim;
  return wq + wkvDown + wkvUp + wo + 4 * c.dim;
}

function gqaAttentionParams(c: MythosConfig): number {
  const headDim = c.dim / c.n_heads;
  const wq = c.dim * c.dim;
  const wk = c.dim * c.n_kv_heads * headDim;
  const wv = c.dim * c.n_kv_heads * headDim;
  const wo = c.dim * c.dim;
  return wq + wk + wv + wo + 2 * c.dim;
}

function denseBlockParams(c: MythosConfig): number {
  const ffnDim = 4 * c.dim;
  const ffn = 3 * c.dim * ffnDim;
  const attn =
    c.attn_type === "mla" ? mlaAttentionParams(c) : gqaAttentionParams(c);
  return attn + ffn + 2 * c.dim;
}

/**
 * Hand-maintained parameter estimates mirroring open_mythos/variants.py comments:
 *   total ≈ embed + prelude/coda + recurrent MLA + MoE
 *   MoE = 3·dim·expert_dim·(n_experts + n_shared·topk)
 */
export function estimateParams(c: MythosConfig): ParamBreakdown {
  const embedding = c.vocab_size * c.dim;
  const preludeCoda =
    denseBlockParams(c) * (c.prelude_layers + c.coda_layers);
  const router = c.dim * c.n_experts;
  const recurrentCore =
    mlaAttentionParams(c) +
    router +
    3 * c.dim +
    2 * c.lora_rank * c.dim;
  const moe =
    3 *
    c.dim *
    c.expert_dim *
    (c.n_experts + c.n_shared_experts * c.n_experts_per_tok);
  const total = embedding + preludeCoda + recurrentCore + moe;
  return { embedding, preludeCoda, recurrentCore, moe, total };
}

export function formatParams(n: number): string {
  if (n >= 1e12) {
    return n % 1e12 === 0
      ? `${n / 1e12}T`
      : `${(n / 1e12).toFixed(2)}T`;
  }
  if (n >= 1e9) {
    return n % 1e9 === 0 ? `${n / 1e9}B` : `${(n / 1e9).toFixed(1)}B`;
  }
  if (n >= 1e6) {
    return n % 1e6 === 0 ? `${n / 1e6}M` : `${(n / 1e6).toFixed(1)}M`;
  }
  if (n >= 1e3) {
    return n % 1e3 === 0 ? `${n / 1e3}K` : `${(n / 1e3).toFixed(1)}K`;
  }
  return `${Math.round(n)}`;
}

export const VARIANT_IDS = variantIds as [VariantId, ...VariantId[]];
