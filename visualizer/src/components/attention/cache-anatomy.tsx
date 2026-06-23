"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Pause, Play, Plus, RotateCcw } from "lucide-react";
import type { MythosConfig } from "@/lib/config";
import { kvCachePerToken } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { METHOD_COLOR } from "./lib";

const MAX_TOKENS = 7;
const MAX_HEADS = 8;
const AUTOPLAY_MS = 900;

const GQA = METHOD_COLOR.gqa;
const MLA = METHOD_COLOR.mla;

/**
 * Side-by-side decode-step anatomy: what each method *stores* in the KV cache
 * vs what it *recomputes* on the fly, for one autoregressive decode step. Token
 * columns are illustrative; per-head dimensions are the real config values.
 */
export function CacheAnatomy({
  config,
  reduced,
}: {
  config: MythosConfig;
  reduced: boolean;
}) {
  const [count, setCount] = React.useState(3);
  const [playing, setPlaying] = React.useState(false);
  const { headDim } = kvCachePerToken(config);

  const addToken = React.useCallback(() => {
    setCount((c) => (c >= MAX_TOKENS ? c : c + 1));
  }, []);

  const reset = React.useCallback(() => {
    setPlaying(false);
    setCount(3);
  }, []);

  const step = React.useCallback(() => {
    if (count >= MAX_TOKENS) {
      setPlaying(false);
      return;
    }
    setCount(count + 1);
  }, [count]);

  React.useEffect(() => {
    if (!playing || reduced) return;
    const id = window.setTimeout(step, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, reduced, step]);

  const tokens = Array.from({ length: count }, (_, i) => i);
  const group = Math.max(1, Math.floor(config.n_heads / config.n_kv_heads));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={addToken}
          disabled={count >= MAX_TOKENS}
        >
          <Plus className="size-3.5" />
          Decode token
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (reduced) return;
            if (count >= MAX_TOKENS) setCount(3);
            setPlaying((p) => !p);
          }}
          disabled={reduced}
          aria-pressed={playing}
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Pause" : "Auto"}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {count} token{count === 1 ? "" : "s"} cached
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GqaPane
          tokens={tokens}
          config={config}
          headDim={headDim}
          group={group}
          reduced={reduced}
        />
        <MlaPane
          tokens={tokens}
          config={config}
          reduced={reduced}
        />
      </div>

      <Legend />
    </div>
  );
}

function PaneShell({
  color,
  title,
  subtitle,
  perToken,
  children,
}: {
  color: string;
  title: string;
  subtitle: string;
  perToken: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border-2 bg-card/40 p-4"
      style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color }}>
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
          {perToken}
        </Badge>
      </div>
      {children}
    </div>
  );
}

