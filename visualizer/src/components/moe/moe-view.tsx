"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { Info } from "lucide-react";
import { useMythosConfig } from "@/lib/use-config";
import { routedActivationFraction } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfigPanel } from "@/components/shared/config-panel";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import {
  computeRouting,
  visibleExpertCount,
  EXAMPLE_TOKENS,
} from "./routing";
import { TokenRow } from "./token-row";
import { ExpertGrid } from "./expert-grid";
import { RouterScores } from "./router-scores";
import { LoadBalance } from "./load-balance";
import { ActivationSummary, SharedCallout } from "./summary";

// open_mythos/main.py — router + renorm region, and the dispatch loop.
const ROUTER_LINES = [512, 513, 514, 515, 516];
const DISPATCH_LINES = [519, 520, 521, 522, 523, 524, 525, 526, 527];

export function MoEView() {
  const { config, loops } = useMythosConfig();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  const [selectedToken, setSelectedToken] = React.useState(1);
  const [rawLoopIndex, setRawLoopIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"select" | "scrub">("select");

  // Clamp during render so a variant change (different loop count) can never
  // leave the index out of range — no effect / cascading render needed.
  const loopIndex = Math.min(rawLoopIndex, Math.max(0, loops - 1));

  const visibleCount = visibleExpertCount(config.n_experts);
  const topk = Math.min(config.n_experts_per_tok, visibleCount);
  const fraction = routedActivationFraction(config);

  const routing = React.useMemo(
    () =>
      computeRouting({
        tokenIndex: selectedToken,
        loopIndex,
        nExperts: visibleCount,
        topk,
        biasOn: true,
      }),
    [selectedToken, loopIndex, visibleCount, topk],
  );

  const activeToken = EXAMPLE_TOKENS[selectedToken];
  const activeLines = phase === "scrub" ? DISPATCH_LINES : ROUTER_LINES;

  function onSelectToken(i: number) {
    setSelectedToken(i);
    setPhase("select");
  }
  function onLoopChange(t: number) {
    setRawLoopIndex(t);
    setPhase("scrub");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-6">
        {/* Token row + selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pick a token to route
              <Badge variant="secondary" className="font-mono text-[10px]">
                simulated routing
              </Badge>
            </CardTitle>
            <CardDescription>
              Each token is routed independently. Select one to trace its path
              through the router and into the experts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenRow
              tokens={EXAMPLE_TOKENS}
              selected={selectedToken}
              onSelect={onSelectToken}
              reduced={reduced}
            />
            <p className="mt-3 text-sm">
              Routing token{" "}
              <span className="rounded bg-[color-mix(in_oklab,var(--stage-recurrent)_18%,transparent)] px-1.5 py-0.5 font-mono text-foreground">
                {activeToken.text}
              </span>{" "}
              <span className="text-muted-foreground">
                → top-{topk} of {config.n_experts} routed experts +{" "}
                {config.n_shared_experts} shared, at loop depth t = {loopIndex}.
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Expert grid + shared lane + per-loop scrubber (centerpiece) */}
        <Card>
          <CardHeader>
            <CardTitle>Expert grid &amp; shared lane</CardTitle>
            <CardDescription>
              The recurrent block&apos;s FFN: {config.n_experts} fine-grained
              routed experts (amber) and {config.n_shared_experts} always-on
              shared experts (violet). Scrub the loop depth to re-route the same
              token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpertGrid
              nExperts={config.n_experts}
              visibleCount={visibleCount}
              topkIdx={routing.topkIdx}
              topkWeights={routing.topkWeights}
              sharedCount={config.n_shared_experts}
              expertDim={config.expert_dim}
              topk={config.n_experts_per_tok}
              loopIndex={loopIndex}
              loops={loops}
              onLoopChange={onLoopChange}
              tokenLabel={activeToken.text}
              reduced={reduced}
            />
          </CardContent>
        </Card>

        {/* Router scores + renormalized weights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Router scores &amp; combine weights
              <Badge variant="secondary" className="font-mono text-[10px]">
                simulated
              </Badge>
            </CardTitle>
            <CardDescription>
              How the gating distribution becomes the weights that mix the
              selected experts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RouterScores
              scores={routing.scores}
              topkIdx={routing.topkIdx}
              topkScores={routing.topkScores}
              topkWeights={routing.topkWeights}
              reduced={reduced}
            />
          </CardContent>
        </Card>

        {/* Load balancing demo */}
        <Card>
          <CardHeader>
            <CardTitle>Aux-loss-free load balancing</CardTitle>
            <CardDescription>
              A per-expert <code className="font-mono">router_bias</code> keeps
              expert load even without an auxiliary loss.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadBalance
              nExperts={visibleCount}
              topk={topk}
              loopIndex={loopIndex}
              reduced={reduced}
            />
          </CardContent>
        </Card>

        {/* Shared experts callout */}
        <Card>
          <CardHeader>
            <CardTitle>The always-on shared lane</CardTitle>
          </CardHeader>
          <CardContent>
            <SharedCallout
              sharedCount={config.n_shared_experts}
              expertDim={config.expert_dim}
              topk={config.n_experts_per_tok}
              reduced={reduced}
            />
          </CardContent>
        </Card>

        {/* Activation summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sparse activation
              <Badge variant="secondary" className="font-mono text-[10px]">
                real
              </Badge>
            </CardTitle>
            <CardDescription>
              Large total capacity, small per-token compute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivationSummary
              topk={config.n_experts_per_tok}
              nExperts={config.n_experts}
              fraction={fraction}
              sharedCount={config.n_shared_experts}
            />
          </CardContent>
        </Card>

        {/* Code reference */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Implementation
          </h2>
          <CodeRefPanel refKey="moeFfn" activeLines={activeLines} />
          <p className="px-1 text-[11px] text-muted-foreground">
            Highlighting the{" "}
            {phase === "scrub" ? "expert dispatch loop" : "router → softmax → top-k → renorm"}{" "}
            region.
          </p>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <ConfigPanel fields={["variant"]} />
        <div className="flex gap-2.5 rounded-xl border border-border bg-card/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <p>
            MoE runs <span className="text-foreground">only inside the
            recurrent block</span>. The prelude and coda use a plain{" "}
            <span className="text-foreground">dense FFN</span> — in the pipeline
            view those stages would be greyed out here. Expert counts depend on
            the variant.
          </p>
        </div>
      </aside>
    </div>
  );
}
