import Link from "next/link";
import { ArrowUpRight, ExternalLink, FileText, GitFork, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { codeRefs, githubUrl, refHeader } from "@/lib/code-refs";
import { cn } from "@/lib/utils";
import { CopyBibtex } from "@/components/references/copy-bibtex";
import {
  arxivId,
  bibtex,
  paperGroups,
  refToRoute,
  repoUrl,
  threads,
} from "@/components/references/data";

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function ReferencesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="References"
        subtitle="Papers, threads, and citations behind OpenMythos."
      />

      <div className="space-y-12">
        {/* 1. Disclaimer */}
        <Card className="border-l-2 border-l-stage-recurrent bg-card/60">
          <CardContent className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-stage-recurrent" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                OpenMythos is an independent, community-driven theoretical
                reconstruction
              </span>{" "}
              based on publicly available research and informed speculation. It
              is not affiliated with, endorsed by, or connected to Anthropic.
            </p>
          </CardContent>
        </Card>

        {/* 2. Papers */}
        <section className="space-y-6">
          <SectionHeading
            id="papers"
            title="Papers"
            description="The research the architecture draws on, grouped by theme."
          />
          <div className="space-y-8">
            {paperGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {group.heading}
                  </h3>
                  <p className="text-xs text-muted-foreground">{group.blurb}</p>
                </div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.papers.map((paper) => {
                    const id = arxivId(paper.url);
                    return (
                      <li key={paper.url}>
                        <Card
                          size="sm"
                          className="h-full transition-colors hover:ring-foreground/25"
                        >
                          <CardContent className="flex h-full flex-col gap-3">
                            <div className="flex items-start gap-2">
                              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <p className="text-sm leading-snug font-medium text-foreground">
                                {paper.title}
                              </p>
                            </div>
                            <div className="mt-auto flex items-center justify-between gap-2">
                              {id ? (
                                <Badge
                                  variant="outline"
                                  className="font-mono text-[11px]"
                                >
                                  arXiv:{id}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px]"
                                >
                                  Web
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="xs"
                                render={
                                  <a
                                    href={paper.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open "${paper.title}" in a new tab`}
                                  />
                                }
                              >
                                Open
                                <ExternalLink className="size-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* 3. Threads / discussion */}
        <section className="space-y-6">
          <SectionHeading
            id="threads"
            title="Threads & discussion"
            description="Community analysis and debate on X about looped transformers."
          />
          <ul className="divide-y divide-border rounded-xl ring-1 ring-foreground/10">
            {threads.map((thread) => (
              <li key={thread.url}>
                <a
                  href={thread.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {thread.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {thread.author}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        {/* 4. Source map */}
        <section className="space-y-6">
          <SectionHeading
            id="source-map"
            title="Source map"
            description="Every architectural concept on this site maps to a real span of the OpenMythos implementation."
          />
          <ul className="space-y-2">
            {Object.values(codeRefs).map((ref) => {
              const route = refToRoute[ref.key];
              return (
                <li
                  key={ref.key}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {ref.label}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {refHeader(ref)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {route ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        render={
                          <Link
                            href={route}
                            aria-label={`Explore ${ref.symbol} on this site`}
                          />
                        }
                      >
                        Explore
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="xs"
                      render={
                        <a
                          href={githubUrl(ref)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${ref.symbol} in the repository on GitHub`}
                        />
                      }
                    >
                      Open in repo
                      <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <Separator />

        {/* 5. Citation */}
        <section className="space-y-6">
          <SectionHeading
            id="citation"
            title="Citation"
            description="If you reference OpenMythos, please cite it as follows."
          />
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="font-mono text-sm">BibTeX</CardTitle>
              <CopyBibtex bibtex={bibtex} />
            </CardHeader>
            <CardContent>
              <pre
                className={cn(
                  "overflow-x-auto rounded-lg bg-muted/40 p-4",
                  "font-mono text-xs leading-relaxed text-foreground",
                )}
              >
                <code>{bibtex}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* 6. Repository */}
        <section className="space-y-6">
          <SectionHeading
            id="repository"
            title="Repository"
            description="The full OpenMythos implementation is open source."
          />
          <Card>
            <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <GitFork className="size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    xboluna/OpenMythos
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {repoUrl}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View the OpenMythos repository on GitHub"
                  />
                }
              >
                <GitFork className="size-4" />
                View on GitHub
                <ExternalLink className="size-3" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
