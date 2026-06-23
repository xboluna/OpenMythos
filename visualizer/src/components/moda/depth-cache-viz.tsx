"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Database, Pause, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const N_LAYERS = 6; // illustrative subset of the 24-layer stack
const N_POS = 7; // illustrative sequence positions

type CellKind =
  | "query"
  | "seq" // causal sequence key (same layer, pos <= query)
  | "depth" // depth key (earlier layer, same position)
  | "cached" // written but not attended by this query
  | "current-future" // current layer, pos > query (masked by causal)
  | "future"; // layer not yet computed

function classify(row: number, col: number, L: number, p: number): CellKind {
  if (row > L) return "future";
  if (row === L) {
    if (col === p) return "query";
    if (col < p) return "seq";
    return "current-future";
  }
  // row < L  → already in the depth cache
  return col === p ? "depth" : "cached";
}

const CELL_STYLES: Record<CellKind, string> = {
  query: "border-teal-300 bg-teal-400/30 text-teal-50 ring-2 ring-teal-300",
  seq: "border-slate-400/60 bg-slate-400/25 text-slate-100",
  depth: "border-teal-400/70 bg-teal-500/30 text-teal-100",
  cached: "border-teal-500/20 bg-teal-500/5 text-teal-200/50",
  "current-future": "border-border bg-muted/30 text-muted-foreground/40",
  future:
    "border-dashed border-border bg-transparent text-muted-foreground/30",
};

export function DepthCacheViz() {
  const reduced = useReducedMotion() ?? false;
  const [layer, setLayer] = React.useState(4);
  const [pos, setPos] = React.useState(5);
  const [playing, setPlaying] = React.useState(false);

  // Auto-advance the "current layer" to animate depth-cache accumulation.
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setLayer((l) => (l >= N_LAYERS - 1 ? 0 : l + 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, [playing]);

  const depthCount = layer; // layers 0…L-1 are readable in the depth dim
  const seqCount = pos + 1; // causal keys 0…p in the current layer

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Database className="size-4 text-teal-400" aria-hidden />
          Depth KV cache
          <Badge
            variant="secondary"
            className="font-mono text-[10px]"
          >
            illustrative
          </Badge>
        </CardTitle>
        <CardDescription>
          Rows are layers; columns are token positions. Each layer{" "}
          <span className="text-teal-300">writes</span> a K/V entry after its
          MoE FFN. A query in layer <span className="font-mono">L</span> at
          position <span className="font-mono">p</span> reads its own causal{" "}
          <span style={{ color: "#cbd5e1" }}>sequence keys</span> (row{" "}
          <span className="font-mono">L</span>, cols 0…p) and the{" "}
          <span className="text-teal-300">depth keys</span> cached by layers{" "}
          <span className="font-mono">0…L-1</span> at the same column.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-foreground">
                Current layer L
              </label>
              <span className="font-mono text-muted-foreground">
                {layer} / {N_LAYERS - 1}
              </span>
            </div>
            <Slider
              value={[layer]}
              min={0}
              max={N_LAYERS - 1}
              step={1}
              onValueChange={(v) => {
                setPlaying(false);
                setLayer(Array.isArray(v) ? v[0] : v);
              }}
              aria-label="Current layer L"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-foreground">
                Query position p
              </label>
              <span className="font-mono text-muted-foreground">
                {pos} / {N_POS - 1}
              </span>
            </div>
            <Slider
              value={[pos]}
              min={0}
              max={N_POS - 1}
              step={1}
              onValueChange={(v) => setPos(Array.isArray(v) ? v[0] : v)}
              aria-label="Query position p"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPlaying((v) => !v)}
            className="border-teal-500/40 text-teal-200 hover:bg-teal-500/10"
          >
            {playing ? (
              <>
                <Pause className="size-3.5" aria-hidden /> Pause
              </>
            ) : (
              <>
                <Play className="size-3.5" aria-hidden /> Animate layers
              </>
            )}
          </Button>
          <span className="text-[11px] text-muted-foreground">
            steps the current layer to grow the depth cache
          </span>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {Array.from({ length: N_LAYERS }, (_, rIdx) => {
              const row = N_LAYERS - 1 - rIdx; // top = deepest layer
              return (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-14 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                    layer {row}
                  </span>
                  {Array.from({ length: N_POS }, (_, col) => {
                    const kind = classify(row, col, layer, pos);
                    return (
                      <motion.div
                        key={col}
                        className={cn(
                          "flex size-8 items-center justify-center rounded border font-mono text-[9px] sm:size-9",
                          CELL_STYLES[kind],
                        )}
                        animate={
                          reduced || kind !== "query"
                            ? undefined
                            : { scale: [1, 1.08, 1] }
                        }
                        transition={
                          reduced
                            ? undefined
                            : { duration: 1.6, repeat: Infinity }
                        }
                        title={`layer ${row}, pos ${col} — ${kind}`}
                      >
                        {kind === "query" ? "Q" : `${row}·${col}`}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
            {/* position axis */}
            <div className="flex items-center gap-1">
              <span className="w-14 shrink-0" />
              {Array.from({ length: N_POS }, (_, col) => (
                <span
                  key={col}
                  className="size-8 text-center font-mono text-[9px] text-muted-foreground sm:size-9"
                >
                  p{col}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend + readout */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <LegendSwatch className="bg-teal-400/30 ring-1 ring-teal-300" />
          query (L, p)
          <LegendSwatch className="bg-slate-400/25 ring-1 ring-slate-400/60" />
          sequence keys ({seqCount})
          <LegendSwatch className="bg-teal-500/30 ring-1 ring-teal-400/70" />
          depth keys ({depthCount})
          <LegendSwatch className="bg-teal-500/5 ring-1 ring-teal-500/20" />
          cached, not read
          <LegendSwatch className="border border-dashed border-border" />
          not yet computed
        </div>
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-[11px] text-muted-foreground">
          query attends over {seqCount} sequence + {depthCount} depth ={" "}
          <span className="text-teal-300">{seqCount + depthCount}</span> keys,
          fused by a single softmax (see below).
        </p>
      </CardContent>
    </Card>
  );
}

function LegendSwatch({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-3 shrink-0 rounded-[3px]", className)}
      aria-hidden
    />
  );
}
