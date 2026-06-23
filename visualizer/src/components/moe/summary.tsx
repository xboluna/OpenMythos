"use client";

import { motion } from "motion/react";
import { Layers, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SHARED_COLOR } from "./routing";
import { Formula } from "@/components/shared/formula-block";

/**
 * Shared-experts callout — explains the always-on lane and its width.
 */
export function SharedCallout({
  sharedCount,
  expertDim,
  topk,
  reduced,
}: {
  sharedCount: number;
  expertDim: number;
  topk: number;
  reduced: boolean;
}) {
  const width = expertDim * topk;
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex gap-2">
        {Array.from({ length: Math.min(sharedCount, 8) }, (_, i) => (
          <motion.div
            key={i}
            className="flex size-10 items-center justify-center rounded-lg text-background"
            style={{
              backgroundColor: `color-mix(in oklab, ${SHARED_COLOR} 85%, transparent)`,
              boxShadow: `0 0 0 1.5px ${SHARED_COLOR}`,
            }}
            animate={reduced ? undefined : { opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            <Layers className="size-4" aria-hidden />
          </motion.div>
        ))}
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          The <span className="text-coda">shared experts</span> fire for{" "}
          <span className="text-foreground">every</span> token regardless of
          routing. They absorb the common cross-domain patterns — syntax, basic
          reasoning — that would otherwise be redundantly relearned across many
          routed experts, freeing the routed pool to specialize.
        </p>
        <p className="font-mono text-xs">
          width = expert_dim × n_experts_per_tok = {expertDim.toLocaleString()}{" "}
          × {topk} ={" "}
          <span className="text-coda">{width.toLocaleString()}</span>
          <span className="ml-2 text-muted-foreground">
            (
            <Formula math={`${sharedCount}\\times`} /> wider than a routed
            expert)
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Activation summary — the headline sparsity number: only the top-k routed
 * experts (plus all shared) fire per token, so compute stays sparse even as the
 * total parameter count grows large.
 */
export function ActivationSummary({
  topk,
  nExperts,
  fraction,
  sharedCount,
}: {
  topk: number;
  nExperts: number;
  fraction: number;
  sharedCount: number;
}) {
  const pct = (fraction * 100).toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,14rem)_1fr] md:items-center">
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-5 text-center">
        <Zap className="mb-1 size-5 text-recurrent" aria-hidden />
        <span className="font-mono text-4xl font-semibold text-recurrent">
          {pct}%
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          of routed experts active per token
        </span>
        <Badge variant="secondary" className="mt-2 font-mono text-[10px]">
          top-{topk} / {nExperts}
        </Badge>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Each token activates only its{" "}
          <span className="text-recurrent">top-{topk}</span> of {nExperts} routed
          experts plus the {sharedCount} shared experts. The full routed pool
          contributes to the model&apos;s{" "}
          <span className="text-foreground">total</span> parameter count, but per
          token the <span className="text-foreground">compute</span> stays sparse
          — only the selected routed experts and the shared lane ever run.
        </p>
        <p className="text-xs">
          <Formula math="\frac{\text{n\_experts\_per\_tok}}{\text{n\_experts}}" />{" "}
          = {topk} / {nExperts} = {pct}% (real, from config). This decoupling of
          total capacity from per-token cost is what makes large MoE models
          affordable to run.
        </p>
      </div>
    </div>
  );
}
