"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveChart } from "@/components/shared/responsive-chart";
import { discreteA, sampleConstrainedRho } from "@/lib/lti";
import { LOG_A_RANGE, formatNum } from "./constants";

/**
 * ρ(A) swept across all log_A for the current log_dt — visual proof that the
 * constraint holds *everywhere*: the curve never reaches the red ρ = 1 line.
 * The current log_A is marked with a dot.
 */
export function RhoCurve({
  logA,
  logDt,
  reduced,
}: {
  logA: number;
  logDt: number;
  reduced: boolean;
}) {
  const data = React.useMemo(
    () =>
      sampleConstrainedRho(logDt, LOG_A_RANGE.min, LOG_A_RANGE.max, 160).map(
        (d) => ({ logA: d.logA, rho: d.rho }),
      ),
    [logDt],
  );

  const currentRho = discreteA(logA, logDt);

  return (
    <div className="space-y-2">
      <div className="h-[240px] w-full">
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
              dataKey="logA"
              type="number"
              domain={[LOG_A_RANGE.min, LOG_A_RANGE.max]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{
                value: "log_A",
                position: "insideBottom",
                offset: -2,
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <YAxis
              width={40}
              domain={[0, 1.1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => v.toFixed(2)}
            />
            <Tooltip content={<RhoTooltip />} />
            <ReferenceLine
              y={1}
              stroke="var(--destructive)"
              strokeDasharray="5 4"
              label={{
                value: "ρ = 1 (unstable)",
                position: "insideTopRight",
                fill: "var(--destructive)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="rho"
              stroke="var(--stage-recurrent)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduced}
            />
            <ReferenceDot
              x={logA}
              y={currentRho}
              r={5}
              fill="var(--stage-recurrent)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveChart>
      </div>
      <p className="text-xs text-muted-foreground">
        For log_dt = <span className="font-mono">{formatNum(logDt, 2)}</span>,
        ρ(A) stays inside (0, 1) for every log_A. Current point:{" "}
        <span className="font-mono text-recurrent">
          ρ = {formatNum(currentRho)}
        </span>
        .
      </p>
    </div>
  );
}

type Payload = { value: number; payload: { logA: number } };

function RhoTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Payload[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { logA } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-mono text-muted-foreground">
        log_A = <span className="text-foreground">{formatNum(logA, 2)}</span>
      </p>
      <p className="font-mono">
        ρ = <span className="text-recurrent">{formatNum(payload[0].value)}</span>
      </p>
    </div>
  );
}
