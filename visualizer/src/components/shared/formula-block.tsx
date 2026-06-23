"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { cn } from "@/lib/utils";

/**
 * KaTeX wrappers for rendering the model's update rules and equations.
 * `Formula` for inline math, `FormulaBlock` for display math with an optional
 * caption. Used across deep-dive pages (PLAN §4.1).
 */

export function Formula({ math, className }: { math: string; className?: string }) {
  return (
    <span className={cn("font-mono", className)}>
      <InlineMath math={math} />
    </span>
  );
}

export function FormulaBlock({
  math,
  caption,
  className,
}: {
  math: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "my-2 overflow-x-auto rounded-lg border border-border bg-muted/40 px-4 py-3 text-center",
        className,
      )}
    >
      <BlockMath math={math} />
      {caption ? (
        <figcaption className="mt-2 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
