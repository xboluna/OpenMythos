# OpenMythos Visualizer

An interactive, instructional website that explains the **OpenMythos** Recurrent-Depth Transformer (RDT) architecture. Self-contained Next.js app, deployable to Vercel.

See [`PLAN.md`](PLAN.md) for the full design rationale.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build              # production build
npm run lint               # eslint
npm run extract-snippets   # regenerate embedded source snippets (see below)
```

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui primitives) — dark "museum exhibit" theme
- **motion** (Framer Motion) for animation, **Recharts** for charts, **KaTeX** for math
- **nuqs** for URL-synced, shareable configuration (`?variant=&loops=&attn=`)
- **Shiki** for build-time syntax highlighting of embedded source

## How it works

Every numeric visualization is computed **client-side from the model's own formulas** — TypeScript ports in `src/lib/` (`lti.ts`, `act.ts`, `loop-embedding.ts`, `variants.ts`, `config.ts`) mirror the real implementations in `open_mythos/`. Nothing is measured from a trained checkpoint; values are labeled as illustrative simulations where synthesized.

### Source integration

Each deep-dive page shows the **actual implementation** alongside the visualization, with synced line highlighting and a GitHub deep-link.

- `src/lib/code-refs.json` — the single source of truth mapping topic keys → `{ file, startLine, endLine, symbol, label }` in `open_mythos/*.py`.
- `scripts/extract-snippets.mjs` — slices those line ranges out of the Python source and Shiki-highlights them into `src/generated/code-snippets.json` (committed). This means the build has **no dependency on the Python package**.
- `src/components/shared/code-ref-panel.tsx` — renders a snippet with collapse, GitHub link, and step-synced highlighting.

When `open_mythos/*.py` changes and line numbers shift, update `src/lib/code-refs.json` and run `npm run extract-snippets`.

## Deploy on Vercel

Connect the repository and set the project **Root Directory** to `visualizer/`. The Next.js framework preset is auto-detected; no extra configuration is required. The app is fully static (no server runtime needed).
