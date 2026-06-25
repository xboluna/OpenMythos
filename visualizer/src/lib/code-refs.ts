/**
 * Code-reference manifest (PLAN §3.10).
 *
 * Single source of truth mapping topic keys → a span of the real
 * implementation in this repo. Pages import refs by key (e.g.
 * `codeRefs.recurrentLoop`) and render them with <CodeRefPanel>.
 *
 * Line ranges live in `code-refs.json` so the same data can drive both this
 * module and `scripts/extract-snippets.mjs`, which slices the actual Python
 * source into `generated/code-snippets.json`. When `open_mythos/*.py` line
 * numbers shift, update `code-refs.json` and re-run `npm run extract-snippets`.
 */

import manifest from "./code-refs.json";
import snippets from "@/generated/code-snippets.json";

export type CodeRefKey =
  | "forward"
  | "recurrentLoop"
  | "ltiInjection"
  | "actHalting"
  | "loopEmbedding"
  | "loraAdapter"
  | "moeFfn"
  | "mlaAttention"
  | "gqaAttention"
  | "transformerBlock"
  | "expert"
  | "config"
  | "variants"
  | "modaAttention"
  | "modaMoE";

export type CodeRef = {
  key: CodeRefKey;
  file: string;
  startLine: number;
  endLine: number;
  symbol: string;
  label: string;
};

export type CodeSnippet = {
  key: string;
  file: string;
  startLine: number;
  endLine: number;
  language: string;
  /** Raw source text for the [startLine, endLine] span. */
  code: string;
  /** Pre-highlighted Shiki HTML (dual theme, per-line `data-line` attrs). */
  html: string;
};

const REPO = manifest.repo;
const BRANCH = manifest.branch;

const refList = manifest.refs as CodeRef[];

export const codeRefs: Record<CodeRefKey, CodeRef> = Object.fromEntries(
  refList.map((r) => [r.key, r]),
) as Record<CodeRefKey, CodeRef>;

const snippetMap = snippets as Record<string, CodeSnippet>;

export function getRef(key: CodeRefKey): CodeRef {
  return codeRefs[key];
}

export function getSnippet(key: CodeRefKey): CodeSnippet | undefined {
  return snippetMap[key];
}

/** GitHub "Open in repo" URL with the line range anchored. */
export function githubUrl(ref: CodeRef): string {
  return `https://github.com/${REPO}/blob/${BRANCH}/${ref.file}#L${ref.startLine}-L${ref.endLine}`;
}

/** Header label, e.g. "open_mythos/main.py · lines 825-891 · RecurrentBlock.forward". */
export function refHeader(ref: CodeRef): string {
  return `${ref.file} · lines ${ref.startLine}-${ref.endLine} · ${ref.symbol}`;
}

/**
 * Step → absolute source-line mapping for the /recurrent-loop stepper, so the
 * snippet underlines the line(s) matching the active loop sub-step. Lines are
 * absolute file line numbers; <CodeRefPanel> converts to snippet-relative.
 *
 * Mirrors the loop body in RecurrentBlock.forward (open_mythos/main.py):
 *   858  h_loop = loop_index_embedding(h, t, self.loop_dim)
 *   859  combined = self.norm(h_loop + e)
 *   861  trans_out = self.block(combined, ...)
 *   862  trans_out = trans_out + self.lora(trans_out, t)
 *   863  h = self.injection(h, e, trans_out)
 *   865  p = self.act(h)
 *   873-883  ACT remainder trick + weighted accumulation
 */
export const recurrentLoopSteps: {
  id: string;
  title: string;
  lines: number[];
}[] = [
  { id: "loop-embed", title: "Inject loop-index signal", lines: [858] },
  { id: "inject-e", title: "Add frozen encoded input e", lines: [859] },
  { id: "transformer", title: "Attention + MoE FFN", lines: [861] },
  { id: "lora", title: "Depth-wise LoRA delta", lines: [862] },
  { id: "lti", title: "Stable LTI state update", lines: [863] },
  { id: "act-prob", title: "Halting probability", lines: [865] },
  {
    id: "act-accumulate",
    title: "ACT-weighted accumulation",
    lines: [873, 874, 875, 876, 877, 878, 879, 880, 882, 883],
  },
];
