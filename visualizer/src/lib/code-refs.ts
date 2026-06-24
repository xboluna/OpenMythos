import manifest from "./code-refs.json";
import snippets from "@/generated/code-snippets.json";

export type CodeRefKey = (typeof manifest.refs)[number]["key"];

export type CodeRef = {
  key: CodeRefKey;
  file: string;
  startLine: number;
  endLine: number;
  symbol: string;
  label: string;
};

export type Snippet = {
  key: string;
  file: string;
  startLine: number;
  endLine: number;
  language: string;
  code: string;
  html: string;
};

export type RecurrentLoopStep = {
  id: string;
  title: string;
  lines: number[];
};

const GITHUB_REPO = "https://github.com/xboluna/OpenMythos";

export const codeRefs: Record<CodeRefKey, CodeRef> = Object.fromEntries(
  manifest.refs.map((ref) => [ref.key, ref as CodeRef]),
) as Record<CodeRefKey, CodeRef>;

/** Per-iteration sub-steps synced to RecurrentBlock.forward in main.py. */
export const recurrentLoopSteps: RecurrentLoopStep[] = [
  { id: "loop-embed", title: "Loop embed", lines: [858] },
  { id: "inject-e", title: "Inject e", lines: [859] },
  { id: "transformer", title: "Transformer", lines: [861] },
  { id: "lora", title: "LoRA", lines: [862] },
  { id: "lti", title: "LTI", lines: [863] },
  { id: "act-prob", title: "ACT p", lines: [865] },
  {
    id: "act-accumulate",
    title: "ACT acc",
    lines: [873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883],
  },
];

export function getRef(key: CodeRefKey): CodeRef {
  return codeRefs[key];
}

export function getSnippet(key: CodeRefKey): Snippet | undefined {
  return (snippets as Record<string, Snippet>)[key];
}

export function refHeader(ref: CodeRef): string {
  return `${ref.file} · L${ref.startLine}–${ref.endLine} · ${ref.symbol}`;
}

export function githubUrl(ref: CodeRef): string {
  return `${GITHUB_REPO}/blob/main/${ref.file}#L${ref.startLine}-L${ref.endLine}`;
}
