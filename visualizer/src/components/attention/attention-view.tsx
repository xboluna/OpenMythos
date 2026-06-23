"use client";

import { useReducedMotion } from "motion/react";
import type { AttnType } from "@/lib/config";
import { useMythosConfig } from "@/lib/use-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigPanel } from "@/components/shared/config-panel";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { MethodToggle } from "./method-toggle";
import { CacheComparison } from "./cache-comparison";
import { CacheAnatomy } from "./cache-anatomy";
import { MlaDetail } from "./mla-detail";
import { RopeAnimation } from "./rope-animation";
import { METHOD_LABEL } from "./lib";

export function AttentionView() {
  const { config, attn, setAttn } = useMythosConfig();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose the attention method</CardTitle>
              <CardDescription>
                The page emphasizes the selected method; the comparison stays
                visible either way.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MethodToggle value={attn} onChange={(a) => setAttn(a)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                KV-cache size — the headline tradeoff
                <Badge variant="secondary" className="font-mono text-[10px]">
                  real
                </Badge>
              </CardTitle>
              <CardDescription>
                Per-token cache (in cached scalars) for standard multi-head
                attention vs GQA vs {METHOD_LABEL[attn]}, scaled by context
                length.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CacheComparison config={config} attn={attn} reduced={reduced} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <ConfigPanel fields={["variant", "attn"]} />
          <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
            Change the variant to see every dimension on this page update live.
            At frontier scale MLA caches roughly 10–20× less than standard
            attention.
          </p>
        </aside>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Per-method cache anatomy — one decode step
            <Badge variant="secondary" className="font-mono text-[10px]">
              illustrative tokens
            </Badge>
          </CardTitle>
          <CardDescription>
            What each method stores in the cache vs what it recomputes when a new
            token arrives. Dimensions are the real config values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CacheAnatomy config={config} reduced={reduced} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Inside MLA — low-rank Q and compressed KV
            {attn === "mla" ? (
              <Badge variant="secondary" className="text-[10px]">
                selected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                reference
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            How MLA factors the projections so that only a small latent needs to
            be cached.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MlaDetail config={config} active={attn === "mla"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            RoPE — position as rotation
            <Badge variant="secondary" className="font-mono text-[10px]">
              illustrative
            </Badge>
          </CardTitle>
          <CardDescription>
            RoPE rotates Q and K by an angle proportional to position before they
            enter attention (and the cache).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RopeAnimation reduced={reduced} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Implementation
        </h2>
        <Tabs value={attn} onValueChange={(v) => setAttn(v as AttnType)}>
          <TabsList>
            <TabsTrigger value="mla">MLAttention</TabsTrigger>
            <TabsTrigger value="gqa">GQAttention</TabsTrigger>
          </TabsList>
          <TabsContent value="mla">
            <CodeRefPanel refKey="mlaAttention" />
          </TabsContent>
          <TabsContent value="gqa">
            <CodeRefPanel refKey="gqaAttention" />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
