"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepthModel, DepthPoint } from "./lib";
import { overthinkStart, quality, sampleCurve } from "./lib";

/**
 * The centerpiece: illustrative task quality vs inference loop depth. The looped
 * model rises with saturating gains, peaks, then declines in the red
 * "overthinking" zone. A flat baseline shows a fixed-depth transformer that
 * cannot extrapolate. Vertical refs mark the trained depth and current n_loops.
 */
export function QualityCurve({
  loops,
  model,
  reduced,
}: {
  loops: number;
  model: DepthModel;
  reduced: boolean;
}) {
  const data = React.useMemo<DepthPoint[]>(() => sampleCurve(model), [model]);
  const currentQ = quality(loops, model);
  const peak = overthinkStart(model);

  return (
    <div className="space-y-3">
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 20, bottom: 16, left: 4 }}
          >
            <defs>
              <linearGradient id="overthinkFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.04}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="loops"
              type="number"
              domain={[1, model.maxLoops]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              label={{
                value: "n_loops (inference depth)",
                position: "insideBottom",
                offset: -6,
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
            <YAxis
              width={40}
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => v.toFixed(2)}
              label={{
                value: "task quality (illustrative)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />

            {/* Overthinking zone shading */}
            <ReferenceArea
              x1={peak}
              x2={model.maxLoops}
              fill="var(--destructive)"
              fillOpacity={0.08}
              stroke="var(--destructive)"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
              label={{
                value: "Overthinking",
                position: "insideTop",
                fill: "var(--destructive)",
                fontSize: 11,
                offset: 8,
              }}
            />

            {/* Red fill under the overthinking segment of the curve */}
            <Area
              type="monotone"
              dataKey="overthink"
              stroke="none"
              fill="url(#overthinkFill)"
              isAnimationActive={!reduced}
              connectNulls={false}
              activeDot={false}
            />

            {/* Fixed-depth baseline (cannot extrapolate) */}
            <Line
              type="monotone"
              dataKey="baseline"
              name="Fixed-depth baseline"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              isAnimationActive={!reduced}
            />

            {/* Looped-model quality */}
            <Line
              type="monotone"
              dataKey="quality"
              name="Looped model"
              stroke="var(--stage-recurrent)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduced}
            />

            <Tooltip content={<CurveTooltip baseline={model.baseline} />} />

            {/* Trained depth */}
            <ReferenceLine
              x={model.trainDefault}
              stroke="var(--stage-prelude)"
              strokeDasharray="5 4"
              label={{
                value: "trained",
                position: "top",
                fill: "var(--stage-prelude)",
                fontSize: 11,
              }}
            />
            {/* Current n_loops */}
            <ReferenceLine
              x={loops}
              stroke="var(--stage-recurrent)"
              strokeWidth={1.5}
              label={{
                value: `n_loops=${loops}`,
                position: "top",
                fill: "var(--stage-recurrent)",
                fontSize: 11,
              }}
            />
            <ReferenceDot
              x={loops}
              y={currentQ}
              r={5}
              fill="var(--stage-recurrent)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <LegendDot color="var(--stage-recurrent)" label="Looped model (depth-extrapolates)" />
        <LegendDot
          color="var(--muted-foreground)"
          label="Fixed-depth baseline"
          dashed
        />
        <LegendDot color="var(--destructive)" label="Overthinking zone" square />
      </div>
      <p className="text-xs text-muted-foreground">
        A standard transformer is stuck at its trained depth; the looped model
        keeps improving (up to a point) by simply running more loops.
      </p>
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
  square,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  square?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {square ? (
        <span
          className="inline-block size-2.5 rounded-[2px]"
          style={{ backgroundColor: color, opacity: 0.4 }}
        />
      ) : (
        <span
          className="inline-block h-0.5 w-4 rounded-full"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            backgroundImage: dashed
              ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 7px)`
              : undefined,
          }}
        />
      )}
      {label}
    </span>
  );
}

type Payload = {
  dataKey: string;
  value: number | null;
};

function CurveTooltip({
  active,
  payload,
  label,
  baseline,
}: {
  active?: boolean;
  payload?: Payload[];
  label?: number;
  baseline?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const q = payload.find((p) => p.dataKey === "quality")?.value ?? null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">
        n_loops <span className="font-mono text-foreground">{label}</span>
      </p>
      <p className="flex items-center gap-2 font-mono">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: "var(--stage-recurrent)" }}
        />
        looped {q == null ? "—" : q.toFixed(3)}
      </p>
      <p className="flex items-center gap-2 font-mono text-muted-foreground">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: "var(--muted-foreground)" }}
        />
        baseline {baseline?.toFixed(3)}
      </p>
    </div>
  );
}
