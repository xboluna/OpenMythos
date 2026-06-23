"use client";

import { estimateParams, formatParams, type Variant } from "@/lib/variants";
import { Badge } from "@/components/ui/badge";
import { SEGMENTS } from "./utils";

export function SelectedVariantDetail({ variant }: { variant: Variant }) {
  const c = variant.config;
  const p = estimateParams(c);

  const activeFraction = c.n_experts_per_tok / c.n_experts;
  const activePct = activeFraction * 100;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">
            {variant.name}{" "}
            <span className="text-muted-foreground">— parameter breakdown</span>
          </h2>
          <p className="text-xs text-muted-foreground">{variant.blurb}</p>
        </div>
        <Badge
          variant="outline"
          className="font-mono"
          title="Estimated total parameters"
        >
          ~{formatParams(p.total)} total
        </Badge>
      </div>

      {/* Combined horizontal stacked bar */}
      <div
        className="mb-4 flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Parameter composition for ${variant.name}`}
      >
        {SEGMENTS.map((seg) => {
          const pct = (p[seg.key] / p.total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={seg.key}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${formatParams(p[seg.key])} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <ul className="space-y-3">
        {SEGMENTS.map((seg) => {
          const value = p[seg.key];
          const pct = (value / p.total) * 100;
          return (
            <li key={seg.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 rounded-[2px]"
                    style={{ backgroundColor: seg.color }}
                  />
                  {seg.label}
                </span>
                <span className="font-mono text-muted-foreground">
                  {formatParams(value)}{" "}
                  <span className="text-foreground">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: seg.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs">
          <span className="font-medium">Activation:</span> only{" "}
          <span className="font-mono text-[var(--stage-coda)]">
            {c.n_experts_per_tok}/{c.n_experts}
          </span>{" "}
          routed experts fire per token —{" "}
          <span className="font-mono font-semibold">
            {activePct.toFixed(1)}%
          </span>{" "}
          of the routed-expert parameters.
        </p>
        <p className="text-[11px] text-muted-foreground">
          MoE means total params are a storage number, not a compute number.
        </p>
      </div>
    </div>
  );
}
