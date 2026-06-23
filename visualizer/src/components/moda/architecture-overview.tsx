"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, Database, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODA_CONFIG } from "./constants";

function SubLayer({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "attn" | "moe";
}) {
  return (
    <div
      className={
        tone === "attn"
          ? "rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2"
          : "rounded-lg border border-border bg-muted/40 px-3 py-2"
      }
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="font-mono text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1 text-muted-foreground">
      <ArrowDown className="size-3.5" aria-hidden />
      {label ? (
        <span className="font-mono text-[10px] leading-none">{label}</span>
      ) : null}
    </div>
  );
}

export function ArchitectureOverview() {
  const reduced = useReducedMotion() ?? false;
  const layers = [0, 1, 2, 3];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Layers className="size-4 text-teal-400" aria-hidden />
          Architecture overview
          <Badge
            variant="outline"
            className="border-teal-500/40 font-mono text-[10px] text-teal-200/80"
          >
            MoDABlock × {MODA_CONFIG.nLayers}
          </Badge>
        </CardTitle>
        <CardDescription>
          A post-norm decoder block pairs depth-aware attention with a DeepSeek
          MoE FFN. After the FFN, each layer projects its output through{" "}
          <code className="font-mono">W_K^W</code> /{" "}
          <code className="font-mono">W_V^W</code> and writes one K/V entry into
          a shared <span className="text-teal-300">depth cache</span> that all
          later layers can read. Grounded in{" "}
          <code className="font-mono">MoDABlock</code> /{" "}
          <code className="font-mono">MoDAModel</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          {/* Single block internals */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Inside one block (post-norm)
            </p>
            <div className="rounded-xl border border-dashed border-teal-500/40 bg-card/40 p-3">
              <div className="rounded-lg bg-muted/40 px-3 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
                x  (B, T, {MODA_CONFIG.dModel})
              </div>
              <FlowArrow />
              <SubLayer
                title="MoDA Attention"
                detail="reads depth cache 0…L-1 + causal seq"
                tone="attn"
              />
              <FlowArrow label="+ residual → RMSNorm" />
              <SubLayer
                title="DeepSeek MoE FFN"
                detail={`${MODA_CONFIG.nSharedExperts} shared + top-${MODA_CONFIG.nActivatedExperts}/${MODA_CONFIG.nRoutedExperts} routed`}
                tone="moe"
              />
              <FlowArrow label="+ residual → RMSNorm" />
              <div className="rounded-lg bg-muted/40 px-3 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
                x_out
              </div>
              <FlowArrow label="W_K^W · W_V^W (RoPE on K)" />
              <div className="flex items-center justify-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-1.5">
                <Database className="size-3.5 text-teal-400" aria-hidden />
                <span className="font-mono text-[11px] text-teal-200">
                  write K/V → depth cache
                </span>
              </div>
            </div>
          </div>

          {/* Layer stack + depth cache lane */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              How layers stack &amp; share the depth cache
            </p>
            <div className="flex gap-3">
              {/* layer column */}
              <div className="flex-1 space-y-2">
                {layers.map((l) => (
                  <div
                    key={l}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="font-mono text-xs text-foreground">
                      layer {l}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      reads depth 0…{l - 1 < 0 ? "∅" : l - 1}
                    </span>
                  </div>
                ))}
                <div className="px-1 text-center font-mono text-[10px] text-muted-foreground">
                  ⋮ {MODA_CONFIG.nLayers} layers total
                </div>
              </div>

              {/* depth cache lane */}
              <div className="flex w-20 flex-col items-center rounded-lg border border-dashed border-teal-500/40 bg-teal-500/5 p-2">
                <span className="mb-1 text-center font-mono text-[10px] text-teal-300">
                  depth
                  <br />
                  cache
                </span>
                {layers.map((l) => (
                  <motion.div
                    key={l}
                    className="mb-1.5 flex h-7 w-full items-center justify-center rounded border border-teal-500/40 bg-teal-500/15 font-mono text-[10px] text-teal-100"
                    initial={reduced ? false : { opacity: 0.35 }}
                    animate={reduced ? undefined : { opacity: [0.35, 1, 0.65] }}
                    transition={
                      reduced
                        ? undefined
                        : {
                            duration: 2.4,
                            repeat: Infinity,
                            delay: l * 0.5,
                            ease: "easeInOut",
                          }
                    }
                  >
                    K/V{l}
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Layer <span className="font-mono">L</span> attends jointly over
              its own causal sequence keys{" "}
              <span className="text-foreground">and</span> the{" "}
              <span className="text-teal-300">depth K/V</span> written by layers{" "}
              <span className="font-mono">0…L-1</span> at the same token
              position — combined memory length grows to{" "}
              <span className="font-mono">O(T·L)</span>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
