"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Boxes, RefreshCw, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Formula, FormulaBlock } from "@/components/shared/formula-block";
import { cn } from "@/lib/utils";
import { MODA_CONFIG, seededLogits, softmax } from "./constants";

const { nRoutedExperts, nActivatedExperts, nSharedExperts } = MODA_CONFIG;

export function MoeGateViz() {
  const reduced = useReducedMotion() ?? false;
  const [seed, setSeed] = React.useState(7);

  const { scores, topIdx, topWeights } = React.useMemo(() => {
    const s = softmax(seededLogits(seed * 31 + 5, nRoutedExperts));
    const order = s
      .map((v, i) => [v, i] as const)
      .sort((a, b) => b[0] - a[0]);
    const top = order.slice(0, nActivatedExperts).map(([, i]) => i);
    // Gate weights = original (un-biased) scores at selected indices.
    const tw = new Map(top.map((i) => [i, s[i]]));
    return { scores: s, topIdx: new Set(top), topWeights: tw };
  }, [seed]);

  const cols = 8;
  const rows = Math.ceil(nRoutedExperts / cols);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Boxes className="size-4 text-teal-400" aria-hidden />
          DeepSeek MoE gate
          <Badge variant="secondary" className="font-mono text-[10px]">
            illustrative
          </Badge>
        </CardTitle>
        <CardDescription>
          MoDA&apos;s FFN is a DeepSeek-style MoE:{" "}
          <span className="text-teal-300">{nSharedExperts} shared experts</span>{" "}
          always fire, while a gate routes each token to{" "}
          <span className="text-teal-300">
            top-{nActivatedExperts} of {nRoutedExperts}
          </span>{" "}
          routed experts via a softmax over affinity logits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSeed((s) => s + 1)}
            className="border-teal-500/40 text-teal-200 hover:bg-teal-500/10"
          >
            <RefreshCw className="size-3.5" aria-hidden /> Resample token
          </Button>
          <span className="text-[11px] text-muted-foreground">
            re-routes a fresh seeded token through the gate
          </span>
        </div>

        {/* Shared lane */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Shared experts — always active
          </p>
          <div className="flex gap-2">
            {Array.from({ length: nSharedExperts }, (_, i) => (
              <div
                key={i}
                className="flex h-9 flex-1 items-center justify-center rounded-md border border-teal-400/50 bg-teal-500/15 font-mono text-[11px] text-teal-100"
              >
                shared {i}
              </div>
            ))}
          </div>
        </div>

        {/* Routed expert grid */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Routed experts — sparse top-{nActivatedExperts}
          </p>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              if (i >= nRoutedExperts)
                return <div key={i} aria-hidden />;
              const selected = topIdx.has(i);
              const intensity = Math.min(1, scores[i] * nRoutedExperts * 0.5);
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded border font-mono text-[9px]",
                    selected
                      ? "border-teal-300 text-teal-50"
                      : "border-border text-muted-foreground/50",
                  )}
                  style={
                    selected
                      ? { backgroundColor: "#2dd4bf", opacity: 0.85 }
                      : {
                          backgroundColor: `color-mix(in oklab, #2dd4bf ${(intensity * 22).toFixed(0)}%, transparent)`,
                        }
                  }
                  animate={
                    reduced || !selected ? undefined : { scale: [1, 1.12, 1] }
                  }
                  transition={
                    reduced ? undefined : { duration: 1.4, repeat: Infinity }
                  }
                  title={`expert ${i} — score ${(scores[i] * 100).toFixed(1)}%${selected ? " (selected)" : ""}`}
                >
                  {i}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected weights */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gate weights (selected)
          </p>
          <div className="space-y-1">
            {[...topWeights.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([idx, w], k) => {
                const maxW = Math.max(...topWeights.values());
                return (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="w-14 shrink-0 font-mono text-muted-foreground">
                      expert {idx}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded bg-muted/40">
                      <motion.div
                        className="h-full rounded"
                        style={{ backgroundColor: "#2dd4bf", opacity: 0.8 }}
                        initial={reduced ? false : { width: 0 }}
                        animate={{ width: `${(w / maxW) * 100}%` }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { duration: 0.35, delay: k * 0.04 }
                        }
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-teal-200">
                      {(w * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Balance loss */}
        <div className="rounded-lg border border-dashed border-teal-500/40 bg-teal-500/5 p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <Scale className="size-3.5 text-teal-400" aria-hidden />
            <span className="text-sm font-medium text-foreground">
              Expert-level balance loss
            </span>
            <Badge
              variant="outline"
              className="border-teal-500/40 font-mono text-[10px] text-teal-200/80"
            >
              α = {MODA_CONFIG.moeBalanceAlpha}
            </Badge>
          </div>
          <FormulaBlock
            className="my-1.5"
            math={"\\mathcal{L}_{\\text{bal}} = \\sum_i f_i\\, P_i,\\quad f_i = \\tfrac{N_r}{K'T}\\,\\#\\{t \\to i\\},\\; P_i = \\tfrac{1}{T}\\sum_t s_{i,t}"}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Unlike the core OpenMythos MoE (which uses an{" "}
            <span className="text-foreground">aux-loss-free</span> per-expert
            routing bias), this experimental MoE keeps the gate bias{" "}
            <Formula math={"\\textit{off}"} /> (
            <code className="font-mono">use_bias=False</code>) and instead adds
            DeepSeekMoE&apos;s explicit balance loss to discourage routing
            collapse. Gate weights come from the{" "}
            <span className="text-foreground">un-biased</span> softmax scores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
