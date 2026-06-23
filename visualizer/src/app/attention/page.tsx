import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AttentionView } from "@/components/attention/attention-view";

export default function AttentionPage() {
  return (
    <div>
      <PageHeader
        title="Attention"
        subtitle="MLA vs GQA and their KV-cache tradeoffs."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        At decode time the dominant memory cost is the{" "}
        <span className="font-medium text-foreground">KV cache</span>, which grows
        with every token. <span className="text-prelude">GQA</span> shrinks it by
        sharing a few full key/value heads across many query heads, while{" "}
        <span className="text-coda">MLA</span> shrinks it further by caching only a
        compressed latent and reconstructing keys and values on the fly. Pick a
        method and a variant to see how the tradeoff plays out.
      </p>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card/40" />
        }
      >
        <AttentionView />
      </Suspense>
    </div>
  );
}
