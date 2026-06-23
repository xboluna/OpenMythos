"use client";

import * as React from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { ResponsiveChart } from "@/components/shared/responsive-chart";
import { AlertTriangle, Scale } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { computeLoad, gini, ROUTED_COLOR } from "./routing";

const SAMPLE_TOKENS = 480;

/**
 * Load-balancing (router_bias) demo. Tallies how often each expert is selected
 * across a population of synthetic tokens. With the bias off, a few hot experts
 * dominate; with it on, selection is nudged toward underused experts so load
 * evens out — while the gating WEIGHTS still come from the unbiased softmax.
 */
export function LoadBalance({
  nExperts,
  topk,
  loopIndex,
  reduced,
}: {
  nExperts: number;
  topk: number;
  loopIndex: number;
  reduced: boolean;
}) {
  const [biasOn, setBiasOn] = React.useState(true);

  const loadOff = React.useMemo(
    () =>
      computeLoad({
        nExperts,
        topk,
        biasOn: false,
        nTokens: SAMPLE_TOKENS,
        loopIndex,
      }),
    [nExperts, topk, loopIndex],
  );
  const loadOn = React.useMemo(
    () =>
      computeLoad({
        nExperts,
        topk,
        biasOn: true,
        nTokens: SAMPLE_TOKENS,
        loopIndex,
      }),
    [nExperts, topk, loopIndex],
  );

  const counts = biasOn ? loadOn : loadOff;
  const max = Math.max(...counts, 1);
  const data = counts.map((c, e) => ({ name: `E${e}`, expert: e, count: c }));

  const giniOff = gini(loadOff);
  const giniOn = gini(loadOn);
  const currentGini = biasOn ? giniOn : giniOff;
  const deadCount = counts.filter((c) => c === 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Switch
            checked={biasOn}
            onCheckedChange={(v) => setBiasOn(v)}
            aria-label="Load-balancing bias"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Scale className="size-4 text-muted-foreground" aria-hidden />
            Load-balancing bias
            <Badge
              variant={biasOn ? "default" : "outline"}
              className="font-mono text-[10px]"
            >
              {biasOn ? "ON" : "OFF"}
            </Badge>
          </span>
        </label>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-muted-foreground">
            balance (Gini){" "}
            <span
              className="text-foreground"
              style={{ color: currentGini > 0.25 ? "var(--destructive)" : undefined }}
            >
              {currentGini.toFixed(3)}
            </span>
          </span>
          <span className="text-muted-foreground">
            unused experts{" "}
            <span className="text-foreground">
              {deadCount}/{nExperts}
            </span>
          </span>
        </div>
      </div>

      <div className="h-[200px] w-full" role="img"
        aria-label={`Per-expert selection counts across ${SAMPLE_TOKENS} tokens with balancing bias ${
          biasOn ? "on" : "off"
        }. Gini coefficient ${currentGini.toFixed(3)}.`}
      >
        <ResponsiveChart width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, bottom: 4, left: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis
              width={30}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} isAnimationActive={!reduced}>
              {data.map((d) => {
                const heat = d.count / max;
                return (
                  <Cell
                    key={d.expert}
                    fill={ROUTED_COLOR}
                    fillOpacity={0.35 + 0.65 * heat}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveChart>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Selection counts across {SAMPLE_TOKENS} synthetic tokens over the{" "}
        {nExperts}-expert sample (illustrative). Toggle the bias to watch the
        skew flatten: balance improves from{" "}
        <span className="font-mono text-foreground">{giniOff.toFixed(3)}</span>{" "}
        to <span className="font-mono text-foreground">{giniOn.toFixed(3)}</span>.
      </p>

      <div
        className="flex gap-2.5 rounded-lg border p-3 text-xs leading-relaxed"
        style={{
          borderColor: "color-mix(in oklab, var(--stage-recurrent) 40%, transparent)",
          backgroundColor:
            "color-mix(in oklab, var(--stage-recurrent) 8%, transparent)",
        }}
      >
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-recurrent"
          aria-hidden
        />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            The bias only changes selection, never the gradient.
          </span>{" "}
          <code className="font-mono">router_bias</code> is added inside the
          top-k only: <code className="font-mono">topk(logits + bias)</code>.
          The gating weights still come from{" "}
          <code className="font-mono">softmax(logits)</code> on the{" "}
          <span className="text-foreground">unbiased</span> logits, so balancing
          load never distorts the loss — this is DeepSeek-V3&apos;s aux-loss-free
          load balancing.
        </p>
      </div>
    </div>
  );
}
