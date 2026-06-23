"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type PipelineControlsProps = {
  playing: boolean;
  reduced: boolean;
  compare: boolean;
  canBack: boolean;
  canForward: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onCompareChange: (v: boolean) => void;
};

export function PipelineControls({
  playing,
  reduced,
  compare,
  canBack,
  canForward,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  onCompareChange,
}: PipelineControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onStepBack}
          disabled={!canBack}
          aria-label="Step backward"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onTogglePlay}
          disabled={reduced}
          aria-label={playing ? "Pause" : "Play"}
          className="min-w-20"
        >
          {playing ? <Pause /> : <Play />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onStepForward}
          disabled={!canForward}
          aria-label="Step forward"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset to start"
          className="gap-1 text-muted-foreground"
        >
          <RotateCcw />
          Reset
        </Button>
      </div>

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Switch
          checked={compare}
          onCheckedChange={onCompareChange}
          aria-label="Compare to standard transformer"
        />
        <span>Compare to standard transformer</span>
      </label>

      {reduced ? (
        <span className="ml-auto text-[11px] text-muted-foreground">
          Reduced motion on — use Step to advance.
        </span>
      ) : null}
    </div>
  );
}
