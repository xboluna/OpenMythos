"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfigPanel } from "@/components/shared/config-panel";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { useMythosConfig } from "@/lib/use-config";
import { recurrentLoopSteps } from "@/lib/code-refs";
import { LoopControls } from "./loop-controls";
import { SubstepIndicator } from "./substep-indicator";
import { LoopDiagram } from "./loop-diagram";
import { InjectionDemo } from "./injection-demo";
import { ActSection } from "./act-section";
import { LoopEmbeddingWaveform } from "./loop-embedding-waveform";
import { ColorLegend } from "./color-legend";
import { SourceRefs } from "./source-refs";
import { synthFields } from "./lib";

const AUTOPLAY_MS = 1000;

export function RecurrentView() {
  const { config, loops } = useMythosConfig();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  const [rawT, setT] = React.useState(0);
  const [substep, setSubstep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [inject, setInject] = React.useState(true);

  const loopDim = Math.floor(config.dim / 8);

  // Derive the in-range loop index so a shrinking loop depth never needs an
  // effect to "fix up" state.
  const t = Math.max(0, Math.min(rawT, loops - 1));

  const fields = React.useMemo(
    () => synthFields(loops, inject),
    [loops, inject],
  );

  const clampT = React.useCallback(
    (next: number) => setT(Math.max(0, Math.min(loops - 1, next))),
    [loops],
  );

  const stepForward = React.useCallback(() => {
    if (t >= loops - 1) {
      setPlaying(false);
      return;
    }
    setT(t + 1);
  }, [t, loops]);

  const stepBack = React.useCallback(() => clampT(t - 1), [t, clampT]);

  const reset = React.useCallback(() => {
    setPlaying(false);
    setT(0);
  }, []);

  const togglePlay = React.useCallback(() => {
    if (reduced) return;
    setPlaying((p) => {
      if (!p && t >= loops - 1) setT(0);
      return !p;
    });
  }, [reduced, t, loops]);

  React.useEffect(() => {
    if (!playing || reduced) return;
    const id = window.setTimeout(stepForward, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, reduced, t, stepForward]);

  const activeLines = recurrentLoopSteps[substep].lines;

  return (
    <TooltipProvider delay={150}>
      <div className="space-y-6">
        {/* Controls + sub-step pipeline */}
        <div className="space-y-3">
          <LoopControls
            t={t}
            loops={loops}
            playing={playing}
            reduced={reduced}
            onSetT={clampT}
            onStepBack={stepBack}
            onStepForward={stepForward}
            onTogglePlay={togglePlay}
            onReset={reset}
          />
          <SubstepIndicator active={substep} onSelect={setSubstep} />
        </div>

        {/* Main: loop diagram + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <LoopDiagram
            fields={fields}
            loopT={t}
            loops={loops}
            substepIndex={substep}
            inject={inject}
            onInjectChange={setInject}
            reduced={reduced}
          />
          <aside className="space-y-4">
            <ConfigPanel fields={["variant", "loops"]} />
            <ColorLegend />
          </aside>
        </div>

        {/* Source synced to active sub-step */}
        <CodeRefPanel refKey="recurrentLoop" activeLines={activeLines} />

        {/* Injection drift demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Input injection vs drift
              <Badge variant="secondary" className="font-mono text-[10px]">
                illustrative
              </Badge>
            </CardTitle>
            <CardDescription>
              The frozen input <span className="text-prelude">e</span> is what
              lets depth scale without forgetting the prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InjectionDemo loopT={t} loops={loops} inject={inject} />
          </CardContent>
        </Card>

        {/* ACT halting */}
        <Card>
          <CardHeader>
            <CardTitle>ACT halting — adaptive depth per token</CardTitle>
            <CardDescription>
              Walk the loop stepper and watch tokens halt as their cumulative
              probability crosses the threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActSection
              loopT={t}
              loops={loops}
              threshold={config.act_threshold}
              reduced={reduced}
            />
          </CardContent>
        </Card>

        {/* Loop-index embedding waveform */}
        <Card>
          <CardHeader>
            <CardTitle>Loop-index embedding — same weights, new behavior</CardTitle>
            <CardDescription>
              Why one shared block can do something different on every loop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoopEmbeddingWaveform
              loopT={t}
              loops={loops}
              loopDim={loopDim}
            />
          </CardContent>
        </Card>

        {/* Implementation references */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Implementation
          </h2>
          <SourceRefs />
        </section>
      </div>
    </TooltipProvider>
  );
}
