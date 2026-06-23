import { FlaskConical, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Experimental-track callout for the MoDA page. Static (server-rendered).
 *
 * Makes it unambiguous that MoDA is a SECONDARY experimental architecture in
 * `open_mythos/moda.py`, distinct from the core OpenMythos RDT
 * (Prelude → Recurrent → Coda).
 */
export function ModaBanner() {
  return (
    <section
      className="mb-8 rounded-xl border border-dashed border-teal-500/50 bg-teal-500/5 p-4 sm:p-5"
      aria-labelledby="moda-experimental-heading"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical className="size-4 text-teal-400" aria-hidden />
        <h2
          id="moda-experimental-heading"
          className="text-sm font-semibold tracking-tight text-teal-300"
        >
          Experimental architecture
        </h2>
        <Badge className="border-teal-500/40 bg-teal-500/15 font-mono text-[10px] uppercase tracking-wide text-teal-200">
          Experimental
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 border-teal-500/30 font-mono text-[10px] text-teal-200/80"
        >
          <GitBranch className="size-3" aria-hidden />
          alternative track
        </Badge>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <span className="text-foreground">MoDA</span> (Mixture-of-Depths
        Attention) is a self-contained, experimental alternative model defined
        in{" "}
        <code className="font-mono text-teal-200/90">open_mythos/moda.py</code>.
        It is <span className="text-foreground">not</span> the looped Recurrent
        Depth Transformer that defines the core OpenMythos brand — it does not
        use the Prelude / Recurrent / Coda loop, ACT halting, or the stable LTI
        injection. Instead it explores two orthogonal ideas: depth-aware
        attention with a per-layer depth KV cache, and a DeepSeek-style MoE FFN.
        Treat everything below as an illustrative simulation of that file.
      </p>
    </section>
  );
}
