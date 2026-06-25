"use client";

import * as React from "react";
import {
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { AttnType, MythosConfig } from "./config";
import { VARIANTS, getVariant, type VariantId } from "./variants";

/**
 * Shared, URL-synced model configuration (PLAN §4.1: "URL search params +
 * Zustand"). The URL stays small — it stores only the selected variant plus a
 * couple of overrides (loops, attention) — and every page derives the full
 * `MythosConfig` from it. This makes configs shareable as links
 * (e.g. ?variant=3b&loops=32&attn=gqa).
 */

const variantIds = VARIANTS.map((v) => v.id) as [VariantId, ...VariantId[]];
const attnValues = ["mla", "gqa"] as const;

export function useMythosConfig() {
  const [state, setState] = useQueryStates(
    {
      variant: parseAsStringLiteral(variantIds).withDefault("1b"),
      loops: parseAsInteger,
      attn: parseAsStringLiteral(attnValues),
    },
    { history: "replace" },
  );

  const variant = getVariant(state.variant);

  const config: MythosConfig = React.useMemo(() => {
    const base = { ...variant.config };
    if (state.attn) base.attn_type = state.attn as AttnType;
    if (state.loops && state.loops > 0) base.max_loop_iters = state.loops;
    return base;
  }, [variant, state.attn, state.loops]);

  const setVariant = React.useCallback(
    (id: VariantId) => setState({ variant: id }),
    [setState],
  );
  const setLoops = React.useCallback(
    (loops: number | null) => setState({ loops }),
    [setState],
  );
  const setAttn = React.useCallback(
    (attn: AttnType | null) => setState({ attn }),
    [setState],
  );
  const reset = React.useCallback(
    () => setState({ variant: "1b", loops: null, attn: null }),
    [setState],
  );

  return {
    variantId: state.variant,
    variant,
    config,
    /** Effective loop depth (override or variant default). */
    loops: config.max_loop_iters,
    attn: config.attn_type,
    loopsOverride: state.loops,
    attnOverride: state.attn as AttnType | null,
    setVariant,
    setLoops,
    setAttn,
    reset,
  };
}

export type UseMythosConfig = ReturnType<typeof useMythosConfig>;
