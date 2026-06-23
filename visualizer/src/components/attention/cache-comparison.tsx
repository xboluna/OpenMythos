"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { AttnType, MythosConfig } from "@/lib/config";
import { kvCachePerToken } from "@/lib/config";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  CONTEXT_PRESETS,
  METHOD_COLOR,
  METHOD_LABEL,
  type CacheMethod,
  contextFromIndex,
  formatFactor,
  formatInt,
  formatScalars,
} from "./lib";

type Mode = "context" | "token";

/**
 * The headline visual: per-token (and × context) KV-cache size for standard
 * multi-head attention vs GQA vs MLA, with the reduction factor of the selected
 * method against the standard baseline. Cache sizes are real, computed from the
 * config via `kvCachePerToken`.
 */
export function CacheComparison({
  config,
  attn,
  reduced,
}: {
  config: MythosConfig;
  attn: AttnType;
  reduced: boolean;
}) {
  const [ctxIndex, setCtxIndex] = React.useState(() =>
    CONTEXT_PRESETS.indexOf(4096) === -1 ? 3 : CONTEXT_PRESETS.indexOf(4096),
  );
  const [mode, setMode] = React.useState<Mode>("context");

  const context = contextFromIndex(ctxIndex);
  const { gqa, mla, standard, headDim } = kvCachePerToken(config);

  const perToken: Record<CacheMethod, number> = { standard, gqa, mla };
  const mult = mode === "context" ? context : 1;

  const order: CacheMethod[] = ["standard", "gqa", "mla"];
  const data = order.map((m) => ({
    method: METHOD_LABEL[m],
    key: m,
    value: perToken[m] * mult,
    perToken: perToken[m],
  }));

  const selectedFactor = standard / perToken[attn];
  const gqaFactor = standard / gqa;
  const mlaFactor = standard / mla;
  const accent = METHOD_COLOR[attn];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          value={[mode]}
          onValueChange={(vals) => {
            const v = vals[0];
            if (v) setMode(v as Mode);
          }}
          variant="outline"
          spacing={0}
        >
          <ToggleGroupItem value="context" className="text-xs">
            × context
          </ToggleGroupItem>
          <ToggleGroupItem value="token" className="text-xs">
            per token
          </ToggleGroupItem>
        </ToggleGroup>

        <Badge
          variant="outline"
          className="gap-1.5 px-3 py-1 text-sm"
          style={{
            borderColor: accent,
            color: accent,
            backgroundColor: `color-mix(in oklab, ${accent} 10%, transparent)`,
          }}
        >
          {METHOD_LABEL[attn]}: {formatFactor(selectedFactor)} smaller
          <span className="text-muted-foreground">vs standard</span>
        </Badge>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 72, bottom: 4, left: 8 }}
            barCategoryGap={14}
          >
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatScalars(v)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              type="category"
              dataKey="method"
              width={92}
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={!reduced}>
              {data.map((d) => (
                <Cell
                  key={d.key}
                  fill={METHOD_COLOR[d.key]}
                  fillOpacity={d.key === attn ? 1 : d.key === "standard" ? 0.45 : 0.75}
                  stroke={d.key === attn ? METHOD_COLOR[d.key] : "transparent"}
                  strokeWidth={d.key === attn ? 1.5 : 0}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v) => (v == null ? "" : formatScalars(Number(v)))}
                fill="var(--foreground)"
                fontSize={11}
                className="font-mono"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-muted-foreground">
            Context length
          </label>
          <span className="font-mono text-foreground">
            {formatInt(context)} tokens
          </span>
        </div>
        <Slider
          min={0}
          max={CONTEXT_PRESETS.length - 1}
          step={1}
          value={[ctxIndex]}
          onValueChange={(v) => setCtxIndex(Array.isArray(v) ? v[0] : v)}
          aria-label="Context length"
          aria-valuetext={`${context} tokens`}
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>{formatInt(CONTEXT_PRESETS[0])}</span>
          <span>{formatInt(CONTEXT_PRESETS[CONTEXT_PRESETS.length - 1])}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          method="standard"
          perToken={standard}
          total={standard * context}
          sub={`n_heads × head_dim × 2 = ${config.n_heads} × ${headDim} × 2`}
        />
        <StatCard
          method="gqa"
          perToken={gqa}
          total={gqa * context}
          factor={gqaFactor}
          active={attn === "gqa"}
          sub={`n_kv_heads × head_dim × 2 = ${config.n_kv_heads} × ${headDim} × 2`}
        />
        <StatCard
          method="mla"
          perToken={mla}
          total={mla * context}
          factor={mlaFactor}
          active={attn === "mla"}
          sub={`kv_lora_rank + n_heads × qk_rope = ${config.kv_lora_rank} + ${config.n_heads} × ${config.qk_rope_head_dim}`}
        />
      </div>
    </div>
  );
}

function StatCard({
  method,
  perToken,
  total,
  factor,
  active = false,
  sub,
}: {
  method: CacheMethod;
  perToken: number;
  total: number;
  factor?: number;
  active?: boolean;
  sub: string;
}) {
  const color = METHOD_COLOR[method];
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/40 p-3",
        active ? "border-2" : "border-border",
      )}
      style={active ? { borderColor: color } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
          {METHOD_LABEL[method]}
        </span>
        {factor != null ? (
          <Badge variant="secondary" className="font-mono text-[10px]">
            {formatFactor(factor)}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            baseline
          </Badge>
        )}
      </div>
      <p className="mt-2 font-mono text-lg leading-none text-foreground">
        {formatScalars(total)}
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {formatInt(perToken)} / token
      </p>
      <p className="mt-2 font-mono text-[10px] leading-snug text-muted-foreground">
        {sub}
      </p>
    </div>
  );
}
