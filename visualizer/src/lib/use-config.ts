"use client";

import {
  parseAsInteger,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import type { AttnType, MythosConfig } from "./config";
import {
  VARIANT_IDS,
  getVariant,
  type VariantId,
} from "./variants";

const attnTypes = ["mla", "gqa"] as const;

export function useMythosConfig() {
  const [variantId, setVariantId] = useQueryState(
    "variant",
    parseAsStringLiteral(VARIANT_IDS).withDefault("mythos_1b"),
  );
  const [loops, setLoops] = useQueryState("loops", parseAsInteger);
  const [attn, setAttn] = useQueryState(
    "attn",
    parseAsStringLiteral(attnTypes),
  );

  const variant = getVariant(variantId);
  const config: MythosConfig = {
    ...variant.config,
    attn_type: (attn ?? variant.config.attn_type) as AttnType,
  };

  const effectiveLoops = loops ?? config.max_loop_iters;

  const reset = () => {
    void setVariantId(null);
    void setLoops(null);
    void setAttn(null);
  };

  return {
    config,
    variantId: variant.id,
    loops: effectiveLoops,
    attn: config.attn_type,
    setVariant: (id: VariantId) => {
      void setVariantId(id);
      void setLoops(null);
    },
    setLoops: (n: number) => {
      void setLoops(n);
    },
    setAttn: (next: AttnType) => {
      void setAttn(next);
    },
    reset,
  };
}
