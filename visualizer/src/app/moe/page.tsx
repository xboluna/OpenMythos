import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MoEView } from "@/components/moe/moe-view";

export default function MoePage() {
  return (
    <div>
      <PageHeader
        title="Mixture of Experts"
        subtitle="Per-token, per-loop expert routing."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        Inside the recurrent block, the FFN is a{" "}
        <span className="text-recurrent">fine-grained MoE</span>: every token is
        routed to a handful of specialized{" "}
        <span className="text-recurrent">routed experts</span> while a few{" "}
        <span className="text-coda">shared experts</span> always fire. This keeps
        per-token compute sparse even as the total expert pool — and total
        parameter count — grows large. Pick a token below and scrub the loop
        depth to see how routing changes.
      </p>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card/40" />
        }
      >
        <MoEView />
      </Suspense>
    </div>
  );
}
