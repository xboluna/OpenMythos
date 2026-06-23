"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { Layers, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfigPanel } from "@/components/shared/config-panel";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { useMythosConfig } from "@/lib/use-config";
import { buildModel, peakLoops, quality } from "./lib";
import { LoopsSlider } from "./loops-slider";
import { QualityCurve } from "./quality-curve";
import { NhopPanel } from "./nhop-panel";
import { ComputeNote } from "./compute-note";

/** Small reusable "illustrative" disclaimer badge. */
function IllustrativeBadge() {
  return (
    <Badge variant="secondary" className="font-mono text-[10px]">
      Illustrative — parametric model, not measured
    </Badge>
  );
}

export function DepthView() {
  const { config, loops, setLoops } = useMythosConfig();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  const model = React.useMemo(
    () => buildModel(config.max_loop_iters),
    [config.max_loop_iters],
  );

  // Keep the URL-synced loop depth inside this page's extended range.
  const clampedLoops = Math.max(1, Math.min(loops, model.maxLoops));
  const setLoopsClamped = React.useCallback(
    (n: number) => setLoops(Math.max(1, Math.min(n, model.maxLoops))),
    [setLoops, model.maxLoops],
  );

  const peak = peakLoops(model);
  const peakQ = quality(peak, model);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-6">
        {/* 1 — n_loops slider + key readouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Layers className="size-4 text-recurrent" />
              Inference loop depth
              <IllustrativeBadge />
            </CardTitle>
            <CardDescription>
              Pass <span className="font-mono">n_loops</span> higher than the
              trained default to think deeper at inference — no retraining.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoopsSlider
              loops={clampedLoops}
              setLoops={setLoopsClamped}
              model={model}
            />
          </CardContent>
        </Card>

        {/* 2 + 3 — Quality curve with baseline overlay + overthinking shading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              Quality vs depth
              <IllustrativeBadge />
            </CardTitle>
            <CardDescription>
              Saturating gains, a peak near{" "}
              <span className="font-mono text-recurrent">{peak}</span> loops
              (quality ≈{" "}
              <span className="font-mono">{peakQ.toFixed(2)}</span>), then the
              red overthinking decline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QualityCurve loops={clampedLoops} model={model} reduced={reduced} />
          </CardContent>
        </Card>

        {/* 4 + 5 — N-hop toy + compute note */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                N-hop reasoning
                <IllustrativeBadge />
              </CardTitle>
              <CardDescription>
                More loops solve more hops — then overthinking scrambles them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NhopPanel loops={clampedLoops} model={model} reduced={reduced} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compute, not parameters</CardTitle>
              <CardDescription>
                Depth scaling trades FLOPs for reasoning depth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComputeNote loops={clampedLoops} model={model} />
            </CardContent>
          </Card>
        </div>

        {/* 6 — Implementation: n_loops is just a forward() argument */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Implementation
            </h2>
            <Badge variant="outline" className="font-mono text-[10px]">
              no retraining
            </Badge>
          </div>
          <p className="max-w-2xl text-xs text-muted-foreground">
            Depth extrapolation needs no new weights — <code>n_loops</code> is
            simply an argument to <code>OpenMythos.forward</code>. Pass a larger
            value at inference and the shared recurrent block runs more
            iterations.
          </p>
          <CodeRefPanel refKey="forward" activeLines={[995]} />
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <ConfigPanel fields={["variant", "loops"]} />

        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4 text-sm">
          <div className="flex items-center gap-2 text-recurrent">
            <TriangleAlert className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              The overthinking failure mode
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Past <span className="font-mono text-destructive">~{peak}</span>{" "}
            loops, the hidden state drifts past the solution into noise and
            quality <strong>falls</strong>. ACT halting stops each token early to
            avoid it.
          </p>
          <dl className="space-y-1 border-t border-border pt-3 font-mono text-xs">
            <Row label="trained depth" value={model.trainDefault} />
            <Row label="quality peak" value={`~${peak} loops`} />
            <Row label="overthink >" value={peak} />
            <Row label="slider max" value={model.maxLoops} />
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
