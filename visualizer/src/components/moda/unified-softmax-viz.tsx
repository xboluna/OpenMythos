"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sigma } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Formula, FormulaBlock } from "@/components/shared/formula-block";
import { MODA_CONFIG, seededLogits, softmax } from "./constants";

const MAX_SEQ = 7;
const MAX_DEPTH = 6;
const SCALE = MODA_CONFIG.headDim ** -0.5; // illustrative attention scale

export function UnifiedSoftmaxViz() {
  const reduced = useReducedMotion() ?? false;
  const [seqLen, setSeqLen] = React.useState(5); // causal keys (p+1)
  const [depthLen, setDepthLen] = React.useState(4); // depth keys (L)
  const [unified, setUnified] = React.useState(true);

  const { seqProbs, depthProbs, seqMass, depthMass } = React.useMemo(() => {
    // Seeded illustrative affinity logits, scaled like 1/sqrt(d).
    const rawSeq = seededLogits(101, seqLen).map((l) => l + 0.6); // mild causal recency bias
    const rawDepth = seededLogits(202, depthLen);
    const scaledSeq = rawSeq.map((l) => l / (SCALE * 40) + l); // keep visible spread
    const scaledDepth = rawDepth.map((l) => l / (SCALE * 40) + l);

    if (unified) {
      const all = softmax([...scaledSeq, ...scaledDepth]);
      const sp = all.slice(0, seqLen);
      const dp = all.slice(seqLen);
      return {
        seqProbs: sp,
        depthProbs: dp,
        seqMass: sp.reduce((a, b) => a + b, 0),
        depthMass: dp.reduce((a, b) => a + b, 0),
      };
    }
    // Sequence-only: depth keys are dropped, softmax over sequence alone.
    const sp = softmax(scaledSeq);
    return {
      seqProbs: sp,
      depthProbs: depthLen ? new Array(depthLen).fill(0) : [],
      seqMass: 1,
      depthMass: 0,
    };
  }, [seqLen, depthLen, unified]);

  const maxProb = Math.max(0.0001, ...seqProbs, ...depthProbs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Sigma className="size-4 text-teal-400" aria-hidden />
          Unified attention softmax
          <Badge variant="secondary" className="font-mono text-[10px]">
            illustrative
          </Badge>
        </CardTitle>
        <CardDescription>
          MoDA concatenates the causal{" "}
          <span style={{ color: "#cbd5e1" }}>sequence logits</span> and the{" "}
          <span className="text-teal-300">depth logits</span> and normalises
          them with <span className="text-foreground">one</span> softmax — a
          single distribution over both key sets. Toggle to compare with a
          plain sequence-only softmax.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormulaBlock
          math={"\\alpha = \\mathrm{softmax}\\big([\\,Q K_{\\text{seq}}^{\\top} \\;\\Vert\\; Q K_{\\text{depth}}^{\\top}\\,]\\, / \\sqrt{d}\\big)"}
          caption="One softmax over sequence keys (causal) concatenated with depth keys."
        />

        {/* Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-foreground">
                Sequence keys (causal)
              </label>
              <span className="font-mono text-muted-foreground">{seqLen}</span>
            </div>
            <Slider
              value={[seqLen]}
              min={1}
              max={MAX_SEQ}
              step={1}
              onValueChange={(v) => setSeqLen(Array.isArray(v) ? v[0] : v)}
              aria-label="Number of sequence keys"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-foreground">
                Depth keys (layers 0…L-1)
              </label>
              <span className="font-mono text-muted-foreground">
                {depthLen}
              </span>
            </div>
            <Slider
              value={[depthLen]}
              min={0}
              max={MAX_DEPTH}
              step={1}
              onValueChange={(v) => setDepthLen(Array.isArray(v) ? v[0] : v)}
              aria-label="Number of depth keys"
            />
          </div>
        </div>

        <label className="flex w-fit items-center gap-2.5 text-sm">
          <Switch
            checked={unified}
            onCheckedChange={(c) => setUnified(c)}
            aria-label="Toggle unified softmax"
          />
          <span className="font-medium text-foreground">
            {unified ? "Unified (sequence + depth)" : "Sequence-only softmax"}
          </span>
        </label>

        {/* Bar strip */}
        <div>
          <div className="flex items-end gap-1 rounded-lg border border-border bg-muted/20 p-3">
            {seqProbs.map((p, i) => (
              <Bar
                key={`s${i}`}
                prob={p}
                maxProb={maxProb}
                label={`s${i}`}
                tone="seq"
                reduced={reduced}
              />
            ))}
            {/* divider between the two key sets */}
            {depthProbs.length > 0 ? (
              <div
                className="mx-1 self-stretch border-l border-dashed border-teal-400/50"
                aria-hidden
              />
            ) : null}
            {depthProbs.map((p, i) => (
              <Bar
                key={`d${i}`}
                prob={p}
                maxProb={maxProb}
                label={`d${i}`}
                tone="depth"
                dimmed={!unified}
                reduced={reduced}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span style={{ color: "#cbd5e1" }}>
              ← sequence region (causal)
            </span>
            <span className="text-teal-300">depth region →</span>
          </div>
        </div>

        {/* Mass readout */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <Readout label="Σ sequence" value={seqMass} tone="seq" />
          <Readout label="Σ depth" value={depthMass} tone="depth" />
          <Readout label="Σ total" value={seqMass + depthMass} tone="total" />
        </div>
        <p className="text-[11px] text-muted-foreground">
          The whole strip sums to <Formula math={"1"} />. In sequence-only mode
          the depth keys contribute nothing, so all probability mass is forced
          back onto the sequence — MoDA instead lets depth keys{" "}
          <span className="text-teal-300">compete directly</span> with the
          sequence under the shared normaliser. Scores are seeded for
          illustration.
        </p>
      </CardContent>
    </Card>
  );
}

function Bar({
  prob,
  maxProb,
  label,
  tone,
  dimmed,
  reduced,
}: {
  prob: number;
  maxProb: number;
  label: string;
  tone: "seq" | "depth";
  dimmed?: boolean;
  reduced: boolean;
}) {
  const heightPct = Math.max(2, (prob / maxProb) * 100);
  const color = tone === "seq" ? "#94a3b8" : "#2dd4bf";
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <span className="font-mono text-[9px] text-muted-foreground">
        {(prob * 100).toFixed(0)}%
      </span>
      <div className="flex h-28 w-full items-end">
        <motion.div
          className="w-full rounded-t"
          style={{
            backgroundColor: color,
            opacity: dimmed ? 0.2 : 0.85,
          }}
          initial={reduced ? false : { height: 0 }}
          animate={{ height: `${heightPct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.4 }}
        />
      </div>
      <span className="font-mono text-[9px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "seq" | "depth" | "total";
}) {
  const color =
    tone === "seq"
      ? "#cbd5e1"
      : tone === "depth"
        ? "#2dd4bf"
        : "var(--foreground)";
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-2 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm" style={{ color }}>
        {value.toFixed(2)}
      </div>
    </div>
  );
}
