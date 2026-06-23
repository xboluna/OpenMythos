"use client";

import * as React from "react";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SNIPPET = `A = model.recurrent.injection.get_A()
rho = torch.linalg.eigvals(torch.diag(A)).abs().max()  # < 1`;

/**
 * A small "verify it yourself" card (PLAN §4.3): a copyable Python one-liner the
 * reader can run against a real init to confirm the gauge value. The UI number
 * is computed in TypeScript from the same formula as `LTIInjection.get_A()`.
 */
export function VerifyNote() {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TerminalSquare className="size-4" />
        Confirm the gauge matches a real init:
      </div>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 pr-12 font-mono text-xs leading-relaxed">
          <code>{SNIPPET}</code>
        </pre>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy Python snippet"}
          className="absolute top-2 right-2"
        >
          {copied ? (
            <Check className={cn("size-4 text-[#22c55e]")} />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The value shown on this page is computed in TypeScript from the same
        formula as <span className="font-mono">LTIInjection.get_A()</span> — it
        is not measured from a trained checkpoint, but it will match one exactly
        because the constraint is structural.
      </p>
    </div>
  );
}