function GqaPane({
  tokens,
  config,
  headDim,
  group,
  reduced,
}: {
  tokens: number[];
  config: MythosConfig;
  headDim: number;
  group: number;
  reduced: boolean;
}) {
  const shownHeads = Math.min(config.n_kv_heads, MAX_HEADS);
  const heads = Array.from({ length: shownHeads }, (_, i) => i);
  const moreHeads = config.n_kv_heads - shownHeads;

  return (
    <PaneShell
      color={GQA}
      title="GQA — store full K and V"
      subtitle={`${config.n_kv_heads} KV heads, each shared by ${group} query heads`}
      perToken={`n_kv_heads × head_dim × 2 = ${config.n_kv_heads * headDim * 2}`}
    >
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          KV cache (solid = stored)
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <AnimatePresence initial={false}>
            {tokens.map((t) => (
              <motion.div
                key={t}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, x: 14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex shrink-0 flex-col gap-1 rounded-md p-1",
                  t === tokens.length - 1 && "ring-1 ring-offset-1 ring-offset-card",
                )}
                style={
                  t === tokens.length - 1
                    ? ({ "--tw-ring-color": GQA } as React.CSSProperties)
                    : undefined
                }
              >
                {heads.map((h) => (
                  <Block key={`k${h}`} color={GQA} small label={h === 0 ? "K" : undefined} />
                ))}
                {heads.map((h) => (
                  <Block
                    key={`v${h}`}
                    color={GQA}
                    small
                    dim
                    label={h === 0 ? "V" : undefined}
                  />
                ))}
                <span className="text-center font-mono text-[9px] text-muted-foreground">
                  t{t}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {moreHeads > 0 ? (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            +{moreHeads} more KV heads per token
          </p>
        ) : null}
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          each block = head_dim {headDim}
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border p-2">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          at compute <ArrowRight className="size-3" /> repeat_interleave to{" "}
          {config.n_heads} heads
        </p>
        <div className="flex flex-wrap gap-1.5">
          {heads.map((h) => (
            <span
              key={h}
              className="flex items-center gap-0.5 rounded px-1 py-0.5"
              style={{ backgroundColor: `color-mix(in oklab, ${GQA} 12%, transparent)` }}
            >
              <span className="font-mono text-[9px]" style={{ color: GQA }}>
                kv{h}
              </span>
              <span className="text-[9px] text-muted-foreground">→</span>
              {Array.from({ length: Math.min(group, 6) }, (_, q) => (
                <span
                  key={q}
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: GQA, opacity: 0.4 + 0.1 * q }}
                />
              ))}
              {group > 6 ? (
                <span className="text-[9px] text-muted-foreground">×{group}</span>
              ) : null}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Q heads share each cached KV head — nothing is recomputed.
        </p>
      </div>
    </PaneShell>
  );
}

function MlaPane({
  tokens,
  config,
  reduced,
}: {
  tokens: number[];
  config: MythosConfig;
  reduced: boolean;
}) {
  const cached = config.kv_lora_rank + config.n_heads * config.qk_rope_head_dim;
  return (
    <PaneShell
      color={MLA}
      title="MLA — store a compressed latent"
      subtitle="Caches c_kv + RoPE keys; reconstructs K_nope and V on the fly"
      perToken={`kv_lora_rank + n_heads × qk_rope = ${cached}`}
    >
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          KV cache (solid = stored)
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <AnimatePresence initial={false}>
            {tokens.map((t) => (
              <motion.div
                key={t}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, x: 14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex shrink-0 flex-col gap-1 rounded-md p-1",
                  t === tokens.length - 1 && "ring-1 ring-offset-1 ring-offset-card",
                )}
                style={
                  t === tokens.length - 1
                    ? ({ "--tw-ring-color": MLA } as React.CSSProperties)
                    : undefined
                }
              >
                <Block color={MLA} tall label="c_kv" />
                <Block color={MLA} dim label="k_rope" />
                <span className="text-center font-mono text-[9px] text-muted-foreground">
                  t{t}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          c_kv = {config.kv_lora_rank} · k_rope = n_heads × qk_rope ={" "}
          {config.n_heads * config.qk_rope_head_dim}
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border p-2">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          per step <ArrowRight className="size-3" /> reconstruct from c_kv (kv_up)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <GhostBlock color={MLA} label="K_nope" dims={`n_heads × ${config.qk_nope_head_dim}`} />
          <GhostBlock color={MLA} label="V" dims={`n_heads × ${config.v_head_dim}`} />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Dashed = never cached; rebuilt each decode step, trading compute for
          memory.
        </p>
      </div>
    </PaneShell>
  );
}

function Block({
  color,
  small = false,
  tall = false,
  dim = false,
  label,
}: {
  color: string;
  small?: boolean;
  tall?: boolean;
  dim?: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-[3px] font-mono text-[8px] text-white/90",
        small ? "h-2.5 w-9" : tall ? "h-7 w-12" : "h-4 w-12",
      )}
      style={{
        backgroundColor: color,
        opacity: dim ? 0.55 : 1,
      }}
    >
      {label}
    </span>
  );
}

function GhostBlock({
  color,
  label,
  dims,
}: {
  color: string;
  label: string;
  dims: string;
}) {
  return (
    <span
      className="flex flex-col items-center justify-center rounded-md border-2 border-dashed px-2 py-1"
      style={{
        borderColor: color,
        backgroundColor: `color-mix(in oklab, ${color} 8%, transparent)`,
        color,
      }}
    >
      <span className="font-mono text-[10px] font-semibold">{label}</span>
      <span className="font-mono text-[9px] text-muted-foreground">{dims}</span>
    </span>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-[3px] bg-foreground/70" />
        cached (stored every step)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-[3px] border-2 border-dashed border-foreground/50" />
        reconstructed on the fly
      </span>
    </div>
  );
}
