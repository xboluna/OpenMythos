"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ROUTED_COLOR } from "./routing";
import { Formula } from "@/components/shared/formula-block";

/**
 * Two linked views of the routing math for the selected token:
 *  - the router's softmax distribution over a representative subset of experts
 *    (selected experts highlighted amber), and
 *  - the renormalized combine weights for the top-k, shown to sum to 1.
 */
export function RouterScores({
  scores,
  topkIdx,
  topkScores,
  topkWeights,
  reduced,
}: {
  scores: number[];
  topkIdx: number[];
  topkScores: number[];
  topkWeights: number[];
  reduced: boolean;
}) {
  const selectedSet = React.useMemo(() => new Set(topkIdx), [topkIdx]);

  // Top experts by score (union with the selected set so all picks are visible).
  const topByScore = React.useMemo(() => {
    const idx = scores.map((s, e) => ({ s, e }));
    idx.sort((a, b) => b.s - a.s);
    const take = new Set(idx.slice(0, 12).map((d) => d.e));
    topkIdx.forEach((e) => take.add(e));
    return [...take].sort((a, b) => scores[b] - scores[a]);
  }, [scores, topkIdx]);

  const chartData = topByScore.map((e) => ({
    name: `E${e}`,
    expert: e,
    score: scores[e],
    selected: selectedSet.has(e),
  }));

  const weightSum = topkWeights.reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium">Router softmax scores</h3>
          <span className="text-[11px] text-muted-foreground">
            top {chartData.length} of {scores.length}
          </span>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 6, right: 8, bottom: 4, left: 0 }}
              barCategoryGap={6}
            >
              <XAxis
                dataKey="name"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={42}
                tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                width={34}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <Bar dataKey="score" radius={[3, 3, 0, 0]} isAnimationActive={!reduced}>
                {chartData.map((d) => (
                  <Cell
                    key={d.expert}
                    fill={d.selected ? ROUTED_COLOR : "var(--muted-foreground)"}
                    fillOpacity={d.selected ? 1 : 0.35}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-muted-foreground">
          <Formula math="\text{scores} = \mathrm{softmax}(\text{logits})" /> —
          computed from the <span className="text-foreground">unbiased</span>{" "}
          logits. Amber bars are the selected top-k.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium">Renormalized combine weights</h3>
          <span className="font-mono text-[11px] text-muted-foreground">
            Σ = {weightSum.toFixed(3)}
          </span>
        </div>

        {/* Stacked weight bar summing to 1 */}
        <div className="flex h-7 w-full overflow-hidden rounded-md border border-border">
          {topkIdx.map((e, i) => (
            <div
              key={e}
              className="flex items-center justify-center text-[10px] font-mono text-background"
              style={{
                width: `${topkWeights[i] * 100}%`,
                backgroundColor: `color-mix(in oklab, ${ROUTED_COLOR} ${Math.round(
                  55 + 45 * (i === 0 ? 1 : topkWeights[i] / topkWeights[0]),
                )}%, transparent)`,
              }}
              title={`Expert ${e}: ${(topkWeights[i] * 100).toFixed(1)}%`}
            >
              {topkWeights[i] > 0.08 ? `${(topkWeights[i] * 100).toFixed(0)}%` : ""}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-2 py-1 font-medium">expert</th>
                <th className="px-2 py-1 text-right font-medium">score</th>
                <th className="px-2 py-1 text-right font-medium">weight</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {topkIdx.map((e, i) => (
                <tr key={e} className="border-b border-border/60 last:border-0">
                  <td className="px-2 py-1">
                    <span
                      className="mr-1.5 inline-block size-2 rounded-sm align-middle"
                      style={{ backgroundColor: ROUTED_COLOR }}
                    />
                    E{e}
                  </td>
                  <td className="px-2 py-1 text-right text-muted-foreground">
                    {(topkScores[i] * 100).toFixed(2)}%
                  </td>
                  <td className="px-2 py-1 text-right text-foreground">
                    {(topkWeights[i] * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="px-2 py-1">Σ</td>
                <td className="px-2 py-1 text-right text-muted-foreground">
                  {(topkScores.reduce((a, b) => a + b, 0) * 100).toFixed(2)}%
                </td>
                <td className="px-2 py-1 text-right">100.00%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Gathered scores are divided by their sum so the combine weights add to
          1 — the experts&apos; outputs are mixed in these proportions.
        </p>
      </div>
    </div>
  );
}
