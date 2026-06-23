"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The primary loop stepper: advance the recurrence index `t` from 0 … loops-1
 * via slider, step buttons, or autoplay. Autoplay is disabled under
 * `prefers-reduced-motion`.
 */
export function LoopControls({
  t,
  loops,
  playing,
  reduced,
  onSetT,
  onStepBack,
  onStepForward,
  onTogglePlay,
  onReset,
  className,
}: {
  t: number;
  loops: number;
  playing: boolean;
  reduced: boolean;
  onSetT: (t: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  className?: string;
}) {
  const atStart = t <= 0;
  const atEnd = t >= loops - 1;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/50 p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onStepBack}
          disabled={atStart}
          aria-label="Previous loop iteration"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant={playing ? "secondary" : "default"}
          size="sm"
          onClick={onTogglePlay}
          disabled={reduced}
          aria-label={playing ? "Pause autoplay" : "Play loop autoplay"}
          title={reduced ? "Autoplay disabled (reduced motion)" : undefined}
        >
          {playing ? <Pause /> : <Play />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onStepForward}
          disabled={atEnd}
          aria-label="Next loop iteration"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onReset}
          aria-label="Reset to loop 0"
        >
          <RotateCcw />
        </Button>
      </div>

      <div className="flex min-w-[10rem] flex-1 items-center gap-3">
        <Slider
          min={0}
          max={Math.max(0, loops - 1)}
          step={1}
          value={[Math.min(t, loops - 1)]}
          onValueChange={(v) => onSetT(Array.isArray(v) ? v[0] : v)}
          aria-label="Loop iteration"
          className="flex-1"
        />
        <Badge
          variant="secondary"
          className="shrink-0 gap-1 font-mono text-recurrent"
        >
          loop {Math.min(t, loops - 1)}
          <span className="text-muted-foreground">/ {loops - 1}</span>
        </Badge>
      </div>
    </div>
  );
}
