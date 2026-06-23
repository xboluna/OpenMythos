"use client";

import * as React from "react";
import { channelWaveform } from "@/lib/loop-embedding";
import { LineChart, ChartLegend, type Series } from "./line-chart";
import { cn } from "@/lib/utils";

const COLORS = [
  "var(--stage-recurrent)",
  "var(--stage-prelude)",
  "var(--stage-coda)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * The loop-index embedding waveform: a few channels' injected value as the loop
 * iteration sweeps 0 … loops-1. This is RoPE, but over recurrence depth — it
 * lets the shared recurrent weights act differently at each loop.
 */
export function LoopEmbeddingWaveform({
  loopT,
  loops,
  loopDim,
  className,
}: {
  loopT: number;
  loops: number;
  loopDim: number;
  className?: string;
}) {
  const half = Math.max(1, Math.floor(loopDim / 2));
  const channels = React.useMemo(
    () => [0, 1, 2, 4, 8].filter((c) => c < half),
    [half],
  );

  const series: Series[] = React.useMemo(
    () =>
      channels.map((c, i) => ({
        label: `ch ${c}`,
        color: COLORS[i % COLORS.length],
        points: channelWaveform(c, loops, loopDim).map((p) => p.value),
      })),
    [channels, loops, loopDim],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <LineChart
        series={series}
        markIndex={loopT}
        yMin={-1.05}
        yMax={1.05}
        height={170}
        ariaLabel="Loop-index embedding waveform across loop iterations"
      />
      <ChartLegend series={series} />
      <p className="text-xs text-muted-foreground">
        Sinusoidal loop-index signal injected into the first{" "}
        <span className="font-mono">loop_dim = dim/8 = {loopDim}</span> channels.
        Like RoPE but over <em>depth</em>: the same shared weights see a
        different signal each loop, so they can act differently per iteration.
        Current loop <span className="font-mono text-recurrent">t = {loopT}</span>{" "}
        is marked.
      </p>
    </div>
  );
}
