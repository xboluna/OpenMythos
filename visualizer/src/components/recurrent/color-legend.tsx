"use client";

import { divergingColor } from "./lib";

/** Tiny legend explaining the diverging value → color scale on the heat strips. */
export function ColorLegend() {
  const stops = Array.from({ length: 33 }, (_, i) => -1 + (i / 32) * 2);
  const gradient = `linear-gradient(to right, ${stops
    .map((v) => divergingColor(v))
    .join(", ")})`;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Value scale
      </h2>
      <div
        className="h-3 w-full rounded-md border border-border"
        style={{ background: gradient }}
      />
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>−1</span>
        <span>0</span>
        <span>+1</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Each cell is one hidden-state channel; color encodes its (illustrative)
        signed activation.
      </p>
    </div>
  );
}
