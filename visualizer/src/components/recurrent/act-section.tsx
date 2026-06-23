"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { simulateAct, DEFAULT_TOKENS } from "@/lib/act";
import { cn } from "@/lib/utils";

/**
 * ACT halting overlay: each token's cumulative halting probability fills as the
 * loop stepper advances. A token whose cumulative crosses `act_threshold` halts
 * (locks/fades) — easy tokens halt early, hard tokens keep looping. This is the
 * adaptive-compute / Continuous Depth-wise Batching behavior.
 */
export function ActSection({
  loopT,
  loops,
  threshold,
  reduced,
}: {
  loopT: number;
  loops: number;
  threshold: number;
  reduced: boolean;
}) {
  const results = React.useMemo(
    () => simulateAct(DEFAULT_TOKENS, loops, threshold),
    [loops, threshold],
  );
  const t = Math.min(loopT, loops - 1);

  const haltedCount = results.filter(
    (r) => r.haltLoop !== null && r.haltLoop <= t,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Cumulative halting probability per token at{" "}
          <span className="font-mono text-recurrent">loop t = {t}</span>.
          Threshold ={" "}
          <span className="font-mono">{threshold.toFixed(2)}</span>.
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          {haltedCount}/{results.length} halted
        </span>
      </div>

      <ul className="space-y-2">
        {results.map((r) => {
          const cum = r.cumulative[t] ?? 0;
          const halted = r.haltLoop !== null && r.haltLoop <= t;
          return (
            <li
              key={r.text}
              className={cn(
                "flex items-center gap-3 transition-opacity",
                halted && "opacity-55",
              )}
            >
              <span className="w-16 shrink-0 truncate text-right font-mono text-sm">
                {r.text}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-md border border-border bg-background">
                <motion.div
                  className={cn(
                    "h-full",
                    halted ? "bg-recurrent/40" : "bg-recurrent",
                  )}
                  initial={false}
                  animate={{ width: `${Math.min(1, cum) * 100}%` }}
                  transition={reduced ? { duration: 0 } : { duration: 0.4 }}
                />
                {/* threshold marker */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-px bg-foreground/70"
                  style={{ left: `${threshold * 100}%` }}
                />
              </div>
              <span className="flex w-20 shrink-0 items-center justify-end gap-1 font-mono text-[11px] text-muted-foreground">
                {halted ? (
                  <>
                    <Lock className="size-3 text-recurrent" />@{r.haltLoop}
                  </>
                ) : (
                  `${(cum * 100).toFixed(0)}%`
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Easy tokens (short bars) cross the threshold and halt early; hard tokens
        (e.g. <span className="font-mono">theorem</span>,{" "}
        <span className="font-mono">∴</span>) keep looping. Halted positions stop
        consuming compute — adaptive depth / Continuous Depth-wise Batching.
      </p>
    </div>
  );
}
