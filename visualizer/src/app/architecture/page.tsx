import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ArchitectureView } from "@/components/pipeline/architecture-view";

export default function ArchitecturePage() {
  return (
    <div>
      <PageHeader
        title="Architecture"
        subtitle="The full Prelude → Recurrent → Coda pipeline."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        OpenMythos is a recurrent-depth transformer, not a vanilla stack. A
        dense <span className="text-prelude">Prelude</span> encodes the input
        once, a single <span className="text-recurrent">Recurrent</span> block
        with shared weights loops over a stable state while re-injecting the
        frozen input, and a dense <span className="text-coda">Coda</span>{" "}
        decodes the result. Because the recurrent weights are reused, the{" "}
        <em>same parameters run more loops to think deeper</em> — depth becomes a
        runtime dial rather than a fixed architectural choice.
      </p>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card/40" />
        }
      >
        <ArchitectureView />
      </Suspense>
    </div>
  );
}
