import Link from "next/link";
import {
  ArrowRight,
  Repeat,
  Layers,
  Network,
  Activity,
  Gauge,
  TrendingUp,
  Boxes,
  FlaskConical,
  BookText,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/architecture": Layers,
  "/recurrent-loop": Repeat,
  "/attention": Network,
  "/moe": Boxes,
  "/stability": Gauge,
  "/depth-extrapolation": TrendingUp,
  "/variants": Activity,
  "/moda": FlaskConical,
  "/references": BookText,
};

const coreIdeas = [
  {
    title: "Looped recurrence",
    body: "One transformer block run many times — depth comes from loops, not from more parameters.",
  },
  {
    title: "Input injection",
    body: "The encoded input e is re-injected every loop, keeping the original signal alive at any depth.",
  },
  {
    title: "Adaptive compute",
    body: "ACT halting lets easy tokens stop early while hard tokens keep reasoning — in the same batch.",
  },
  {
    title: "Stable by construction",
    body: "An LTI-constrained update guarantees the spectral radius ρ(A) < 1, so training never explodes.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            OpenMythos
          </h1>
          <Badge variant="secondary" className="font-mono">
            Visualizer
          </Badge>
        </div>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          An interactive guide to the{" "}
          <span className="text-foreground">Recurrent-Depth Transformer</span>{" "}
          — a theoretical reconstruction of the hypothesized Claude Mythos
          architecture.{" "}
          <span className="font-medium text-foreground">
            Same weights, more loops &rarr; deeper reasoning.
          </span>
        </p>

        <HeroPipeline />

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="font-mono text-sm text-foreground">
            h<sub>t+1</sub> = A&middot;h<sub>t</sub> + B&middot;e +
            Transformer(h<sub>t</sub>, e)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The recurrent update rule, applied once per loop. Everything on this
            site is computed client-side from the model&rsquo;s formulas.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/architecture" />}>
            Explore the architecture
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            render={<Link href="/recurrent-loop" />}
          >
            See the recurrent loop
          </Button>
        </div>
      </section>

      {/* Core ideas */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Why it is not a vanilla transformer
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreIdeas.map((idea) => (
            <Card key={idea.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{idea.title}</CardTitle>
                <CardDescription>{idea.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore grid */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explore
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => {
            const Icon = routeIcons[route.href] ?? ArrowRight;
            return (
              <Link key={route.href} href={route.href} className="group">
                <Card className="h-full transition-all hover:ring-2 hover:ring-foreground/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-base">
                      <span className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        {route.label}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardTitle>
                    <CardDescription>{route.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Static three-stage pipeline diagram for the hero (server-rendered). */
function HeroPipeline() {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Stage label="Embedding" sub="vocab → dim" tone="neutral" />
        <Connector />
        <Stage
          label="Prelude"
          sub="dense blocks · ×N"
          tone="prelude"
        />
        <Connector />
        <Stage
          label="Recurrent"
          sub="MoE block · looped ×T"
          tone="recurrent"
          loop
        />
        <Connector />
        <Stage label="Coda" sub="dense blocks · ×M" tone="coda" />
        <Connector />
        <Stage label="LM Head" sub="→ logits" tone="neutral" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <span className="text-prelude">Prelude</span> runs once,{" "}
        <span className="text-recurrent">Recurrent</span> loops with shared
        weights, <span className="text-coda">Coda</span> runs once. The
        recurrent block is the unique core.
      </p>
    </div>
  );
}

function Stage({
  label,
  sub,
  tone,
  loop = false,
}: {
  label: string;
  sub: string;
  tone: "neutral" | "prelude" | "recurrent" | "coda";
  loop?: boolean;
}) {
  const toneClass =
    tone === "prelude"
      ? "border-prelude/50 text-prelude"
      : tone === "recurrent"
        ? "border-recurrent/60 text-recurrent"
        : tone === "coda"
          ? "border-coda/50 text-coda"
          : "border-border text-muted-foreground";
  return (
    <div
      className={`relative flex-1 rounded-lg border bg-background/60 px-3 py-2 text-center ${toneClass}`}
    >
      {loop ? (
        <Repeat className="absolute right-2 top-2 size-3.5 opacity-80" />
      ) : null}
      <div className="text-sm font-medium">{label}</div>
      <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-muted-foreground">
      <ArrowRight className="hidden size-4 sm:block" />
      <span className="text-xs sm:hidden">↓</span>
    </div>
  );
}
