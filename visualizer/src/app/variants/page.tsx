import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { VariantsView } from "@/components/variants/variants-view";

export default function VariantsPage() {
  return (
    <div>
      <PageHeader
        title="Variants"
        subtitle="Model scales from 1B to 1T parameters."
      />
      <p className="mb-8 max-w-3xl text-sm text-muted-foreground">
        These are the predefined Mythos scales — each is a complete, ready-to-use
        configuration from <span className="font-mono">variants.py</span>.
        Selecting one sets it as the site-wide default config, so every other
        page (attention, MoE, recurrent loop…) inherits that choice.
      </p>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading variants…</p>
        }
      >
        <VariantsView />
      </Suspense>
    </div>
  );
}
