"use client";

import * as React from "react";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { CodeRefKey } from "@/lib/code-refs";

const TABS: { value: CodeRefKey; label: string }[] = [
  { value: "loopEmbedding", label: "Loop embedding" },
  { value: "ltiInjection", label: "LTI injection" },
  { value: "loraAdapter", label: "LoRA adapter" },
  { value: "actHalting", label: "ACT halting" },
];

/** Quick access to the individual implementations referenced by this page. */
export function SourceRefs() {
  const [tab, setTab] = React.useState<string>(TABS[0].value);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
      <TabsList className="flex-wrap">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <CodeRefPanel refKey={t.value} defaultOpen />
        </TabsContent>
      ))}
    </Tabs>
  );
}
