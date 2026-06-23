"use client";

import { motion } from "motion/react";
import { Layers, Ban, GitBranch, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StandardStackProps = {
  dim: number;
  preludeLayers: number;
  codaLayers: number;
  loops: number;
  reduced: boolean;
};

/**
 * Illustrative side-by-side: a vanilla stacked transformer of comparable depth.
 * N = prelude + loops + coda *unique* blocks (no looping, no input injection,
 * no ACT). Highlights what the recurrent design buys you.
 */
export function StandardStack({
  dim,
  preludeLayers,
  codaLayers,
  loops,
  reduced,
}: StandardStackProps) {
  const n = preludeLayers + loops + codaLayers;

  return (
    <div className="flex flex-col rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Layers className="size-4" />
            Standard transformer
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground">
            {n} unique blocks · dim {dim}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase">
          Illustrative
        </Badge>
      </div>

      <BlockStack n={n} reduced={reduced} />

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        N = prelude + loops + coda = {preludeLayers} + {loops} + {codaLayers}
      </p>

      <div className="mt-4 space-y-2">
        <Chip
          icon={<Layers className="size-3.5" />}
          title="N× the parameters"
          body={`RDT reuses ONE recurrent block across all ${loops} loops — compute scales with loops, params don't. A standard stack needs ${n}× unique block weights.`}
        />
        <Chip
          icon={<GitBranch className="size-3.5" />}
          title="No e injection"
          body="No frozen-input reinjection — each block only sees the previous block's output."
        />
        <Chip
          icon={<Ban className="size-3.5" />}
          title="No ACT halting"
          body="Runs a fixed depth for every token, easy or hard."
        />
        <Chip
          icon={<TrendingUp className="size-3.5" />}
          title="No depth extrapolation"
          body="Can't add reasoning depth at inference — depth is fixed by the architecture."
        />
      </div>
    </div>
  );
}

function BlockStack({ n, reduced }: { n: number; reduced: boolean }) {
  // Compress very deep stacks so the column stays readable.
  const compact = n > 14;
  const head = compact ? 6 : n;
  const tail = compact ? 6 : 0;
  const hidden = compact ? n - head - tail : 0;

  const bar = (key: string, idx: number) => (
    <motion.div
      key={key}
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : Math.min(idx * 0.03, 0.4) }}
      className="h-5 w-full rounded-md border border-border bg-muted-foreground/15"
      title="unique weights"
    />
  );

  return (
    <div className="space-y-1.5">
      <p className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        unique weights
      </p>
      {Array.from({ length: head }).map((_, i) => bar(`h-${i}`, i))}
      {compact ? (
        <div
          className={cn(
            "rounded-md border border-dashed border-border bg-transparent py-1.5",
            "text-center text-[11px] text-muted-foreground",
          )}
        >
          ⋮ × {hidden} more identical blocks
        </div>
      ) : null}
      {Array.from({ length: tail }).map((_, i) => bar(`t-${i}`, head + i))}
    </div>
  );
}

function Chip({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
