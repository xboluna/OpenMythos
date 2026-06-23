"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveChart } from "@/components/shared/responsive-chart";
import {
  VARIANTS,
  estimateParams,
  formatParams,
  type VariantId,
} from "@/lib/variants";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SEGMENTS, shortName, type SegmentKey } from "./utils";

type Row = {
  id: VariantId;
  name: string;
  total: number;
} & Record<SegmentKey, number>;

const CHART_DATA: Row[] = VARIANTS.map((v) => {
  const p = estimateParams(v.config);
  return {
    id: v.id,
    name: shortName(v.id),
    embedding: p.embedding,
    preludeCoda: p.preludeCoda,
    recurrentCore: p.recurrentCore,
    moe: p.moe,
    total: p.total,
  };
});

export function ParamBreakdownChart({
  selectedId,
  onSelect,
}: {
  selectedId: VariantId;
  onSelect: (id: VariantId) => void;
}) {
  const [logScale, setLogScale] = React.useState(false);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Where the parameters go</h2>
          <p className="text-xs text-muted-foreground">
            Estimated total parameters per scale.{" "}
            {logScale
              ? "Log scale shows totals across many orders of magnitude."
              : "Stacked by component."}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>Log scale</span>
          <Switch
            checked={logScale}
            onCheckedChange={setLogScale}
            aria-label="Toggle logarithmic y-axis scale"
          />
        </label>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveChart width="100%" height="100%">
          <BarChart
            data={CHART_DATA}
            margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
            barCategoryGap={logScale ? "30%" : "20%"}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              scale={logScale ? "log" : "auto"}
              domain={logScale ? [1e6, "auto"] : [0, "auto"]}
              allowDataOverflow={logScale}
              width={56}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v: number) => formatParams(v)}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              content={<ChartTooltip logScale={logScale} />}
            />
            {logScale ? (
              <Bar
                dataKey="total"
                name="Total"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                onClick={(_, index) => onSelect(CHART_DATA[index].id)}
              >
                {CHART_DATA.map((row) => (
                  <Cell
                    key={row.id}
                    cursor="pointer"
                    fill="var(--stage-recurrent)"
                    fillOpacity={row.id === selectedId ? 1 : 0.45}
                  />
                ))}
              </Bar>
            ) : (
              SEGMENTS.map((seg, i) => (
                <Bar
                  key={seg.key}
                  dataKey={seg.key}
                  name={seg.label}
                  stackId="params"
                  fill={seg.color}
                  isAnimationActive={false}
                  radius={i === SEGMENTS.length - 1 ? [4, 4, 0, 0] : undefined}
                  onClick={(_, index) => onSelect(CHART_DATA[index].id)}
                >
                  {CHART_DATA.map((row) => (
                    <Cell
                      key={row.id}
                      cursor="pointer"
                      fillOpacity={row.id === selectedId ? 1 : 0.55}
                    />
                  ))}
                </Bar>
              ))
            )}
          </BarChart>
        </ResponsiveChart>
      </div>

      <Legend logScale={logScale} />
    </div>
  );
}

function Legend({ logScale }: { logScale: boolean }) {
  if (logScale) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="inline-block size-3 rounded-[3px]"
          style={{ backgroundColor: "var(--stage-recurrent)" }}
        />
        Total parameters (log scale) · click a bar to select
      </div>
    );
  }
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {SEGMENTS.map((seg) => (
        <li key={seg.key} className="flex items-center gap-1.5">
          <span
            className="inline-block size-3 rounded-[3px]"
            style={{ backgroundColor: seg.color }}
          />
          {seg.label}
        </li>
      ))}
      <li className="text-muted-foreground/70">click a bar to select</li>
    </ul>
  );
}

type TooltipPayloadItem = {
  dataKey?: string | number;
  payload: Row;
};

function ChartTooltip({
  active,
  payload,
  logScale,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  logScale?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const variant = VARIANTS.find((v) => v.id === row.id);

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{variant?.name ?? row.name}</p>
      {logScale ? (
        <Line
          color="var(--stage-recurrent)"
          label="Total"
          value={formatParams(row.total)}
          bold
        />
      ) : (
        <>
          {SEGMENTS.map((seg) => (
            <Line
              key={seg.key}
              color={seg.color}
              label={seg.label}
              value={formatParams(row[seg.key])}
            />
          ))}
          <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-border pt-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-mono font-semibold">
              {formatParams(row.total)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Line({
  color,
  label,
  value,
  bold,
}: {
  color: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className="inline-block size-2.5 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className={cn("font-mono", bold && "font-semibold")}>{value}</span>
    </div>
  );
}
