"use client";

import * as React from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DepthModel } from "./lib";
import { overthinkStart, quality } from "./lib";

/**
 * The prominent n_loops control. Bound to the site-wide URL-synced loop depth,
 * it sweeps from 1 to ~4× the training default and marks the trained depth and
 * the overthinking threshold directly on the track.
 */
export function LoopsSlider({
  loops,
  setLoops,
  model,
}: {
  loops: number;
  setLoops: (n: number) => void;
  model: DepthModel;
}) {
  const { trainDefault, maxLoops } = model;
  const peak = overthinkStart(model);
  const q = quality(loops, model);
  const baseDelta = q - model.baseline;
  const overthinking = loops > peak;
  const extrapolating = loops > trainDefault;

  const pct = (n: number) => ((n - 1) / (maxLoops - 1)) * 100;
  const valueText = `${loops} loops, ${
    extrapolating ? `${(loops / trainDefault).toFixed(1)}× trained depth, ` : ""
  }illustrative quality ${q.toFixed(2)}${
    overthinking ? ", in the overthinking zone" : ""
  }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold tabular-nums text-recurrent">
              {loops}
            </span>
            <span className="text-sm text-muted-foreground">n_loops</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Trained on{" "}
            <span className="font-mono text-foreground">{trainDefault}</span> ·{" "}
            {extrapolating ? (
              <span className="text-recurrent">
                extrapolating {(loops / trainDefault).toFixed(1)}× deeper
              </span>
            ) : (
              <span>at or below trained depth</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Readout
            label="quality"
            value={q.toFixed(2)}
            tone={overthinking ? "danger" : "accent"}
          />
          <Readout
            label="vs baseline"
            value={`${baseDelta >= 0 ? "+" : ""}${baseDelta.toFixed(2)}`}
            tone={baseDelta >= 0 ? "good" : "danger"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative pt-5">
          {/* Trained-default tick */}
          <Marker
            pct={pct(trainDefault)}
            label="trained"
            className="text-prelude"
            lineClassName="bg-prelude"
          />
          {/* Overthinking-threshold tick */}
          <Marker
            pct={pct(peak)}
            label="overthink →"
            className="text-destructive"
            lineClassName="bg-destructive"
            align="end"
          />
          <Slider
            min={1}
            max={maxLoops}
            step={1}
            value={[loops]}
            onValueChange={(v) => setLoops(Array.isArray(v) ? v[0] : v)}
            aria-label="Inference-time loop depth (n_loops)"
            aria-valuetext={valueText}
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>1</span>
          <span>{Math.round(maxLoops / 2)}</span>
          <span>{maxLoops}</span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
          overthinking
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : extrapolating
              ? "border-recurrent/40 bg-recurrent/10 text-recurrent"
              : "border-border bg-muted/40 text-muted-foreground",
        )}
      >
        {overthinking ? (
          <>
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Overthinking zone — extra loops now <strong>degrade</strong> the
              answer as the hidden state drifts past the solution.
            </span>
          </>
        ) : (
          <>
            <TrendingUp className="size-4 shrink-0" />
            <span>
              {extrapolating
                ? "Depth extrapolation: running more loops than training keeps improving quality — with diminishing returns."
                : "Increase n_loops past the trained depth to add reasoning depth at inference, no retraining required."}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "good" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-lg font-semibold tabular-nums",
          tone === "accent" && "text-recurrent",
          tone === "good" && "text-[#22c55e]",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Marker({
  pct,
  label,
  className,
  lineClassName,
  align = "start",
}: {
  pct: number;
  label: string;
  className?: string;
  lineClassName?: string;
  align?: "start" | "end";
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 flex flex-col items-center"
      style={{
        left: `${clamped}%`,
        transform:
          align === "end" ? "translateX(-90%)" : "translateX(-10%)",
      }}
    >
      <Badge
        variant="outline"
        className={cn(
          "h-4 bg-background px-1 font-mono text-[9px] leading-none",
          className,
        )}
      >
        {label}
      </Badge>
      <span className={cn("mt-0.5 h-3 w-px", lineClassName)} />
    </div>
  );
}
