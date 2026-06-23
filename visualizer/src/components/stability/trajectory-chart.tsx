"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveChart } from "@/components/shared/responsive-chart";
import { fixedPoint, simulateTrajectory } from "@/lib/lti";
import { B_INIT, E_INPUT, H0, STEPS, formatNum } from "./constants";

/**
 * Trajectory of the scalar linear recurrence h_{t+1} = a·h + b·e for the
 * CURRENT constrained A. Because a ∈ (0, 1), the curve decays smoothly onto the
 * fixed point h* = b·e / (1 − a), which is drawn as a dashed reference line.
 */
export function TrajectoryChart({
  a,
  reduced,
}: {
  a: number;
  reduced: boolean;
}) {
  const data = React.useMemo(() => {
    const traj = simulateTrajectory({
      a,
      b: B_INIT,
      e: E_INPUT,
      h0: H0,
      steps: STEPS,
    });
    return traj.map((h, step) => ({ step, h }));
  }, [a]);

  const fp = fixedPoint(a, B_INIT, E_INPUT);

  return (
    <div className="space-y-2">
      <div className="h-[260px] w-full">
        <ResponsiveChart width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 4, left: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="step"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              label={{
                value: "loop t",
                position: "insideBottom",
                offset: -2,
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <YAxis
              width={44}
              domain={[0, "auto"]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => v.toFixed(2)}
            />
            <Tooltip content={<TrajTooltip />} />
            {fp != null ? (
              <ReferenceLine
                y={fp}
                stroke="#22c55e"
                strokeDasharray="5 4"
                label={{
                  value: `h* = ${formatNum(fp, 3)}`,
                  position: "insideTopRight",
                  fill: "#22c55e",
                  fontSize: 11,
                }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="h"
              stroke="var(--stage-recurrent)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduced}
            />
          </LineChart>
        </ResponsiveChart>
      </div>
      <p className="text-xs text-muted-foreground">
        a = A_disc ={" "}
        <span className="font-mono text-recurrent">{formatNum(a)}</span>, b ={" "}
        <span className="font-mono">{B_INIT}</span> (model B init), e ={" "}
        <span className="font-mono">{E_INPUT}</span>. Converges to the fixed
        point because ρ(A) &lt; 1.
      </p>
    </div>
  );
}

type Payload = { value: number; payload: { step: number } };

function TrajTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Payload[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { step } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">
        loop <span className="font-mono text-foreground">{step}</span>
      </p>
      <p className="font-mono">
        h = <span className="text-recurrent">{formatNum(payload[0].value)}</span>
      </p>
    </div>
  );
}
