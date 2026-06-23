"use client";

import { useMythosConfig } from "@/lib/use-config";
import { getVariant } from "@/lib/variants";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { VariantTable } from "./variant-table";
import { ParamBreakdownChart } from "./param-breakdown-chart";
import { SelectedVariantDetail } from "./selected-variant-detail";

export function VariantsView() {
  const { variantId, setVariant } = useMythosConfig();
  const selected = getVariant(variantId);

  return (
    <div className="space-y-8">
      <VariantTable selectedId={variantId} onSelect={setVariant} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ParamBreakdownChart selectedId={variantId} onSelect={setVariant} />
        </div>
        <div className="lg:col-span-2">
          <SelectedVariantDetail variant={selected} />
        </div>
      </div>

      <div className="space-y-1.5">
        <CodeRefPanel refKey="variants" />
        <p className="px-1 text-[11px] text-muted-foreground">
          Variant configs and parameter estimates above are hand-mirrored from
          this file — there is no build step, so values are kept in sync
          manually.
        </p>
      </div>
    </div>
  );
}
