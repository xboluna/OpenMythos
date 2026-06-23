"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Formula, FormulaBlock } from "@/components/shared/formula-block";
import { discreteA } from "@/lib/lti";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOG_A,
  DEFAULT_LOG_DT,
  LOG_A_RANGE,
  LOG_DT_RANGE,
  formatNum,
} from "./constants";

/**
 * The two learned parameters of `LTIInjection` — `log_A` and `log_dt` — and the
 * resulting discretized diagonal entry. The display emphasises that the value
 * stays strictly inside (0, 1) no matter how the sliders move. `onActivity`
 * fires while the user is editing so the source panel can highlight `get_A()`.
 */
export function ParamSliders({
  logA,
  logDt,
  onLogA,
  onLogDt,
  onActivity,
}: {
  logA: number;
  logDt: number;
  onLogA: (v: number) => void;
  onLogDt: (v: number) => void;
  onActivity?: () => void;
}) {
  const aDisc = discreteA(logA, logDt);
  const dt = Math.exp(logDt);
  const aCont = -Math.exp(logA);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ParamSlider
          label="log_A"
          symbol="\log A"
          value={logA}
          range={LOG_A_RANGE}
          defaultValue={DEFAULT_LOG_A}
          onChange={onLogA}
          onActivity={onActivity}
        />
        <ParamSlider
          label="log_dt"
          symbol="\log \Delta t"
          value={logDt}
          range={LOG_DT_RANGE}
          defaultValue={DEFAULT_LOG_DT}
          onChange={onLogDt}
          onActivity={onActivity}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-recurrent/30 bg-recurrent/5 px-4 py-3">
        <Stat label="Δt = exp(log_dt)" value={formatNum(dt)} />
        <Stat label="Aᶜ = −exp(log_A)" value={formatNum(aCont)} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">A_disc</span>
          <Badge className="bg-recurrent font-mono text-base text-black">
            {formatNum(aDisc)}
          </Badge>
          <span className="font-mono text-xs text-[#22c55e]">∈ (0, 1) ✓</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <FormulaBlock
          math={"A_{\\text{disc}} = \\exp\\!\\big(-\\exp(\\log\\Delta t + \\log A)\\big)"}
          caption="The combined log-space form — exactly LTIInjection.get_A()."
        />
        <div className="grid gap-1.5 sm:grid-cols-2">
          <FormulaBlock math={"A_c = -\\exp(\\log A)"} />
          <FormulaBlock math={"A_{\\text{disc}} = \\exp(\\Delta t \\cdot A_c)"} />
        </div>
        <p className="text-xs text-muted-foreground">
          Because <Formula math={"A_c < 0"} /> always, the ZOH map{" "}
          <Formula math={"\\exp(\\Delta t \\cdot A_c)"} /> lands strictly in{" "}
          <Formula math={"(0, 1)"} /> for every choice of the learned
          parameters.
        </p>
      </div>
    </div>
  );
}

function ParamSlider({
  label,
  symbol,
  value,
  range,
  defaultValue,
  onChange,
  onActivity,
}: {
  label: string;
  symbol: string;
  value: number;
  range: { min: number; max: number; step: number };
  defaultValue: number;
  onChange: (v: number) => void;
  onActivity?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Formula math={symbol} />
          <span className="text-xs text-muted-foreground">({label})</span>
        </label>
        <span className="font-mono text-sm text-recurrent">
          {formatNum(value, 2)}
        </span>
      </div>
      <Slider
        min={range.min}
        max={range.max}
        step={range.step}
        value={[value]}
        onValueChange={(v) => {
          onChange(Array.isArray(v) ? v[0] : v);
          onActivity?.();
        }}
        onFocus={onActivity}
        aria-label={`${label}, currently ${formatNum(value, 2)}`}
        aria-valuetext={formatNum(value, 2)}
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{range.min}</span>
        <button
          type="button"
          onClick={() => {
            onChange(defaultValue);
            onActivity?.();
          }}
          className={cn(
            "rounded px-1 transition-colors hover:text-foreground",
            value === defaultValue && "text-recurrent",
          )}
          aria-label={`Reset ${label} to default ${defaultValue}`}
        >
          default {defaultValue}
        </button>
        <span>{range.max}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
