"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { METHOD_COLOR } from "./lib";

const SIZE = 220;
const C = SIZE / 2;
const R = 84;

const Q_COLOR = METHOD_COLOR.mla;
const K_COLOR = METHOD_COLOR.gqa;

const MAX_POS = 24;

/** Frequency bands → radians of rotation per position step (illustrative). */
const FREQ_MIN = 0.12;
const FREQ_MAX = 0.62;

/**
 * RoPE as a position-dependent rotation. A Q component and a K component live on
 * the unit circle; sliding their sequence positions rotates each vector by
 * angle ∝ position × frequency. The attention-relevant quantity is the relative
 * rotation between them, which is why RoPE encodes *relative* position.
 * Angles/positions here are illustrative.
 */
export function RopeAnimation({ reduced }: { reduced: boolean }) {
  const [mPos, setMPos] = React.useState(6);
  const [nPos, setNPos] = React.useState(2);
  const [band, setBand] = React.useState(0.45);

  const freq = FREQ_MIN + band * (FREQ_MAX - FREQ_MIN);
  const angleQ = mPos * freq;
  const angleK = nPos * freq;
  const rel = (mPos - nPos) * freq;
  const cosRel = Math.cos(rel);

  const tip = (angle: number) => ({
    x: C + R * Math.cos(-angle),
    y: C + R * Math.sin(-angle),
  });
  const q = tip(angleQ);
  const k = tip(angleK);

  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 120, damping: 18 };

  return (
    <div className="grid items-center gap-5 md:grid-cols-[auto_1fr]">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto shrink-0"
        role="img"
        aria-label={`RoPE rotation: query at position ${mPos}, key at position ${nPos}, relative angle ${(rel * (180 / Math.PI)).toFixed(0)} degrees`}
      >
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth={1} />
        <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="var(--border)" strokeWidth={1} />
        <line x1={C} y1={C - R} x2={C} y2={C + R} stroke="var(--border)" strokeWidth={1} />

        {/* relative-angle wedge */}
        <path
          d={describeArc(C, C, R * 0.32, -angleK, -angleQ)}
          fill={`color-mix(in oklab, ${Q_COLOR} 18%, transparent)`}
          stroke="none"
        />

        {/* K vector */}
        <motion.line
          x1={C}
          y1={C}
          animate={{ x2: k.x, y2: k.y }}
          transition={spring}
          stroke={K_COLOR}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <motion.circle animate={{ cx: k.x, cy: k.y }} transition={spring} r={4} fill={K_COLOR} />

        {/* Q vector */}
        <motion.line
          x1={C}
          y1={C}
          animate={{ x2: q.x, y2: q.y }}
          transition={spring}
          stroke={Q_COLOR}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <motion.circle animate={{ cx: q.x, cy: q.y }} transition={spring} r={4} fill={Q_COLOR} />

        <circle cx={C} cy={C} r={3} fill="var(--muted-foreground)" />
      </svg>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5" style={{ color: Q_COLOR }}>
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: Q_COLOR }} />
            Q · position m
          </Badge>
          <Badge variant="outline" className="gap-1.5" style={{ color: K_COLOR }}>
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: K_COLOR }} />
            K · position n
          </Badge>
          <Badge variant="secondary" className="font-mono">
            Δθ = (m−n)·f = {(rel * (180 / Math.PI)).toFixed(0)}°
          </Badge>
          <Badge variant="secondary" className="font-mono">
            cos Δθ = {cosRel.toFixed(2)}
          </Badge>
        </div>

        <PosSlider
          label="query position m"
          value={mPos}
          color={Q_COLOR}
          onChange={setMPos}
        />
        <PosSlider
          label="key position n"
          value={nPos}
          color={K_COLOR}
          onChange={setNPos}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-muted-foreground">
              frequency band f
            </label>
            <span className="font-mono text-foreground">{freq.toFixed(2)} rad/pos</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[band]}
            onValueChange={(v) => setBand(Array.isArray(v) ? v[0] : v)}
            aria-label="RoPE frequency band"
          />
          <p className="text-[10px] text-muted-foreground">
            Low dims rotate slowly (long-range), high dims rotate fast.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          RoPE is applied to Q and K <em>before</em> the cache is written, so
          stored keys are already position-encoded. Attention depends only on the{" "}
          <span className="font-medium text-foreground">relative</span> rotation
          Δθ between query and key.
        </p>
      </div>
    </div>
  );
}

function PosSlider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-muted-foreground">{label}</label>
        <span className="font-mono" style={{ color }}>
          {value}
        </span>
      </div>
      <Slider
        min={0}
        max={MAX_POS}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        aria-label={label}
        aria-valuetext={`${value}`}
      />
    </div>
  );
}

/** SVG arc path from angle a0 to a1 (radians, screen-space) at radius r. */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const start = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) };
  const end = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
  const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;
}
