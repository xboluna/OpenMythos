import type { CodeRefKey } from "@/lib/code-refs";

export type Paper = {
  title: string;
  url: string;
};

export type PaperGroup = {
  id: string;
  heading: string;
  blurb: string;
  papers: Paper[];
};

export type Thread = {
  label: string;
  author: string;
  url: string;
};

/** Extracts an arXiv id (e.g. "2604.07822") from an arxiv.org abs/pdf URL. */
export function arxivId(url: string): string | null {
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/);
  return match ? match[1] : null;
}

export const paperGroups: PaperGroup[] = [
  {
    id: "looped",
    heading: "Core — looped & recurrent-depth",
    blurb:
      "The recurrent-depth reasoning lineage that OpenMythos reconstructs: looping a shared block to trade compute for effective depth.",
    papers: [
      {
        title:
          "Loop, Think, & Generalize — Implicit Reasoning in Recurrent Depth Transformers",
        url: "https://arxiv.org/pdf/2604.07822",
      },
      {
        title: "Parcae — Scaling Laws for Stable Looped Language Models",
        url: "https://arxiv.org/abs/2604.12946",
      },
      {
        title: "Parcae (project blog)",
        url: "https://sandyresearch.github.io/parcae/",
      },
      {
        title:
          "Reasoning with Latent Thoughts — On the Power of Looped Transformers (Saunshi et al., 2025)",
        url: "https://arxiv.org/abs/2502.17416",
      },
      {
        title:
          "Training Large Language Models to Reason in a Continuous Latent Space (COCONUT)",
        url: "https://arxiv.org/abs/2412.06769",
      },
      {
        title:
          "Relaxed Recursive Transformers — Effective Parameter Sharing with Layer-wise LoRA (Bae et al., 2024)",
        url: "https://arxiv.org/pdf/2410.20672",
      },
      {
        title: "Universal Transformers (Dehghani et al., 2018)",
        url: "https://arxiv.org/pdf/1807.03819",
      },
      {
        title: "Hyperloop Transformers",
        url: "https://arxiv.org/abs/2604.21254",
      },
      {
        title:
          "The Recurrent Transformer: Greater Effective Depth and Efficient Decoding",
        url: "https://arxiv.org/abs/2604.21215",
      },
      {
        title: "LT2: Linear-Time Looped Transformers",
        url: "https://arxiv.org/pdf/2605.20670",
      },
    ],
  },
  {
    id: "attention",
    heading: "Attention",
    blurb:
      "Compressed KV caches and grouped queries that keep the recurrent decode loop affordable.",
    papers: [
      {
        title: "Mixture-of-Depths Attention",
        url: "https://arxiv.org/abs/2603.15619",
      },
      {
        title: "DeepSeek-V2 (Multi-Latent Attention)",
        url: "https://arxiv.org/abs/2405.04434",
      },
      {
        title:
          "GQA: Training Generalized Multi-Query Transformer Models (Ainslie et al., 2023)",
        url: "https://arxiv.org/abs/2305.13245",
      },
    ],
  },
  {
    id: "moe",
    heading: "Mixture-of-Experts",
    blurb:
      "Fine-grained expert segmentation and shared-expert isolation behind the routed FFN.",
    papers: [
      {
        title:
          "DeepSeekMoE — Fine-grained expert segmentation and shared expert isolation (Dai et al., 2024)",
        url: "https://arxiv.org/abs/2401.06066",
      },
    ],
  },
  {
    id: "foundations",
    heading: "Foundations",
    blurb:
      "The building blocks — adaptive computation, normalization, and positional encoding.",
    papers: [
      {
        title:
          "Adaptive Computation Time for Recurrent Neural Networks (Graves, 2016)",
        url: "https://arxiv.org/abs/1603.08983",
      },
      {
        title: "Root Mean Square Layer Normalization (Zhang & Sennrich, 2019)",
        url: "https://arxiv.org/abs/1910.07467",
      },
      {
        title:
          "RoFormer: Enhanced Transformer with Rotary Position Embedding (Su et al., 2021)",
        url: "https://arxiv.org/abs/2104.09864",
      },
    ],
  },
];

export const threads: Thread[] = [
  {
    label: "Why Claude Mythos is so good — looped transformer theory",
    author: "Sigrid Jin",
    url: "https://x.com/realsigridjin/status/2044620031410266276",
  },
  {
    label:
      "LT implicit reasoning over parametric knowledge unlocks generalization",
    author: "Yuekun Yao",
    url: "https://x.com/yuekun_yao/status/2044229171627639004",
  },
  {
    label: "Looped transformer cyclic trajectories and input injection",
    author: "rosinality",
    url: "https://x.com/rosinality/status/2043953033428541853",
  },
  {
    label: "Parcae scaling laws for stable looped language models — thread",
    author: "Hayden Prairie",
    url: "https://x.com/hayden_prairie/status/2044453231913537927",
  },
  {
    label: "RoPE-like loop index embedding idea",
    author: "davidad",
    url: "https://x.com/davidad/status/2044453231913537927",
  },
  {
    label: "On the Looped Transformers Controversy",
    author: "ChrisHayduk",
    url: "https://x.com/ChrisHayduk/status/2045947623572688943",
  },
  {
    label: "On the Looped Transformers Controversy — Summary",
    author: "Sigrid Jin",
    url: "https://x.com/realsigridjin/status/2046012743778766875",
  },
];

export const repoUrl = "https://github.com/xboluna/OpenMythos";

export const bibtex = `@software{gomez2026openmythos,
  author    = {Kye Gomez},
  title     = {OpenMythos: A Theoretical Reconstruction of the Claude Mythos Architecture},
  year      = {2026},
  url       = {https://github.com/kyegomez/OpenMythos},
  note      = {Recurrent-Depth Transformer with MoE, MLA, LTI-stable injection, and ACT halting}
}`;

/** Maps each code-ref key to the deep-dive page on this site that explores it. */
export const refToRoute: Record<CodeRefKey, string> = {
  forward: "/architecture",
  recurrentLoop: "/recurrent-loop",
  ltiInjection: "/stability",
  actHalting: "/recurrent-loop",
  loopEmbedding: "/recurrent-loop",
  loraAdapter: "/recurrent-loop",
  moeFfn: "/moe",
  mlaAttention: "/attention",
  gqaAttention: "/attention",
  transformerBlock: "/architecture",
  expert: "/moe",
  config: "/variants",
  variants: "/variants",
  modaAttention: "/moda",
  modaMoE: "/moda",
};
