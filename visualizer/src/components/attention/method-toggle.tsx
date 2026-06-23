"use client";

import { Layers, Boxes } from "lucide-react";
import type { AttnType } from "@/lib/config";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { METHOD_COLOR } from "./lib";

/**
 * Prominent MLA | GQA selector that drives the global `attn` config. The page
 * emphasizes the selected method, but both columns of the comparison stay
 * visible regardless of which is active.
 */
export function MethodToggle({
  value,
  onChange,
}: {
  value: AttnType;
  onChange: (attn: AttnType) => void;
}) {
  return (
    <div className="space-y-2">
      <ToggleGroup
        value={[value]}
        onValueChange={(vals) => {
          const v = vals[0];
          if (v) onChange(v as AttnType);
        }}
        spacing={2}
        className="grid w-full grid-cols-2 gap-2"
        variant="outline"
      >
        <MethodItem
          method="mla"
          active={value === "mla"}
          icon={<Layers className="size-5" />}
          title="MLA"
          subtitle="Multi-Latent Attention"
          desc="Caches a compressed KV latent + RoPE keys; reconstructs K/V on the fly."
        />
        <MethodItem
          method="gqa"
          active={value === "gqa"}
          icon={<Boxes className="size-5" />}
          title="GQA"
          subtitle="Grouped Query Attention"
          desc="Stores full K and V for a small set of shared KV heads."
        />
      </ToggleGroup>
    </div>
  );
}

function MethodItem({
  method,
  active,
  icon,
  title,
  subtitle,
  desc,
}: {
  method: AttnType;
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  desc: string;
}) {
  const color = METHOD_COLOR[method];
  return (
    <ToggleGroupItem
      value={method}
      aria-label={`${title} — ${subtitle}`}
      className={cn(
        "h-auto flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors",
        "data-[pressed]:bg-transparent",
      )}
      style={
        active
          ? {
              borderColor: color,
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }
          : undefined
      }
    >
      <span className="flex w-full items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            color,
            backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
          }}
        >
          {icon}
        </span>
        <span className="flex flex-col">
          <span
            className="text-base font-semibold leading-none"
            style={{ color: active ? color : undefined }}
          >
            {title}
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </span>
      <span className="text-xs font-normal whitespace-normal text-muted-foreground">
        {desc}
      </span>
    </ToggleGroupItem>
  );
}
