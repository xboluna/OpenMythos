"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronDown, MousePointerClick, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type Stage, stageVar } from "./stages";

type PipelineFlowProps = {
  stages: Stage[];
  step: number;
  loopIter: number;
  loopShown: number;
  hovered: string | null;
  onHover: (id: string | null) => void;
  recurrentHref: string;
  reduced: boolean;
};

/**
 * The OpenMythos forward pass as an animated vertical flow. A "token packet"
 * (shared-layout dot) travels block to block; the recurrent core visibly loops
 * before continuing. Hovering a block syncs the source panel and shows details.
 */
export function PipelineFlow({
  stages,
  step,
  loopIter,
  loopShown,
  hovered,
  onHover,
  recurrentHref,
  reduced,
}: PipelineFlowProps) {
  return (
    <div className="flex flex-col items-stretch">
      <EndpointNode label="Token IDs" shape="(B, T)" />
      {stages.map((stage, i) => (
        <React.Fragment key={stage.id}>
          <Connector active={step >= i} />
          <StageBlock
            stage={stage}
            active={step === i}
            hovered={hovered === stage.id}
            loopIter={loopIter}
            loopShown={loopShown}
            onHover={onHover}
            recurrentHref={recurrentHref}
            reduced={reduced}
          />
        </React.Fragment>
      ))}
      <Connector active={step >= stages.length} />
      <EndpointNode label="Logits" shape="(B, T, vocab_size)" emphasis />
    </div>
  );
}

function EndpointNode({
  label,
  shape,
  emphasis,
}: {
  label: string;
  shape: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-fit rounded-full border border-border bg-muted/60 px-4 py-1.5 text-center",
        emphasis && "bg-muted",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-2 font-mono text-xs text-muted-foreground">
        {shape}
      </span>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto flex h-7 w-px items-center justify-center">
      <div className="absolute inset-0 w-px bg-border" />
      <motion.div
        className="absolute inset-x-0 top-0 w-px origin-top bg-foreground/40"
        initial={false}
        animate={{ scaleY: active ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <ChevronDown className="relative size-3 text-muted-foreground" />
    </div>
  );
}

function StageBlock({
  stage,
  active,
  hovered,
  loopIter,
  loopShown,
  onHover,
  recurrentHref,
  reduced,
}: {
  stage: Stage;
  active: boolean;
  hovered: boolean;
  loopIter: number;
  loopShown: number;
  onHover: (id: string | null) => void;
  recurrentHref: string;
  reduced: boolean;
}) {
  const color = stageVar(stage.kind);
  const isRecurrent = stage.id === "recurrent";

  const handlers = {
    onMouseEnter: () => onHover(stage.id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(stage.id),
    onBlur: () => onHover(null),
  };

  const className = cn(
    "relative block w-full rounded-xl border bg-card/70 p-4 text-left outline-none transition-all",
    "focus-visible:ring-3 focus-visible:ring-ring/50",
    stage.branch && "border-dashed",
    (active || hovered) && "bg-card",
    stage.clickable && "cursor-pointer hover:-translate-y-0.5",
  );

  const style: React.CSSProperties = {
    borderColor: color,
    boxShadow: active
      ? `0 0 0 1px ${color}, 0 0 28px -6px ${color}`
      : hovered
        ? `0 0 0 1px ${color}`
        : undefined,
  };

  const inner = (
    <>
      {/* Travelling token packet (shared layout id animates between blocks). */}
      {active ? (
        <motion.span
          layoutId="token-packet"
          className="absolute -left-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          {!reduced ? (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          ) : null}
        </motion.span>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-sm font-semibold">{stage.title}</h3>
            {stage.branch ? (
              <span className="rounded border border-dashed border-current px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                branch
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{stage.blurb}</p>
        </div>
        {stage.badge ? (
          <span
            className="shrink-0 rounded-md px-2 py-0.5 font-mono text-xs"
            style={{
              color,
              backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
            }}
          >
            {stage.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">
          {stage.shape}
        </span>
        {stage.clickable ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-recurrent">
            <MousePointerClick className="size-3" />
            open loop
          </span>
        ) : null}
      </div>

      {isRecurrent ? (
        <RecurrentDecor
          active={active}
          loopIter={loopIter}
          loopShown={loopShown}
          reduced={reduced}
          color={color}
        />
      ) : null}
    </>
  );

  const element = stage.clickable ? (
    <Link
      href={recurrentHref}
      role="button"
      aria-label="Open the recurrent loop page (keeps current configuration)"
      className={className}
      style={style}
      {...handlers}
    >
      {inner}
    </Link>
  ) : (
    <div
      tabIndex={0}
      className={className}
      style={style}
      aria-label={stage.title}
      {...handlers}
    >
      {inner}
    </div>
  );

  return (
    <div className={cn("relative", stage.branch && "md:pl-10")}>
      {stage.branch ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-10 -translate-y-1/2 md:block"
          style={{
            background: `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 8px)`,
          }}
        />
      ) : null}
      <Tooltip>
        <TooltipTrigger render={element} />
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{stage.title}</p>
            {stage.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4">
                <span className="text-background/70">{d.label}</span>
                <span className="font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function RecurrentDecor({
  active,
  loopIter,
  loopShown,
  reduced,
  color,
}: {
  active: boolean;
  loopIter: number;
  loopShown: number;
  reduced: boolean;
  color: string;
}) {
  return (
    <>
      {/* Loop-back arrow on the right edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-7 top-0 bottom-0 hidden w-7 items-center sm:flex"
      >
        <svg viewBox="0 0 28 80" className="h-full w-full overflow-visible">
          <path
            d="M2 8 H18 Q26 8 26 16 V64 Q26 72 18 72 H2"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.8}
          />
          <path
            d="M2 72 l5 -4 M2 72 l5 4"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        </svg>
      </span>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-recurrent/50 bg-recurrent/5 px-2 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-recurrent">
          <RefreshCw
            className={cn(
              "size-3",
              active && !reduced && "motion-safe:animate-spin",
            )}
          />
          + frozen e injected each loop
        </span>
        <span className="font-mono text-[11px] text-recurrent">
          {active ? `loop ${loopIter + 1}/${loopShown}` : `${loopShown}+ loops`}
        </span>
      </div>

      {active && !reduced ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ boxShadow: `0 0 0 2px ${color}` }}
          animate={{ opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      ) : null}
    </>
  );
}
