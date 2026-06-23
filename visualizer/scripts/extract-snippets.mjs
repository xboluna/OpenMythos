/**
 * Dev-time tool: slice the real OpenMythos Python source into static snippet
 * data the website can import without any build-time dependency on the parent
 * Python package.
 *
 * Reads line ranges from src/lib/code-refs.json, pulls the corresponding lines
 * out of the Python files at the repo root, and writes the result to
 * src/generated/code-snippets.json (committed to the repo).
 *
 * Run after changing code-refs.json or when Python line numbers shift:
 *     npm run extract-snippets
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));
const visualizerRoot = resolve(__dirname, "..");
const repoRoot = resolve(visualizerRoot, "..");

const manifestPath = join(visualizerRoot, "src", "lib", "code-refs.json");
const outDir = join(visualizerRoot, "src", "generated");
const outPath = join(outDir, "code-snippets.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function languageFor(file) {
  if (file.endsWith(".py")) return "python";
  if (file.endsWith(".ts") || file.endsWith(".tsx")) return "typescript";
  return "text";
}

const fileCache = new Map();
function readRepoFile(relPath) {
  if (!fileCache.has(relPath)) {
    fileCache.set(relPath, readFileSync(join(repoRoot, relPath), "utf8"));
  }
  return fileCache.get(relPath);
}

const highlighter = await createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["python", "typescript"],
});

const out = {};
for (const ref of manifest.refs) {
  const content = readRepoFile(ref.file);
  const lines = content.split("\n");
  // startLine/endLine are 1-indexed and inclusive.
  const slice = lines.slice(ref.startLine - 1, ref.endLine).join("\n");
  const lang = languageFor(ref.file);

  // Pre-highlight with Shiki (dual theme via CSS vars). Each rendered line gets
  // an absolute `data-line` attribute so the UI can sync step highlights to
  // real source lines without any runtime highlighting.
  const html = highlighter.codeToHtml(slice, {
    lang: lang === "text" ? "txt" : lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      {
        line(node, line) {
          node.properties["data-line"] = String(ref.startLine + line - 1);
        },
      },
    ],
  });

  out[ref.key] = {
    key: ref.key,
    file: ref.file,
    startLine: ref.startLine,
    endLine: ref.endLine,
    language: lang,
    code: slice,
    html,
  };
  console.log(
    `  ${ref.key.padEnd(18)} ${ref.file} L${ref.startLine}-${ref.endLine} (${
      slice.split("\n").length
    } lines)`,
  );
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\nWrote ${Object.keys(out).length} snippets → ${outPath}`);
