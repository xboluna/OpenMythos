export type Route = {
  href: string;
  label: string;
  description: string;
};

export const routes: Route[] = [
  {
    href: "/architecture",
    label: "Architecture",
    description:
      "End-to-end pipeline: Prelude → Recurrent loop → Coda, with a standard-transformer comparison toggle.",
  },
  {
    href: "/recurrent-loop",
    label: "Recurrent loop",
    description:
      "Step through one loop iteration — loop embedding, injection, transformer, LoRA, LTI, and ACT halting.",
  },
  {
    href: "/attention",
    label: "Attention",
    description:
      "MLA vs GQA side-by-side: compressed KV cache anatomy and scaling with context length.",
  },
  {
    href: "/moe",
    label: "MoE routing",
    description:
      "Expert router scores, top-K dispatch, shared experts, and load-balancing aux loss.",
  },
  {
    href: "/stability",
    label: "LTI stability",
    description:
      "Spectral radius ρ(A) < 1 by construction — explore the Parcae discretization live.",
  },
  {
    href: "/depth-extrapolation",
    label: "Depth extrapolation",
    description:
      "Train on N loops, infer on N+k: quality curve, overthinking, and n-hop reasoning.",
  },
  {
    href: "/variants",
    label: "Model variants",
    description:
      "Compare mythos_1b … mythos_1t scales with parameter breakdown and site-wide config.",
  },
  {
    href: "/moda",
    label: "MoDA (experimental)",
    description:
      "Alternative depth-aware attention + DeepSeek-style MoE — clearly labeled secondary track.",
  },
  {
    href: "/references",
    label: "References",
    description:
      "Papers, threads, BibTeX, and a map from each concept to its source in this repo.",
  },
];
