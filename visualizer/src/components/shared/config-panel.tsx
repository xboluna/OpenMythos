"use client";

import { RotateCcw } from "lucide-react";
import type { AttnType } from "@/lib/config";
import { useMythosConfig } from "@/lib/use-config";
import { VARIANTS } from "@/lib/variants";
import { estimateParams, formatParams } from "@/lib/variants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/**
 * Shared sidebar config panel (PLAN §3.1). Selects the model variant, overrides
 * the attention type and recurrent loop depth, and reflects everything into the
 * URL so the configuration is shareable across pages.
 *
 * `fields` lets a page show only the controls relevant to it.
 */
export function ConfigPanel({
  className,
  fields = ["variant", "attn", "loops"],
  showParams = true,
}: {
  className?: string;
  fields?: Array<"variant" | "attn" | "loops">;
  showParams?: boolean;
}) {
  const { config, variantId, loops, attn, setVariant, setLoops, setAttn, reset } =
    useMythosConfig();
  const params = estimateParams(config);

  return (
    <aside
      className={cn(
        "space-y-5 rounded-xl border border-border bg-card/50 p-4 text-card-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Configuration
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-7 gap-1 text-xs text-muted-foreground"
        >
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>

      {fields.includes("variant") ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Variant
          </label>
          <Select value={variantId} onValueChange={(v) => setVariant(v as never)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VARIANTS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {fields.includes("attn") ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Attention
          </label>
          <ToggleGroup
            value={[attn]}
            onValueChange={(vals) => {
              const v = vals[0];
              if (v) setAttn(v as AttnType);
            }}
            className="w-full"
            variant="outline"
          >
            <ToggleGroupItem value="mla" className="flex-1">
              MLA
            </ToggleGroupItem>
            <ToggleGroupItem value="gqa" className="flex-1">
              GQA
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      ) : null}

      {fields.includes("loops") ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Loop depth (n_loops)
            </label>
            <span className="font-mono text-sm">{loops}</span>
          </div>
          <Slider
            min={1}
            max={Math.max(64, config.max_loop_iters * 2)}
            step={1}
            value={[loops]}
            onValueChange={(v) => setLoops(Array.isArray(v) ? v[0] : v)}
          />
          <p className="text-[11px] text-muted-foreground">
            Variant trains on {config.max_loop_iters}. Higher = depth
            extrapolation.
          </p>
        </div>
      ) : null}

      {showParams ? (
        <div className="space-y-1 border-t border-border pt-3 font-mono text-xs">
          <Row label="dim" value={config.dim} />
          <Row label="heads" value={config.n_heads} />
          <Row label="experts" value={`${config.n_experts} (top-${config.n_experts_per_tok})`} />
          <Row label="shared" value={config.n_shared_experts} />
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">total params</span>
            <Badge variant="secondary" className="font-mono">
              ~{formatParams(params.total)}
            </Badge>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
