"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GAUGE_MAX, formatNum } from "./constants";

/**
 * Semicircular ρ(A) meter. The arc is split into a GREEN stable zone [0, 1) and
 * a RED unstable zone [1, GAUGE_MAX], with a tick at exactly 1.0. The needle is
 * driven by the live constrained spectral radius — which, by the Parcae
 * construction, can never reach 1, so it always sits in the green.
 *
 * The arc is drawn as sampled polylines (instead of SVG `A` commands) so the
 * geometry is unambiguous and renders identically everywhere.
 */
export function RhoGauge({ rho, className }: { rho: number; className?: string }) {
  const W = 320;
  const H = 184;
  const cx = W / 2;
  const cy = 168;
  const r = 132;
  const stroke = 18;

  // value v ∈ [0, GAUGE_MAX] → fraction along the 180° sweep (left → right).
  const frac = (v: number) => Math.min(1, Math.max(0, v / GAUGE_MAX));
  const point = (v: number, radius = r) => {
    const angle = Math.PI - frac(v) * Math.PI; // π (left) → 0 (right)
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    };
  };

  const arcPolyline = (vFrom: number, vTo: number, samples = 64) => {
    const pts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const v = vFrom + ((vTo - vFrom) * i) / samples;
      const p = point(v);
      pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    }
    return pts.join(" ");
  };

  const needle = point(Math.min(rho, GAUGE_MAX), r - stroke / 2 - 6);
  const tick1Outer = point(1, r + stroke / 2 + 2);
  const tick1Inner = point(1, r - stroke / 2 - 2);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[320px]"
        role="img"
        aria-label={`Spectral radius rho of A is ${formatNum(rho)}, in the stable zone below 1`}
      >
        {/* Track */}
        <polyline
          points={arcPolyline(0, GAUGE_MAX)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke + 4}
          strokeLinecap="round"
        />
        {/* Stable (green) zone [0, 1) */}
        <polyline
          points={arcPolyline(0, 1)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Unstable (red) zone [1, GAUGE_MAX] */}
        <polyline
          points={arcPolyline(1, GAUGE_MAX)}
          fill="none"
          stroke="var(--destructive)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Tick at exactly ρ = 1 */}
        <line
          x1={tick1Inner.x}
          y1={tick1Inner.y}
          x2={tick1Outer.x}
          y2={tick1Outer.y}
          stroke="var(--foreground)"
          strokeWidth={2.5}
        />
        <text
          x={tick1Outer.x}
          y={tick1Outer.y - 6}
          textAnchor="middle"
          className="fill-foreground font-mono"
          fontSize={12}
        >
          1.0
        </text>
        {/* End labels */}
        <text
          x={point(0).x}
          y={point(0).y + 22}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          fontSize={11}
        >
          0
        </text>
        <text
          x={point(GAUGE_MAX).x}
          y={point(GAUGE_MAX).y + 22}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          fontSize={11}
        >
          {GAUGE_MAX}
        </text>
        {/* Needle (green — always stable) */}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#22c55e"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={7} className="fill-foreground" />
        {/* Center readout */}
        <text
          x={cx}
          y={cy - 44}
          textAnchor="middle"
          className="fill-foreground font-mono"
          fontSize={34}
          fontWeight={600}
        >
          {formatNum(rho, 4)}
        </text>
        <text
          x={cx}
          y={cy - 24}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={12}
        >
          ρ(A)
        </text>
      </svg>

      <Badge
        variant="outline"
        className="mt-1 gap-1.5 border-[#22c55e]/40 text-[#22c55e]"
      >
        <ShieldCheck className="size-3.5" />
        Stable by construction · ρ(A) &lt; 1
      </Badge>
    </div>
  );
}
