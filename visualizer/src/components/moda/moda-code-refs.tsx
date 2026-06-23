"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";

/**
 * Authoritative MoDA source snippets, grounded in `open_mythos/moda.py`.
 * `modaAttention` → MoDAAttention (unified depth/sequence attention);
 * `modaMoE` → DeepSeekMoE (shared + routed experts, balance loss).
 */
export function ModaCodeRefs() {
  return (
    <Tabs defaultValue="attention" className="w-full">
      <TabsList>
        <TabsTrigger value="attention">MoDAAttention</TabsTrigger>
        <TabsTrigger value="moe">DeepSeekMoE</TabsTrigger>
      </TabsList>
      <TabsContent value="attention" className="mt-3">
        <CodeRefPanel refKey="modaAttention" />
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          The unified softmax lives in the{" "}
          <code className="font-mono">L &gt; 0</code> branch: sequence and depth
          logits are concatenated, then a single{" "}
          <code className="font-mono">F.softmax</code> normalises both.
        </p>
      </TabsContent>
      <TabsContent value="moe" className="mt-3">
        <CodeRefPanel refKey="modaMoE" />
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          Shared experts run on every token; the gate dispatches the routed
          top-K, and <code className="font-mono">_balance_loss</code> implements
          the expert-level load-balancing penalty.
        </p>
      </TabsContent>
    </Tabs>
  );
}
