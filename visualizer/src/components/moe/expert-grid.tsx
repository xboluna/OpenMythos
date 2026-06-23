"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Layers, RotateCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTED_COLOR, SHARED_COLOR } from "./routing";
import { cn } from "@/lib/utils";

type Selected = { weight: number; rank: number };

/**
 * The centerpiece: a grid of routed-expert cells plus a separate always-on
 * shared-expert lane. The selected token's top-k routed cells light up amber,
 * sized/opacity by gating weight; the shared lane is always violet. The
 * per-loop scrubber re-routes the same token at a different depth, animating
 * the selection across the grid.
 */
export function ExpertGrid({
  nExperts,
  visibleCount,
  topkIdx,
  topkWeights,
  sharedCount,
  expertDim,
  topk,
  loopIndex,
  loops,
  onLoopChange,
  tokenLabel,
  reduced,
}: {
  nExperts: number;
  visibleCount: number;
  topkIdx: number[];
  topkWeights: number[];
  sharedCount: number;
  expertDim: number;
  topk: number;
  loopIndex: number;
  loops: number;
  onLoopChange: (t: number) => void;
  tokenLabel: string;
  reduced: boolean;
}) {
  const selectedMap = React.useMemo(() => {
    const m = new Map<number, Selected>();
    topkIdx.forEach((id, rank) => {
      if (id < visibleCount) m.set(id, { weight: topkWeights[rank], rank });
    });
    return m;
  }, [topkIdx, topkWeights, visibleCount]);

  const maxWeight = topkWeights.length ? Math.max(...topkWeights) : 1;
  const hiddenSelected = topkIdx.filter((id) => id >= visibleCount).length;
  const sharedWidth = expertDim * topk;

  const canScrub = loops > 1;

  return (
    <div className="space-y-5">
      {/* Routed experts */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: ROUTED_COLOR }}
            />
            <h3 className="text-sm font-medium">Routed experts</h3>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {nExperts} total
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              top-{topk} active
            </Badge>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            each width {expertDim}
          </span>
        </div>

        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(1.9rem, 1fr))",
          }}
          role="img"
          aria-label={`Routed expert grid: ${topkIdx.length} of ${nExperts} experts selected for token "${tokenLabel}" at loop ${loopIndex}`}
        >
          {Array.from({ length: visibleCount }, (_, id) => {
            const sel = selectedMap.get(id);
            const active = !!sel;
            const intensity = sel ? 0.45 + 0.55 * (sel.weight / maxWeight) : 0;
            return (
              <motion.div
                key={id}
                title={
                  active
                    ? `Expert ${id} · weight ${(sel!.weight * 100).toFixed(1)}%`
                    : `Expert ${id} (not selected)`
                }
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-md border text-[9px] font-mono",
                  active
                    ? "border-transparent text-background"
                    : "border-border bg-muted/40 text-muted-foreground/50",
                )}
                animate={
                  reduced
                    ? undefined
                    : {
                        scale: active ? 1.06 : 1,
                        backgroundColor: active
                          ? `color-mix(in oklab, ${ROUTED_COLOR} ${Math.round(
                              intensity * 100,
                            )}%, transparent)`
                          : "color-mix(in oklab, var(--muted) 40%, transparent)",
                      }
                }
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={
                  active
                    ? {
                        backgroundColor: `color-mix(in oklab, ${ROUTED_COLOR} ${Math.round(
                          intensity * 100,
                        )}%, transparent)`,
                        boxShadow: `0 0 0 1.5px ${ROUTED_COLOR}`,
                      }
                    : undefined
                }
              >
                {active ? id : ""}
                {active ? (
                  <motion.span
                    layout={!reduced}
                    className="pointer-events-none absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full text-[7px] font-semibold text-background"
                    style={{ backgroundColor: ROUTED_COLOR }}
                    aria-hidden
                  >
                    {sel!.rank + 1}
                  </motion.span>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {visibleCount < nExperts ? (
            <>
              Showing a representative{" "}
              <span className="font-mono">{visibleCount}</span> of{" "}
              <span className="font-mono">{nExperts}</span> experts · routing is
              an illustrative simulation.
            </>
          ) : (
            <>Routing is an illustrative simulation.</>
          )}
          {hiddenSelected > 0 ? (
            <>
              {" "}
              <span className="text-foreground">
                {hiddenSelected} selected expert
                {hiddenSelected > 1 ? "s" : ""} fall outside the sample.
              </span>
            </>
          ) : null}
        </p>
      </div>

      {/* Shared lane */}
      <div className="space-y-2 rounded-lg border border-dashed p-3"
        style={{ borderColor: `color-mix(in oklab, ${SHARED_COLOR} 50%, transparent)` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: SHARED_COLOR }}
            />
            <h3 className="text-sm font-medium">Shared experts</h3>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {sharedCount} always-on
            </Badge>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            each width {expertDim} × {topk} = {sharedWidth.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: sharedCount }, (_, id) => (
            <motion.div
              key={id}
              className="flex h-9 min-w-16 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] font-mono text-background"
              style={{
                backgroundColor: `color-mix(in oklab, ${SHARED_COLOR} 85%, transparent)`,
                boxShadow: `0 0 0 1.5px ${SHARED_COLOR}`,
              }}
              animate={
                reduced
                  ? undefined
                  : { opacity: [0.82, 1, 0.82] }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: id * 0.25,
              }}
            >
              <Layers className="size-3" aria-hidden />
              shared {id}
            </motion.div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Always fire for every token — no routing decision.
        </p>
      </div>

      {/* Per-loop scrubber */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="moe-loop-scrubber"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <RotateCw className="size-3.5" aria-hidden />
            Loop depth t
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {loopIndex}
              <span className="text-muted-foreground"> / {loops - 1}</span>
            </span>
            <Button
              variant="ghost"
              size="xs"
              disabled={!canScrub}
              onClick={() => onLoopChange((loopIndex + 1) % loops)}
              className="text-muted-foreground"
            >
              step
            </Button>
          </div>
        </div>
        <Slider
          id="moe-loop-scrubber"
          min={0}
          max={Math.max(0, loops - 1)}
          step={1}
          value={[loopIndex]}
          onValueChange={(v) =>
            onLoopChange(Array.isArray(v) ? v[0] : (v as number))
          }
          disabled={!canScrub}
          aria-label="Loop depth"
          aria-valuetext={`Loop ${loopIndex} of ${loops - 1}`}
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Same token, different loop depth → different expert subset.{" "}
          <span className="text-foreground">
            MoE gives breadth; looping gives depth.
          </span>
        </p>
      </div>
    </div>
  );
}
