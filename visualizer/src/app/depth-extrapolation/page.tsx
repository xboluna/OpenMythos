import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DepthView } from "@/components/depth/depth-view";

export default function DepthExtrapolationPage() {
  return (
    <div>
      <PageHeader
        title="Depth Extrapolation"
        subtitle="More loops at inference — and the overthinking zone."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        A looped transformer trained on{" "}
        <span className="font-mono">N</span> loops can run{" "}
        <span className="font-mono">N+k</span> loops at inference to solve harder
        problems — mirroring inference-time scaling of chain-of-thought. The
        gains are real but <em>saturating</em>, and beyond a point excess
        recurrence <span className="text-destructive">degrades</span> the answer.
        A fixed-depth transformer simply can&apos;t add depth this way.
      </p>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card/40" />
        }
      >
        <DepthView />
      </Suspense>
    </div>
  );
}
