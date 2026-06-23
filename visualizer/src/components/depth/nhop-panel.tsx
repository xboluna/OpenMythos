"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DepthModel, HopState } from "./lib";
import { TOTAL_HOPS, TRAINED_HOPS, hopStates } from "./lib";

/**
 * Illustrative N-hop reasoning toy: a chain trained on 5-hop problems, tested on
 * deeper chains. More loops let the model reason through more hops; inside the
 * overthinking zone the deepest hops it had solved scramble back into noise.
 */
export function NhopPanel({
  loops,
  model,
  reduced,
}: {
  loops: number;
  model: DepthModel;
  reduced: boolean;
}) {
  const states = React.useMemo(() => hopStates(loops, model), [loops, model]);
  const solved = states.filter((s) => s === "solved").length;
  const broken = states.filter((s) => s === "broken").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          Trained on{" "}
          <span className="font-mono text-prelude">{TRAINED_HOPS}-hop</span>{" "}
          chains · tested on{" "}
          <span className="font-mono text-foreground">{TOTAL_HOPS}-hop</span>
        </span>
        <Badge
          variant={broken > 0 ? "destructive" : "secondary"}
          className="font-mono"
        >
          {solved}/{TOTAL_HOPS} hops solved
          {broken > 0 ? ` · ${broken} broken` : ""}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-0 py-2">
          <Node state="solved" label="Q" index={-1} reduced={reduced} />
          {states.map((state, i) => (
            <React.Fragment key={i}>
              <Edge state={state} reduced={reduced} />
              <Node
                state={state}
                label={i === TOTAL_HOPS - 1 ? "A" : String(i + 1)}
                index={i}
                reduced={reduced}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <Legend className="bg-recurrent" label="solved hop" />
        <Legend className="bg-muted-foreground/40" label="not yet reached" />
        <Legend className="bg-destructive" label="scrambled (overthinking)" />
      </div>

      <p className="text-xs text-muted-foreground">
        Each extra loop carries the chain one hop further — until too many loops
        push the hidden state past the answer and the frontier hops decay into
        noise. Schematic; not measured.
      </p>
    </div>
  );
}

const colorFor = (s: HopState) =>
  s === "solved"
    ? "var(--stage-recurrent)"
    : s === "broken"
      ? "var(--destructive)"
      : "var(--muted-foreground)";

function Node({
  state,
  label,
  index,
  reduced,
}: {
  state: HopState;
  label: string;
  index: number;
  reduced: boolean;
}) {
  const color = colorFor(state);
  return (
    <motion.div
      initial={reduced ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, delay: reduced ? 0 : Math.max(0, index) * 0.03 }}
      className="relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold"
      style={{
        borderColor: color,
        color,
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      {state === "solved" ? (
        <Check className="size-4" />
      ) : state === "broken" ? (
        <X className="size-4" />
      ) : (
        label
      )}
    </motion.div>
  );
}

function Edge({ state, reduced }: { state: HopState; reduced: boolean }) {
  const color = colorFor(state);
  const active = state !== "pending";
  return (
    <div className="relative h-0.5 w-7 shrink-0 overflow-hidden bg-muted">
      <motion.div
        className="absolute inset-0 origin-left"
        style={{ backgroundColor: color }}
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("inline-block size-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}
