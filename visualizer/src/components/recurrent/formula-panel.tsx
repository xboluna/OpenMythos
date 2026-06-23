"use client";

import * as React from "react";
import { Formula } from "@/components/shared/formula-block";
import { recurrentLoopSteps } from "@/lib/code-refs";
import { cn } from "@/lib/utils";

/** Which term of the LTI update each sub-step emphasizes. */
const STEP_TERM: Record<string, "Ah" | "Be" | "trans" | null> = {
  "loop-embed": "Ah",
  "inject-e": "Be",
  transformer: "trans",
  lora: "trans",
  lti: "Ah",
  "act-prob": null,
  "act-accumulate": null,
};

const STEP_CAPTION: Record<string, string> = {
  "loop-embed":
    "A sinusoidal loop-index signal is added to h — same weights behave differently at each depth.",
  "inject-e":
    "The frozen encoded input e is re-injected and RMS-normed, keeping the original prompt alive at any depth.",
  transformer:
    "Shared attention + MoE FFN process the combined state — the per-loop reasoning step.",
  lora: "A depth-wise low-rank LoRA delta nudges behavior for this specific loop index.",
  lti: "Stable update h ← A·h + B·e + trans_out, with ρ(A) < 1 so the state can never blow up.",
  "act-prob":
    "A halting head emits a per-position probability p of stopping at this loop.",
  "act-accumulate":
    "ACT remainder trick accumulates h into the output; halted positions stop contributing.",
};

function Term({
  active,
  math,
}: {
  active: boolean;
  math: string;
}) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 transition-colors",
        active
          ? "border-recurrent bg-recurrent/15 text-recurrent"
          : "border-transparent text-muted-foreground",
      )}
    >
      <Formula math={math} />
    </span>
  );
}

export function FormulaPanel({
  substepIndex,
  className,
}: {
  substepIndex: number;
  className?: string;
}) {
  const step = recurrentLoopSteps[substepIndex];
  const term = STEP_TERM[step.id] ?? null;

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-border bg-muted/40 p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-base">
        <Formula math="h_{t+1} =" />
        <Term active={term === "Ah"} math="A\,h_t" />
        <Formula math="+" />
        <Term active={term === "Be"} math="B\,e" />
        <Formula math="+" />
        <Term active={term === "trans"} math="\text{Transformer}(h_t,\, e)" />
      </div>

      {step.id === "act-prob" ? (
        <div className="flex justify-center">
          <Formula math="p_t = \sigma(W_{\text{act}}\, h_{t+1})" />
        </div>
      ) : null}
      {step.id === "act-accumulate" ? (
        <div className="flex justify-center">
          <Formula math="h_{\text{out}} \mathrel{+}= w_t\, h_{t+1}, \quad w_t = \min(p_t,\, 1 - \textstyle\sum p)" />
        </div>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        {STEP_CAPTION[step.id]}
      </p>
    </div>
  );
}
