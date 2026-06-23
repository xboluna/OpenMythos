"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { divergingColor } from "./lib";
import { cn } from "@/lib/utils";

/**
 * A 1-D state vector rendered as a horizontal row of color cells (value → color
 * via a diverging blue/neutral/amber scale). Used for `h`, `e`, and `trans_out`.
 */
export function HeatStrip({
  values,
  label,
  sublabel,
  frozen,
  accentColor,
  reduced,
  className,
}: {
  values: number[];
  label: React.ReactNode;
  sublabel?: React.ReactNode;
  frozen?: boolean;
  accentColor?: string;
  reduced?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-sm font-semibold"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {label}
          </span>
          {frozen ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-prelude/40 bg-prelude/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-prelude">
              <Lock className="size-2.5" />
              frozen
            </span>
          ) : null}
        </div>
        {sublabel ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            {sublabel}
          </span>
        ) : null}
      </div>
      <div
        className="flex h-7 w-full gap-px overflow-hidden rounded-md border border-border bg-background"
        role="img"
        aria-label={
          typeof label === "string"
            ? `${label} state vector heat strip`
            : "state vector heat strip"
        }
      >
        {values.map((v, i) => (
          <motion.span
            key={i}
            className="h-full flex-1"
            initial={false}
            animate={{ backgroundColor: divergingColor(v) }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }
            }
          />
        ))}
      </div>
    </div>
  );
}
