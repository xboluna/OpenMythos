"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  VARIANTS,
  estimateParams,
  formatParams,
  type VariantId,
} from "@/lib/variants";
import { cn } from "@/lib/utils";
import { formatContext, formatTokens } from "./utils";

type Column = {
  key: string;
  label: string;
  /** Right-align numeric columns. */
  numeric?: boolean;
};

const COLUMNS: Column[] = [
  { key: "name", label: "Variant" },
  { key: "total", label: "Params", numeric: true },
  { key: "dim", label: "dim", numeric: true },
  { key: "heads", label: "Heads (q / kv)", numeric: true },
  { key: "experts", label: "Experts", numeric: true },
  { key: "expert_dim", label: "Expert dim", numeric: true },
  { key: "loops", label: "Loop iters", numeric: true },
  { key: "layers", label: "Prelude / Coda", numeric: true },
  { key: "context", label: "Context", numeric: true },
  { key: "output", label: "Max output", numeric: true },
];

export function VariantTable({
  selectedId,
  onSelect,
}: {
  selectedId: VariantId;
  onSelect: (id: VariantId) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card/50">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Comparison of all Mythos model scales. Select a row to make it the
          site-wide default configuration.
        </caption>
        <thead>
          <tr className="border-b border-border text-left">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  col.numeric && "text-right",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((v) => {
            const p = estimateParams(v.config);
            const c = v.config;
            const selected = v.id === selectedId;
            const handleSelect = () => onSelect(v.id);
            return (
              <tr
                key={v.id}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`Select ${v.name} (${formatParams(p.total)} parameters)`}
                onClick={handleSelect}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-border/60 outline-none transition-colors last:border-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  selected &&
                    "bg-[color-mix(in_oklch,var(--stage-recurrent)_12%,transparent)] hover:bg-[color-mix(in_oklch,var(--stage-recurrent)_18%,transparent)]",
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    "px-3 py-2.5 text-left font-medium",
                    selected &&
                      "border-l-2 border-[var(--stage-recurrent)] pl-[10px]",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {selected ? (
                      <Check className="size-3.5 text-[var(--stage-recurrent)]" />
                    ) : null}
                    {v.name}
                  </span>
                </th>
                <Td numeric>
                  <span
                    className={cn(
                      "font-mono",
                      selected
                        ? "font-semibold text-[var(--stage-recurrent)]"
                        : "text-foreground",
                    )}
                  >
                    {formatParams(p.total)}
                  </span>
                </Td>
                <Td numeric mono>
                  {c.dim.toLocaleString()}
                </Td>
                <Td numeric mono>
                  {c.n_heads} / {c.n_kv_heads}
                </Td>
                <Td numeric mono>
                  <span title={`${c.n_experts} experts, top-${c.n_experts_per_tok} routed, ${c.n_shared_experts} shared`}>
                    {c.n_experts}
                    <span className="text-muted-foreground">
                      {" "}
                      ·t{c.n_experts_per_tok}·s{c.n_shared_experts}
                    </span>
                  </span>
                </Td>
                <Td numeric mono>
                  {c.expert_dim.toLocaleString()}
                </Td>
                <Td numeric mono>
                  {c.max_loop_iters}
                </Td>
                <Td numeric mono>
                  {c.prelude_layers} / {c.coda_layers}
                </Td>
                <Td numeric mono>
                  {formatContext(c.max_seq_len)}
                </Td>
                <Td numeric mono>
                  {formatTokens(c.max_output_tokens)}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Td({
  children,
  numeric,
  mono,
}: {
  children: React.ReactNode;
  numeric?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5",
        numeric && "text-right",
        mono && "font-mono text-[13px]",
      )}
    >
      {children}
    </td>
  );
}
