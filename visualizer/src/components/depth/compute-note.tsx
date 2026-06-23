"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Cpu, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Formula } from "@/components/shared/formula-block";
import type { DepthModel } from "./lib";
import { computeMultiple } from "./lib";

/**
 * Compute-vs-quality callout: depth scaling buys reasoning with FLOPs, not
 * parameters. Links to the ACT halting demo on /recurrent-loop, preserving the
 * shared URL config so the selected variant + loop depth carry over.
 */
export function ComputeNote({
  loops,
  model,
}: {
  loops: number;
  model: DepthModel;
}) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const actHref = `/recurrent-loop${qs ? `?${qs}` : ""}`;
  const mult = computeMultiple(loops, model.trainDefault);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-recurrent/15 text-recurrent">
          <Cpu className="size-4" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Deeper reasoning is nearly free in parameters, paid in compute.
          </p>
          <p className="text-xs text-muted-foreground">
            Every loop reuses the <em>same</em> recurrent-block weights, so depth
            extrapolation adds <strong>zero</strong> parameters. The cost is
            linear in loop count: inference compute scales as{" "}
            <Formula math="\mathcal{O}(n\_loops)" />.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <Gauge className="size-5 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          At <span className="font-mono text-foreground">{loops}</span> loops
          you spend roughly{" "}
          <span className="font-mono text-recurrent">{mult.toFixed(1)}×</span>{" "}
          the recurrent-stack compute of the trained{" "}
          <span className="font-mono text-foreground">
            {model.trainDefault}
          </span>
          -loop default — for the same weights.
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-xs text-muted-foreground">
          Spending that compute blindly invites overthinking.{" "}
          <strong className="text-foreground">ACT halting</strong> mitigates it
          by stopping each token as soon as it is confident — adaptive depth
          instead of a fixed budget.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={actHref} />}
        >
          See ACT halting
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
