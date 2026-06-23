"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Formula } from "@/components/shared/formula-block";
import { cn } from "@/lib/utils";

/**
 * Depth-wise LoRA delta indicator. The magnitude bar scales with the per-loop
 * LoRA delta — shared weights, but a per-loop low-rank shift in behavior.
 */
export function LoraIndicator({
  scale,
  loopT,
  active,
  reduced,
  className,
}: {
  scale: number;
  loopT: number;
  active?: boolean;
  reduced?: boolean;
  className?: string;
}) {
  const pct = Math.round(scale * 100);
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/50 px-3 py-2 transition-colors",
        active ? "border-recurrent" : "border-border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <Plus className="size-3 text-recurrent" />
          <Formula math={`+\\,\\Delta_{\\text{LoRA}}(t{=}${loopT})`} />
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          ‖Δ‖ {pct}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-recurrent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.4 }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Depth-wise LoRA shifts behavior per loop index — no new full weights.
      </p>
    </div>
  );
}
