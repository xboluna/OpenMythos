"use client";

import * as React from "react";
import { ChevronDown, Code2, ExternalLink } from "lucide-react";
import {
  getRef,
  getSnippet,
  githubUrl,
  refHeader,
  type CodeRefKey,
} from "@/lib/code-refs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Renders the real implementation snippet for a topic key (PLAN §3.10).
 *
 * - Collapsible (default open on desktop, collapsed on mobile via `defaultOpen`)
 * - Header shows file · line range · symbol, with an "Open in repo" link
 * - `activeLines` (absolute source line numbers) are highlighted live so the
 *   panel can sync to interaction state (e.g. the recurrent-loop stepper)
 */
export function CodeRefPanel({
  refKey,
  activeLines,
  defaultOpen = true,
  className,
}: {
  refKey: CodeRefKey;
  activeLines?: number[];
  defaultOpen?: boolean;
  className?: string;
}) {
  const ref = getRef(refKey);
  const snippet = getSnippet(refKey);
  const [open, setOpen] = React.useState(defaultOpen);
  const codeRef = React.useRef<HTMLDivElement>(null);

  const activeKey = (activeLines ?? []).join(",");
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    const root = codeRef.current;
    if (!root) return;
    const set = new Set(activeLines ?? []);
    const lineEls = root.querySelectorAll<HTMLElement>(".line[data-line]");
    let firstActive: HTMLElement | null = null;
    lineEls.forEach((el) => {
      const n = Number(el.getAttribute("data-line"));
      const isActive = set.has(n);
      el.setAttribute("data-active", isActive ? "true" : "false");
      if (isActive && !firstActive) firstActive = el;
    });
    // Skip auto-scroll on the first run (page load / panel open) so arriving on
    // a page never nudges anything — only scroll once the user changes steps.
    const isFirstRun = !didMountRef.current;
    didMountRef.current = true;
    // Scroll the active line into view WITHIN the panel's own scroll container
    // only — never via scrollIntoView, which would scroll the whole window and
    // make the viewport jump as the user steps through.
    if (firstActive && open && !isFirstRun) {
      const el = firstActive as HTMLElement;
      const cRect = root.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const margin = 8;
      if (eRect.top < cRect.top + margin) {
        root.scrollBy({ top: eRect.top - cRect.top - margin, behavior: "smooth" });
      } else if (eRect.bottom > cRect.bottom - margin) {
        root.scrollBy({
          top: eRect.bottom - cRect.bottom + margin,
          behavior: "smooth",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, open]);

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card/50 text-card-foreground",
        className,
      )}
    >
      <header className="flex items-center gap-2 px-3 py-2">
        <Code2 className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-muted-foreground">
            {refHeader(ref)}
          </p>
          <p className="truncate text-sm">{ref.label}</p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] uppercase">
          {snippet?.language ?? "source"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open in repository on GitHub"
          title="Open in repo"
          render={
            <a
              href={githubUrl(ref)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLink className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Collapse source" : "Expand source"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      </header>

      {open ? (
        <div
          ref={codeRef}
          className="max-h-[28rem] overflow-auto border-t border-border bg-muted/30 px-2 py-2 text-xs leading-relaxed [&_pre]:!bg-transparent"
        >
          {snippet ? (
            <div dangerouslySetInnerHTML={{ __html: snippet.html }} />
          ) : (
            <p className="px-2 py-4 text-muted-foreground">
              Snippet unavailable — run{" "}
              <code className="font-mono">npm run extract-snippets</code>.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
