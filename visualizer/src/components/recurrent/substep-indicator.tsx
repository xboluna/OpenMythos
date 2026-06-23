"use client";

import { recurrentLoopSteps } from "@/lib/code-refs";
import { cn } from "@/lib/utils";

/**
 * Horizontal stepper over the 7 per-iteration sub-steps from
 * `recurrentLoopSteps`. The active sub-step drives the highlighted formula term
 * and the `activeLines` of the source panel.
 */
export function SubstepIndicator({
  active,
  onSelect,
  className,
}: {
  active: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Per-iteration pipeline
        </h3>
        <span className="font-mono text-[11px] text-muted-foreground">
          step {active + 1}/{recurrentLoopSteps.length}
        </span>
      </div>
      <ol className="flex flex-wrap gap-1.5">
        {recurrentLoopSteps.map((step, i) => {
          const isActive = i === active;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-1.5 rounded-lg border px-2 py-1 text-left text-xs transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-recurrent bg-recurrent/15 text-foreground"
                    : "border-border bg-card/50 text-muted-foreground hover:border-recurrent/50 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px]",
                    isActive
                      ? "bg-recurrent text-background"
                      : "bg-muted text-muted-foreground group-hover:bg-recurrent/30",
                  )}
                >
                  {i + 1}
                </span>
                <span className="whitespace-nowrap font-medium">
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
