"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Series = {
  label: string;
  color: string;
  points: number[];
  /** Render this series dashed (e.g. the "off" comparison). */
  dashed?: boolean;
  dim?: boolean;
};

/**
 * Minimal responsive SVG line chart over a shared integer x-domain
 * (0 … pointCount-1). All series must share the same length. Optionally marks
 * the active x index and draws a y reference line (e.g. y = 0 or a threshold).
 */
export function LineChart({
  series,
  markIndex,
  yMin,
  yMax,
  refLine,
  height = 150,
  className,
  ariaLabel,
}: {
  series: Series[];
  markIndex?: number;
  yMin?: number;
  yMax?: number;
  refLine?: { value: number; label?: string; color?: string };
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const W = 1000;
  const H = 360;
  const padX = 36;
  const padY = 24;

  const count = Math.max(...series.map((s) => s.points.length), 1);
  const allVals = series.flatMap((s) => s.points);
  if (refLine) allVals.push(refLine.value);
  const lo = yMin ?? Math.min(0, ...allVals);
  const hi = yMax ?? Math.max(1, ...allVals);
  const span = hi - lo || 1;

  const x = (i: number) =>
    padX + (count <= 1 ? 0 : (i / (count - 1)) * (W - 2 * padX));
  const y = (v: number) => H - padY - ((v - lo) / span) * (H - 2 * padY);

  const pathFor = (pts: number[]) =>
    pts
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(" ");

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        {/* baseline (y of lo) */}
        <line
          x1={padX}
          x2={W - padX}
          y1={y(lo)}
          y2={y(lo)}
          stroke="currentColor"
          className="text-border"
          strokeWidth={1}
        />
        {refLine ? (
          <g>
            <line
              x1={padX}
              x2={W - padX}
              y1={y(refLine.value)}
              y2={y(refLine.value)}
              stroke={refLine.color ?? "currentColor"}
              className={refLine.color ? undefined : "text-muted-foreground"}
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
            {refLine.label ? (
              <text
                x={W - padX}
                y={y(refLine.value) - 6}
                textAnchor="end"
                className="fill-muted-foreground"
                style={{ fontSize: 20, fontFamily: "var(--font-mono)" }}
              >
                {refLine.label}
              </text>
            ) : null}
          </g>
        ) : null}

        {typeof markIndex === "number" && count > 1 ? (
          <line
            x1={x(markIndex)}
            x2={x(markIndex)}
            y1={padY}
            y2={H - padY}
            stroke="var(--stage-recurrent)"
            strokeWidth={2}
            strokeDasharray="3 4"
            opacity={0.7}
          />
        ) : null}

        {series.map((s) => (
          <path
            key={s.label}
            d={pathFor(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.dim ? 2 : 3}
            strokeOpacity={s.dim ? 0.45 : 1}
            strokeDasharray={s.dashed ? "7 6" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {typeof markIndex === "number" && count > 1
          ? series.map((s) => {
              const v = s.points[Math.min(markIndex, s.points.length - 1)];
              if (v == null) return null;
              return (
                <circle
                  key={`${s.label}-dot`}
                  cx={x(markIndex)}
                  cy={y(v)}
                  r={5}
                  fill={s.color}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              );
            })
          : null}
      </svg>
    </div>
  );
}

/** Compact legend rendered as colored swatches + labels. */
export function ChartLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {series.map((s) => (
        <span
          key={s.label}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{
              backgroundColor: s.color,
              opacity: s.dim ? 0.5 : 1,
            }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}
