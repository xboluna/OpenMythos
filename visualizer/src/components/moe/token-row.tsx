"use client";

import { motion } from "motion/react";
import { ROUTED_COLOR } from "./routing";
import { cn } from "@/lib/utils";

/**
 * A row of example tokens. Selecting one drives the routing shown across the
 * rest of the page. Keyboard accessible (roving via native buttons + arrow
 * keys handled by the browser tab order; left/right move selection).
 */
export function TokenRow({
  tokens,
  selected,
  onSelect,
  reduced,
}: {
  tokens: { text: string; hint: string }[];
  selected: number;
  onSelect: (i: number) => void;
  reduced: boolean;
}) {
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onSelect((i + 1) % tokens.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onSelect((i - 1 + tokens.length) % tokens.length);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Example tokens — select one to inspect its routing"
      className="flex flex-wrap gap-2"
    >
      {tokens.map((tok, i) => {
        const active = i === selected;
        return (
          <motion.button
            key={`${tok.text}-${i}`}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Token "${tok.text}" (${tok.hint})`}
            title={tok.hint}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            className={cn(
              "group relative rounded-lg border px-3 py-2 text-left font-mono text-sm transition-colors outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "border-recurrent bg-[color-mix(in_oklab,var(--stage-recurrent)_16%,transparent)] text-foreground"
                : "border-border bg-card/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
            style={active ? { borderColor: ROUTED_COLOR } : undefined}
          >
            <span className="block leading-tight">{tok.text}</span>
            <span className="mt-0.5 block text-[10px] font-sans text-muted-foreground">
              {tok.hint}
            </span>
            {active ? (
              <motion.span
                layoutId={reduced ? undefined : "token-underline"}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                style={{ backgroundColor: ROUTED_COLOR }}
              />
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
