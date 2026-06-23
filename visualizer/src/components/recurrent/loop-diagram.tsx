"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowDown, RefreshCw } from "lucide-react";
import { recurrentLoopSteps } from "@/lib/code-refs";
import { HeatStrip } from "./heat-strip";
import { FormulaPanel } from "./formula-panel";
import { LoraIndicator } from "./lora-indicator";
import { type LoopFields, loraScale, norm } from "./lib";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ACTIVE_STRIP: Record<string, "h" | "e" | "trans" | null> = {
  "loop-embed": "h",
  "inject-e": "e",
  transformer: "trans",
  lora: "trans",
  lti: "h",
  "act-prob": "h",
  "act-accumulate": "h",
};

function Highlight({
  on,
  children,
}: {
  on: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-1.5 transition-all",
        on ? "bg-recurrent/5 ring-1 ring-recurrent/50" : "ring-1 ring-transparent",
      )}
    >
      {children}
    </div>
  );
}

/**
 * The signature visualization: how the hidden state `h` evolves across loop
 * iterations. Heat strips for h / e / trans_out are arranged around a loop-back
 * arrow, with the active sub-step highlighting the relevant strip and term.
 */
export function LoopDiagram({
  fields,
  loopT,
  loops,
  substepIndex,
  inject,
  onInjectChange,
  reduced,
}: {
  fields: LoopFields;
  loopT: number;
  loops: number;
  substepIndex: number;
  inject: boolean;
  onInjectChange: (v: boolean) => void;
  reduced: boolean;
}) {
  const step = recurrentLoopSteps[substepIndex];
  const target = ACTIVE_STRIP[step.id] ?? null;

  const h = fields.h[Math.min(loopT, fields.h.length - 1)];
  const e = fields.e;
  const trans = fields.transOut[Math.min(loopT, fields.transOut.length - 1)];
  const lora = loraScale(loopT, loops);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Hidden-state evolution</h2>
          <p className="text-[11px] text-muted-foreground">
            Illustrative simulation — vectors synthesized from the update rule.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
          <Switch
            checked={inject}
            onCheckedChange={onInjectChange}
            aria-label="Inject encoded input e each loop"
          />
          <span className="font-medium">
            Inject <span className="text-prelude">e</span> each loop
          </span>
        </label>
      </header>

      <div className="relative sm:pl-9">
        {/* loop-back arrow: output h feeds back into the next iteration */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-2 bottom-24 hidden w-7 sm:block"
        >
          <svg
            viewBox="0 0 28 200"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <path
              d="M22 6 H10 Q2 6 2 16 V184 Q2 194 10 194 H22"
              fill="none"
              stroke="var(--stage-recurrent)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.85}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M22 6 l-5 -4 M22 6 l-5 4"
              fill="none"
              stroke="var(--stage-recurrent)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>
        <span className="absolute -left-1 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[10px] font-medium uppercase tracking-widest text-recurrent sm:block">
          <RefreshCw
            className={cn(
              "mr-1 inline size-3 rotate-90",
              !reduced && "motion-safe:animate-spin",
            )}
          />
          loop back
        </span>

        <div className="space-y-2.5">
          <Highlight on={target === "h"}>
            <HeatStrip
              values={h}
              label="h_t"
              accentColor="var(--stage-recurrent)"
              reduced={reduced}
              sublabel={`hidden state · ‖h‖ ${norm(h).toFixed(2)}`}
            />
          </Highlight>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ArrowDown className="size-3" />
            <span>
              + loop-index(t={loopT}) · RMSNorm(h + e) · Transformer · LoRA
            </span>
          </div>

          <Highlight on={target === "e"}>
            <HeatStrip
              values={e}
              label="e"
              frozen
              accentColor="var(--stage-prelude)"
              reduced={reduced}
              sublabel="encoded input · constant"
            />
          </Highlight>

          <Highlight on={target === "trans"}>
            <HeatStrip
              values={trans}
              label="trans_out"
              reduced={reduced}
              sublabel={`transformer contribution · ‖·‖ ${norm(trans).toFixed(2)}`}
            />
          </Highlight>

          <LoraIndicator
            scale={lora}
            loopT={loopT}
            active={target === "trans" && step.id === "lora"}
            reduced={reduced}
          />
        </div>
      </div>

      <FormulaPanel substepIndex={substepIndex} />

      <motion.p
        key={loopT}
        initial={reduced ? false : { opacity: 0.4 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-muted-foreground"
      >
        {inject ? (
          <>
            With injection on, <span className="text-recurrent">h</span>{" "}
            converges toward a stable pattern as loops deepen — same weights,
            more loops → deeper reasoning.
          </>
        ) : (
          <>
            Injection off: <span className="text-recurrent">h</span> decays
            toward zero and forgets the input as loops deepen.
          </>
        )}
      </motion.p>
    </section>
  );
}
