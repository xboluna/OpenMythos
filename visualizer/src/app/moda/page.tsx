import { PageHeader } from "@/components/layout/page-header";
import { ModaBanner } from "@/components/moda/moda-banner";
import { ArchitectureOverview } from "@/components/moda/architecture-overview";
import { DepthCacheViz } from "@/components/moda/depth-cache-viz";
import { UnifiedSoftmaxViz } from "@/components/moda/unified-softmax-viz";
import { MoeGateViz } from "@/components/moda/moe-gate-viz";
import { ModaCodeRefs } from "@/components/moda/moda-code-refs";

export default function ModaPage() {
  return (
    <div>
      <PageHeader
        title="MoDA (Experimental)"
        subtitle="An alternative depth-aware attention + DeepSeek-MoE architecture."
      />

      <ModaBanner />

      <div className="space-y-6">
        <section
          aria-labelledby="moda-arch-section"
          className="space-y-3"
        >
          <h2
            id="moda-arch-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            How a MoDA block is built
          </h2>
          <ArchitectureOverview />
        </section>

        <section aria-labelledby="moda-depth-section" className="space-y-3">
          <h2
            id="moda-depth-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Depth-aware attention
          </h2>
          <DepthCacheViz />
          <UnifiedSoftmaxViz />
        </section>

        <section aria-labelledby="moda-moe-section" className="space-y-3">
          <h2
            id="moda-moe-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            DeepSeek mixture-of-experts FFN
          </h2>
          <MoeGateViz />
        </section>

        <section aria-labelledby="moda-impl-section" className="space-y-3">
          <h2
            id="moda-impl-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Implementation (authoritative)
          </h2>
          <ModaCodeRefs />
          <p className="px-1 text-[11px] text-muted-foreground">
            All diagrams above are seeded, illustrative simulations. The code
            panels are the source of truth — see{" "}
            <code className="font-mono">open_mythos/moda.py</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
