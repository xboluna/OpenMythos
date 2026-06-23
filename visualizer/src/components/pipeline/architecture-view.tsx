"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigPanel } from "@/components/shared/config-panel";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { useMythosConfig } from "@/lib/use-config";
import { buildStages, RECURRENT_STEP, type StageKind } from "./stages";
import { PipelineFlow } from "./pipeline-flow";
import { PipelineControls } from "./pipeline-controls";
import { StandardStack } from "./standard-stack";

/** How many loop iterations to animate before the packet continues. */
function visibleLoops(loops: number) {
  return Math.max(1, Math.min(loops, 4));
}

export function ArchitectureView() {
  const { config, loops } = useMythosConfig();
  const searchParams = useSearchParams();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  const stages = React.useMemo(
    () => buildStages(config, loops),
    [config, loops],
  );
  const loopShown = visibleLoops(loops);

  const [step, setStep] = React.useState(0);
  const [loopIter, setLoopIter] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [compare, setCompare] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);

  const lastStep = stages.length - 1;

  const stepForward = React.useCallback(() => {
    if (step === RECURRENT_STEP && loopIter < loopShown - 1) {
      setLoopIter((i) => i + 1);
      return;
    }
    if (step >= lastStep) {
      setPlaying(false);
      return;
    }
    setLoopIter(0);
    setStep((s) => s + 1);
  }, [step, loopIter, loopShown, lastStep]);

  const stepBack = React.useCallback(() => {
    if (step === RECURRENT_STEP && loopIter > 0) {
      setLoopIter((i) => i - 1);
      return;
    }
    if (step <= 0) return;
    const prev = step - 1;
    setStep(prev);
    setLoopIter(prev === RECURRENT_STEP ? loopShown - 1 : 0);
  }, [step, loopIter, loopShown]);

  const reset = React.useCallback(() => {
    setPlaying(false);
    setStep(0);
    setLoopIter(0);
  }, []);

  const togglePlay = React.useCallback(() => {
    if (reduced) return;
    setPlaying((p) => {
      if (!p && step >= lastStep) {
        setStep(0);
        setLoopIter(0);
      }
      return !p;
    });
  }, [reduced, step, lastStep]);

  // Auto-advance loop. Spends extra (shorter) ticks on the recurrent block to
  // show looping; stepForward stops playback once it reaches the end.
  React.useEffect(() => {
    if (!playing || reduced) return;
    const delay = step === RECURRENT_STEP ? 550 : 900;
    const id = window.setTimeout(stepForward, delay);
    return () => window.clearTimeout(id);
  }, [playing, reduced, step, loopIter, stepForward]);

  const activeStage = stages[step];
  const hoveredStage = hovered
    ? stages.find((s) => s.id === hovered)
    : undefined;
  const activeLines = (hoveredStage ?? activeStage).activeLines;

  const query = searchParams.toString();
  const recurrentHref = query ? `/recurrent-loop?${query}` : "/recurrent-loop";

  return (
    <TooltipProvider delay={150}>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <PipelineControls
              playing={playing}
              reduced={reduced}
              compare={compare}
              canBack={step > 0 || loopIter > 0}
              canForward={
                step < lastStep ||
                (step === RECURRENT_STEP && loopIter < loopShown - 1)
              }
              onTogglePlay={togglePlay}
              onStepBack={stepBack}
              onStepForward={stepForward}
              onReset={reset}
              onCompareChange={setCompare}
            />

            <div
              className={
                compare
                  ? "grid gap-6 lg:grid-cols-2"
                  : "mx-auto w-full max-w-md"
              }
            >
              <PipelineFlow
                stages={stages}
                step={step}
                loopIter={loopIter}
                loopShown={loopShown}
                hovered={hovered}
                onHover={setHovered}
                recurrentHref={recurrentHref}
                reduced={reduced}
              />
              {compare ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StandardStack
                    dim={config.dim}
                    preludeLayers={config.prelude_layers}
                    codaLayers={config.coda_layers}
                    loops={loops}
                    reduced={reduced}
                  />
                </motion.div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <ConfigPanel fields={["variant", "loops"]} />
            <Legend />
          </aside>
        </div>

        <CodeRefPanel refKey="forward" activeLines={activeLines} />
      </div>
    </TooltipProvider>
  );
}

const LEGEND: { kind: StageKind; label: string; note: string }[] = [
  { kind: "prelude", label: "Prelude", note: "dense, once" },
  { kind: "recurrent", label: "Recurrent", note: "MoE, looped" },
  { kind: "coda", label: "Coda", note: "dense, once" },
];

function Legend() {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card/50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Stages
      </h2>
      <ul className="space-y-2">
        {LEGEND.map((l) => (
          <li key={l.kind} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 rounded-sm"
              style={{
                backgroundColor:
                  l.kind === "prelude"
                    ? "var(--stage-prelude)"
                    : l.kind === "recurrent"
                      ? "var(--stage-recurrent)"
                      : "var(--stage-coda)",
              }}
            />
            <span className="font-medium">{l.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {l.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
