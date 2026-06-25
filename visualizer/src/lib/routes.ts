export type Route = {
  href: string;
  label: string;
  description: string;
};

export const routes: Route[] = [
  {
    href: "/architecture",
    label: "Architecture",
    description: "The full Prelude to Coda pipeline.",
  },
  {
    href: "/recurrent-loop",
    label: "Recurrent Loop",
    description: "Input injection, ACT halting, depth-wise LoRA.",
  },
  {
    href: "/attention",
    label: "Attention",
    description: "MLA vs GQA and KV-cache tradeoffs.",
  },
  {
    href: "/moe",
    label: "MoE",
    description: "Per-token, per-loop expert routing.",
  },
  {
    href: "/stability",
    label: "Stability",
    description: "LTI injection and spectral radius bounds.",
  },
  {
    href: "/depth-extrapolation",
    label: "Depth",
    description: "More loops at inference, and overthinking.",
  },
  {
    href: "/variants",
    label: "Variants",
    description: "Model scales from 1B to 1T parameters.",
  },
  {
    href: "/moda",
    label: "MoDA",
    description: "Experimental depth-aware attention and MoE.",
  },
  {
    href: "/references",
    label: "References",
    description: "Papers, threads, and citations.",
  },
];
