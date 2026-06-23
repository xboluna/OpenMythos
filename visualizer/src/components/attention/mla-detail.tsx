"use client";

import { ArrowRight, Database } from "lucide-react";
import type { MythosConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { METHOD_COLOR } from "./lib";

const MLA = METHOD_COLOR.mla;

/**
 * Low-rank projection map for MLA: the Q path (q_down → q_up_nope / q_up_rope)
 * and the KV path (kv_down → c_kv + k_rope, with K_nope / V reconstructed via
 * kv_up). All dims are pulled live from the active config.
 */
export function MlaDetail({
  config,
  active,
}: {
  config: MythosConfig;
  active: boolean;
}) {
  const qHeadDim = config.qk_nope_head_dim + config.qk_rope_head_dim;
  return (
    <div
      className={cn(
        "space-y-5 rounded-xl border bg-card/40 p-4 transition-opacity",
        active ? "border-2" : "border-border opacity-90",
      )}
      style={active ? { borderColor: `color-mix(in oklab, ${MLA} 55%, transparent)` } : undefined}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Q path */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MLA }}>
            Query path (low-rank)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Node label="h" dim={`dim ${config.dim}`} muted />
            <Op label="q_down" />
            <Node label="q_lora" dim={`${config.q_lora_rank}`} accent />
          </div>
          <div className="ml-3 flex flex-wrap items-center gap-2 border-l border-dashed border-border pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <Op label="q_up_nope" />
              <Node
                label="q_nope"
                dim={`n_heads × ${config.qk_nope_head_dim}`}
                accent
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Op label="q_up_rope" />
              <Node
                label="q_rope"
                dim={`n_heads × ${config.qk_rope_head_dim}`}
                accent
                rope
              />
            </div>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            query head dim = qk_nope + qk_rope = {config.qk_nope_head_dim} +{" "}
            {config.qk_rope_head_dim} = {qHeadDim}
          </p>
        </div>

        {/* KV path */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MLA }}>
            Key / value path (compressed)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Node label="h" dim={`dim ${config.dim}`} muted />
            <Op label="kv_down" />
            <Node label="c_kv" dim={`${config.kv_lora_rank}`} accent cached />
            <span className="text-muted-foreground">+</span>
            <Node
              label="k_rope"
              dim={`${config.qk_rope_head_dim}`}
              accent
              rope
              cached
            />
          </div>
          <div className="ml-3 flex flex-wrap items-center gap-2 border-l border-dashed border-border pl-3">
            <Op label="kv_up" dashed />
            <Node
              label="K_nope"
              dim={`n_heads × ${config.qk_nope_head_dim}`}
              accent
              ghost
            />
            <Node
              label="V"
              dim={`n_heads × ${config.v_head_dim}`}
              accent
              ghost
            />
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            only <span style={{ color: MLA }}>c_kv + k_rope</span> are cached;
            K_nope and V are rebuilt from c_kv.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Database className="size-3" style={{ color: MLA }} />
          cached latent
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-3 rounded-[3px] border-2 border-dashed"
            style={{ borderColor: MLA }}
          />
          reconstructed (kv_up)
        </span>
      </div>
    </div>
  );
}

function Node({
  label,
  dim,
  accent = false,
  muted = false,
  rope = false,
  cached = false,
  ghost = false,
}: {
  label: string;
  dim: string;
  accent?: boolean;
  muted?: boolean;
  rope?: boolean;
  cached?: boolean;
  ghost?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex flex-col items-center justify-center rounded-md border px-2.5 py-1.5 text-center",
        ghost && "border-2 border-dashed",
        muted && "border-border bg-muted/40",
      )}
      style={
        accent
          ? {
              borderColor: METHOD_COLOR.mla,
              backgroundColor: cached
                ? `color-mix(in oklab, ${METHOD_COLOR.mla} 18%, transparent)`
                : ghost
                  ? `color-mix(in oklab, ${METHOD_COLOR.mla} 6%, transparent)`
                  : `color-mix(in oklab, ${METHOD_COLOR.mla} 10%, transparent)`,
            }
          : undefined
      }
    >
      <span className="flex items-center gap-1 font-mono text-xs font-medium">
        {label}
        {rope ? (
          <span className="text-[8px] font-normal text-muted-foreground">
            RoPE
          </span>
        ) : null}
        {cached ? (
          <Database className="size-2.5" style={{ color: METHOD_COLOR.mla }} />
        ) : null}
      </span>
      <span className="font-mono text-[9px] text-muted-foreground">{dim}</span>
    </span>
  );
}

function Op({ label, dashed = false }: { label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <ArrowRight className="size-3" />
      <span
        className={cn(
          "rounded border px-1 py-0.5 font-mono text-[9px]",
          dashed ? "border-dashed border-border" : "border-border bg-muted/30",
        )}
      >
        {label}
      </span>
      <ArrowRight className="size-3" />
    </span>
  );
}
