"use client";

import * as React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { simulateTrajectory } from "@/lib/lti";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  A_RAW_RANGE,
  B_INIT,
  E_INPUT,
  H0,
  STEPS,
  formatNum,
} from "./constants";

/** Y cap so a diverging trajectory clips visibly instead of crushing the axis. */
const UNSTABLE_CAP = 6;

/**
 * Side-by-side comparison of the constrained Parcae A (always < 1, converges)
 * and an unconstrained `a` the user can push to ≥ 1 to make the hidden state
 * explode. The key teaching moment of the page.
 */
export function ComparisonChart({
  constrainedA,
  aRaw,
  onARaw,
  reduced,
}: {
  constrainedA: number;
  aRaw: number;
  onARaw: (v: number) => void;
  reduced: boolean;
}) {
  const unstable = aRaw >= 1;

  const data = React.useMemo(() => {
    const c = simulateTrajectory({
      a: constrainedA,
      b: B_INIT,
      e: E_INPUT,
      h0: H0,
      steps: STEPS,
    });
    const u = simulateTrajectory({
      a: aRaw,
      b: B_INIT,
      e: E_INPUT,
      h0: H0,
      steps: STEPS,
    });
    return Array.from({ length: STEPS + 1 }, (_, step) => ({
      step,
      constrained: c[step] ?? null,
      unconstrained: Number.isFinite(u[step]) ? u[step] : null,
    }));
  }, [constrainedA, aRaw]);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
          unstable
            ? "border-destructive/40 bg-destructive/10"
            : "border-[#22c55e]/30 bg-[#22c55e]/5",
        )}
      >
        <div className="flex items-center gap-2">
          {unstable ? (
            <>
              <AlertTriangle className="size-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                UNSTABLE — ρ(A) ≥ 1
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4 text-[#22c55e]" />
              <span className="text-sm font-semibold text-[#22c55e]">
                Stable — ρ(A) &lt; 1
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            unconstrained a
          </span>
          <Badge
            variant={unstable ? "destructive" : "secondary"}
            className="font-mono"
          >
            {formatNum(aRaw, 2)}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          min={A_RAW_RANGE.min}
          max={A_RAW_RANGE.max}
          step={A_RAW_RANGE.step}
          value={[aRaw]}
          onValueChange={(v) => onARaw(Array.isArray(v) ? v[0] : v)}
          aria-label={`Unconstrained a value, currently ${formatNum(aRaw, 2)}`}
          aria-valuetext={formatNum(aRaw, 2)}
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>{A_RAW_RANGE.min} (stable)</span>
          <span>1.0 (boundary)</span>
          <span>{A_RAW_RANGE.max} (explodes)</span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              domain={[0, unstable ? UNSTABLE_CAP : "auto"]}
              allowDataOverflow={unstable}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Tooltip content={<CmpTooltip />} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Line
              type="monotone"
              dataKey="constrained"
              name="Constrained (Parcae)"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduced}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="unconstrained"
              name="Unconstrained"
              stroke="var(--destructive)"
              strokeWidth={2.5}
              strokeDasharray={unstable ? undefined : "5 4"}
              dot={false}
              isAnimationActive={!reduced}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <LegendDot color="#22c55e" label="Constrained (Parcae) → converges" />
        <LegendDot
          color="var(--destructive)"
          label={unstable ? "Unconstrained → diverges (clipped)" : "Unconstrained"}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Every divergent training run learns ρ(A) ≥ 1; Parcae makes ρ(A) &lt; 1
        impossible to violate.
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

type Payload = {
  dataKey: string;
  value: number | null;
  color: string;
};

function CmpTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Payload[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">
        loop <span className="font-mono text-foreground">{label}</span>
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-mono">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.value == null ? "∞" : formatNum(p.value)}
        </p>
      ))}
    </div>
  );
}
