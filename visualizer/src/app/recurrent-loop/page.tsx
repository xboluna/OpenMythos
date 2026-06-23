import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RecurrentView } from "@/components/recurrent/recurrent-view";

export default function RecurrentLoopPage() {
  return (
    <div>
      <PageHeader
        title="Recurrent Loop"
        subtitle="The signature loop: input injection, ACT halting, depth-wise LoRA."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        A single <span className="text-recurrent">recurrent block</span> with
        shared weights runs over a stable hidden state{" "}
        <span className="font-mono">h</span>, re-injecting the frozen encoded
        input <span className="text-prelude font-mono">e</span> on every
        iteration. Each loop adds a sinusoidal loop-index signal and a depth-wise
        LoRA delta, so the <em>same parameters think deeper the more they loop</em>
        , while per-token ACT halting spends compute only where it is needed.
        Step through the loop below to watch <span className="font-mono">h</span>{" "}
        evolve.
      </p>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card/40" />
        }
      >
        <RecurrentView />
      </Suspense>
    </div>
  );
}
