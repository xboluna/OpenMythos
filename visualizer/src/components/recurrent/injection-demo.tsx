"use client";

import * as React from "react";
import { simulateTrajectory } from "@/lib/lti";
import { LineChart, ChartLegend, type Series } from "./line-chart";
import { cn } from "@/lib/utils";

/**
 * Scalar LTI trajectory: injecting e every loop (stable A, b≠0) converges to a
 * fixed point and keeps the input alive; without injection (b=0) the state
 * drifts toward zero and the input signal is lost.
 */
export function InjectionDemo({
  loopT,
  loops,
  inject,
  className,
}: {
  loopT: number;
  loops: number;
  inject: boolean;
  className?: string;
}) {
  const { on, off } = React.useMemo(() => {
    const steps = Math.max(1, loops - 1);
    return {
      on: simulateTrajectory({ a: 0.6, b: 0.4, e: 1, h0: 0, steps }),
      off: simulateTrajectory({ a: 0.6, b: 0, e: 1, h0: 1, steps }),
    };
  }, [loops]);

  const series: Series[] = [
    {
      label: "inject e (b≠0) → converges",
      color: "var(--stage-prelude)",
      points: on,
      dim: !inject,
    },
    {
      label: "no inject (b=0) → drifts to 0",
      color: "var(--stage-coda)",
      points: off,
      dashed: true,
      dim: inject,
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <LineChart
        series={series}
        markIndex={loopT}
        yMin={0}
        yMax={1.05}
        refLine={{ value: 1, label: "input signal" }}
        height={170}
        ariaLabel="Scalar hidden-state trajectory with and without input injection"
      />
      <ChartLegend series={series} />
      <p className="text-xs text-muted-foreground">
        Injecting <span className="text-prelude">e</span> every loop keeps the
        original input alive across arbitrary depth; without it,{" "}
        <span className="text-recurrent">h</span> drifts. The current loop{" "}
        <span className="font-mono text-recurrent">t = {loopT}</span> is marked.
      </p>
    </div>
  );
}
