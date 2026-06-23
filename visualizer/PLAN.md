# OpenMythos Visualizer — Project Plan

An interactive, instructional website that explains the **OpenMythos** Recurrent-Depth Transformer (RDT) architecture. Deployable to Vercel as a standalone Next.js app inside this monorepo.

---

## 1. What We Are Visualizing

OpenMythos is a theoretical reconstruction of the hypothesized **Claude Mythos** architecture. It is **not** a standard stacked transformer. The central idea: **same weights, more loops → deeper reasoning** — all inside a single forward pass, in continuous latent space (no intermediate token output).

### 1.1 End-to-End Data Flow

```
Token IDs (B, T)
      ↓
 [Embedding]                    vocab → dim
      ↓
 [Prelude]                      prelude_layers × TransformerBlock (dense FFN)
      ↓
 e = x  (frozen encoded input)
      ↓
 [Recurrent Block]              looped T times — THE unique core
      ↑___________↓
      ↓
 [Coda]                         coda_layers × TransformerBlock (dense FFN)
      ↓
 [RMSNorm → LM Head]            weight-tied with embedding
      ↓
 Logits (B, T, vocab_size)
```

**Source:** `open_mythos/main.py` — `OpenMythos.forward()`

### 1.2 Major Components (by uniqueness)

| # | Component | Module | Why it matters |
|---|-----------|--------|----------------|
| 1 | **Three-stage layout** | `OpenMythos` | Prelude (once) → Recurrent (looped) → Coda (once) |
| 2 | **Recurrent loop** | `RecurrentBlock` | One `TransformerBlock` + MoE, run `n_loops` times |
| 3 | **Input injection** | `LTIInjection` | `h_{t+1} = A·h_t + B·e + transformer_out` — keeps input alive |
| 4 | **LTI stability** | `LTIInjection.get_A()` | Spectral radius ρ(A) < 1 guaranteed by construction (Parcae) |
| 5 | **ACT halting** | `ACTHalting` | Per-position early exit; variable compute within a batch |
| 6 | **Loop-index embedding** | `loop_index_embedding()` | RoPE-like signal over loop depth, not sequence position |
| 7 | **Depth-wise LoRA** | `LoRAAdapter` | Per-iteration adaptation without full weight duplication |
| 8 | **MoE FFN** | `MoEFFN` | Routed + shared experts — **only** in the recurrent block |
| 9 | **Swappable attention** | `MLAttention` / `GQAttention` | MLA (compressed KV cache) vs GQA (fewer KV heads) |
| 10 | **Depth extrapolation** | `forward(n_loops=…)` | Train on N loops, infer on N+k for harder problems |
| 11 | **Model variants** | `variants.py` | Pre-configured scales from 1B → 1T parameters |
| 12 | **MoDA (experimental)** | `moda.py` | Alternative architecture: depth-aware attention + DeepSeek MoE |

### 1.3 Per-Loop Recurrent Pipeline (inner detail)

Each loop iteration `t` in `RecurrentBlock.forward()`:

```
1. h_loop = loop_index_embedding(h, t, loop_dim)     # depth positional signal
2. combined = RMSNorm(h_loop + e)                     # inject frozen prelude output
3. trans_out = TransformerBlock(combined)             # attn + MoE FFN
4. trans_out += LoRAAdapter(trans_out, t)             # depth-wise delta
5. h = LTIInjection(h, e, trans_out)                  # stable state update
6. p = ACTHalting(h)                                  # halting probability
7. h_out += weight(p) * h                             # ACT-weighted accumulation
```

Early exit when all positions exceed `act_threshold` (0.99 default).

### 1.4 Configuration Surface (`MythosConfig`)

Key knobs the visualizer should expose:

- **Core:** `dim`, `n_heads`, `max_loop_iters`, `prelude_layers`, `coda_layers`
- **Attention:** `attn_type` (`"mla"` | `"gqa"`), MLA-specific ranks/dims
- **MoE:** `n_experts`, `n_shared_experts`, `n_experts_per_tok`, `expert_dim`
- **Stability:** `act_threshold`, `lora_rank`, `rope_theta`

Pre-built variants (`mythos_1b` … `mythos_1t`) map these to realistic scale targets.

---

## 2. Site Structure & Navigation

```
/                           Landing — hero + architecture overview animation
/architecture               Full pipeline explorer (Prelude → Recurrent → Coda)
/recurrent-loop             Deep dive: loop mechanics, injection, ACT, LoRA
/attention                  MLA vs GQA side-by-side
/moe                        Expert routing visualization
/stability                  LTI injection & spectral radius ρ(A)
/depth-extrapolation        n_loops slider + quality curve
/variants                   Model scale comparison table + param breakdown
/moda                       Experimental MoDA architecture (separate track)
/references                 Papers, links, citations
```

**Design principle:** Each route maps 1:1 to a *distinctive* architectural idea. Standard transformer concepts (embedding, RMSNorm) are explained inline, not given standalone pages.

---

## 3. Interactive Components — Sketches

### 3.1 Architecture Pipeline (`/architecture`)

**Concept:** Animated vertical flow diagram. User clicks each stage to expand internals.

**Interactions:**
- **Play / Step** through a forward pass: tokens light up as they traverse Prelude → loop → Coda
- **Hover** on Prelude/Coda blocks → show layer count from config
- **Click** Recurrent block → navigate to `/recurrent-loop` with context preserved
- **Config panel** (sidebar): select variant (`mythos_3b`, etc.) or custom `MythosConfig` — updates labels (dim, experts, loop count)

**Tech:** React Flow or custom SVG + Framer Motion. Config state via URL search params (`?variant=3b&loops=16`).

---

### 3.2 Recurrent Loop Explorer (`/recurrent-loop`)

**Concept:** The signature visualization. A circular/vertical loop diagram showing state `h` evolving across iterations.

**Interactions:**
- **Loop slider** `t = 0 … n_loops-1`: step through one iteration at a time
- **State vectors** `h`, `e`, `trans_out` shown as animated 1D heat strips (synthetic demo data, not live PyTorch)
- **Formula panel** highlights active term: `A·h_t` | `B·e` | `Transformer(…)`
- **Injection toggle:** disable `e` injection → show "drift" animation (hidden state diverges from input — didactic)
- **ACT overlay:** per-token halting bars fill cumulatively; tokens that halt stop updating (color fade)
- **LoRA delta:** small perturbation arrow on `trans_out`, scale changes per loop index

**Key teaching moment:** "Same weights, different loop index → different behavior" via loop-index embedding waveform.

---

### 3.3 LTI Stability Lab (`/stability`)

**Concept:** Interactive dynamical-systems view of `h_{t+1} = A·h_t + B·e` (linear part).

**Interactions:**
- **ρ(A) gauge:** real-time display of `max(|eigenvalues|)` — must stay < 1 (green zone)
- **Parameter sliders:** `log_A`, `log_dt` — show how Parcae parameterization keeps A diagonal entries in (0, 1)
- **Trajectory plot:** 2D projection of `h_t` over loops — stable spiral vs unstable explosion
- **Compare:** unconstrained A (user can push ρ ≥ 1) vs constrained Parcae A

**Data:** Precompute trajectories in TypeScript from the same formulas as `LTIInjection.get_A()`. Optional future: API route that runs a tiny PyTorch forward and returns ρ(A) from a real checkpoint.

---

### 3.4 ACT Halting Simulator (`/recurrent-loop` section or standalone)

**Concept:** Sequence of tokens with heterogeneous difficulty; halting probabilities differ per position.

**Interactions:**
- **Token row:** each position has a halting probability bar that accumulates per loop
- **Threshold slider:** `act_threshold` (default 0.99)
- **Batch view:** easy tokens (short bars) halt early; hard tokens keep looping
- **Output:** ACT-weighted sum visualization — which loop iterations contributed most to final `h_out`

**Teaching moment:** Adaptive compute — "Continuous Depth-wise Batching" callout.

---

### 3.5 Attention Comparator (`/attention`)

**Concept:** Split-pane MLA vs GQA with KV cache size comparison.

**Interactions:**
- **Toggle** `attn_type`: `"mla"` | `"gqa"`
- **Cache diagram:** per-token memory footprint
  - GQA: `n_kv_heads × head_dim × 2`
  - MLA: `kv_lora_rank + n_heads × qk_rope_head_dim` (cached) + on-the-fly reconstruction
- **Animated decode step:** show what gets stored vs recomputed each token
- **RoPE animation:** complex-plane rotation on Q/K (sequence position)

**MLA detail panel:** Q path (q_down → q_up_nope + q_up_rope), KV path (kv_down → c_kv cached, reconstruct K_nope/V).

---

### 3.6 MoE Router (`/moe`)

**Concept:** Token-level expert routing inside the recurrent block only.

**Interactions:**
- **Expert grid:** `n_experts` cells (sample with smaller N for UI, e.g. 16 visible, "64 total" label)
- **Token click:** show router softmax scores, top-K selection, renormed weights
- **Shared experts:** always-on lane (distinct color) — `n_shared_experts`
- **Per-loop routing:** scrub loop index — expert selection *changes* across loops (same token, different depth)
- **Load balance:** animated `router_bias` effect (aux-loss-free balancing)

**Note:** Prelude/Coda use dense `Expert` FFN — visualizer should grey those out in the pipeline view.

---

### 3.7 Depth Extrapolation (`/depth-extrapolation`)

**Concept:** Inference-time scaling — more loops, deeper reasoning (with diminishing returns).

**Interactions:**
- **`n_loops` slider:** training default (e.g. 16) → extrapolated (32, 48, 64)
- **Quality curve:** saturating exponential decay (from Parcae scaling laws — illustrative, not live eval)
- **Overthinking zone:** shaded region where extra loops hurt (callout from README)
- **Compare:** fixed-depth transformer (hypothetical baseline) vs looped model on "N-hop reasoning" toy task

---

### 3.8 Model Variants Explorer (`/variants`)

**Concept:** Interactive comparison of `mythos_1b` … `mythos_1t`.

**Interactions:**
- **Table / cards:** dim, experts, loop iters, context, max output
- **Param breakdown chart:** embed | prelude/coda | recurrent MLA | MoE (stacked bar)
- **Scale selector:** updates all other pages' default config
- **Log-scale toggle** for parameter counts (1B → 1T)

**Data source:** Hand-authored `src/lib/variants.ts` — values copied from `open_mythos/variants.py` (no build script; update manually when variants change).

---

### 3.9 MoDA Track (`/moda`)

**Concept:** Secondary architecture in `open_mythos/moda.py` — not the main Mythos path, but architecturally interesting.

**Interactions:**
- **Depth KV cache:** layers write K/V to a depth cache; later layers attend to sequence + depth
- **Unified attention softmax:** visual merge of sequence logits (causal) + depth logits
- **DeepSeek MoE gate:** shared + routed experts with balance loss

Clearly label as **experimental / alternative** to avoid conflating with core OpenMythos.

---

### 3.10 Source Code Integration (cross-cutting — every deep-dive page)

**Concept:** Every interactive section is paired with the *actual implementation* in this repo. When a user explores a mechanism visually, they can open the corresponding source inline — no context switch to GitHub required for reading, but links go to the real file + line range.

**Instruction for implementers:**

1. **Maintain a code-ref manifest** at `src/lib/code-refs.ts` — a typed map from topic keys to `{ file, startLine, endLine, label, highlightLines? }`. Single source of truth; pages import by key (e.g. `codeRefs.recurrentLoop`).

2. **Build a `<CodeRefPanel>` component** used on every route in §2 (except landing/references):
   - Collapsible panel below or beside the visualization (default: collapsed on mobile, peek-open on desktop)
   - Syntax-highlighted snippet fetched or inlined from manifest
   - Header: `open_mythos/main.py` · lines 857–883 · `RecurrentBlock.forward`
   - **“Open in repo”** link: `https://github.com/<org>/OpenMythos/blob/main/<file>#L<start>-L<end>`
   - **Highlight sync:** when the loop stepper is on step 5, underline the matching lines in the snippet (e.g. `LTIInjection` call)

3. **Wire highlights to interaction state** where possible:
   | Page | User action | Snippet highlight |
   |------|-------------|-------------------|
   | `/recurrent-loop` | Loop step `t` | `loop_index_embedding` → `TransformerBlock` → `lora` → `injection` → `act` lines |
   | `/stability` | Slider moves `log_A` | `LTIInjection.get_A()` |
   | `/attention` | Toggle MLA/GQA | respective `forward()` bodies |
   | `/moe` | Token selected | `MoEFFN.forward` router + dispatch loop |
   | `/architecture` | Stage clicked | `OpenMythos.forward` stage block |

4. **Do not duplicate logic in prose** — the snippet is authoritative; UI copy explains *what to look for* in the highlighted lines.

5. **Keep line numbers current:** when `open_mythos/main.py` changes, update `code-refs.ts` only (no codegen pipeline).

**Manifest seed (implement first):**

| Key | File | Lines |
|-----|------|-------|
| `forward` | `open_mythos/main.py` | 992–1034 |
| `recurrentLoop` | `open_mythos/main.py` | 857–891 |
| `ltiInjection` | `open_mythos/main.py` | 684–742 |
| `actHalting` | `open_mythos/main.py` | 750–780, 865–883 |
| `loopEmbedding` | `open_mythos/main.py` | 541–570 |
| `loraAdapter` | `open_mythos/main.py` | 578–619 |
| `moeFfn` | `open_mythos/main.py` | 456–533 |
| `mlaAttention` | `open_mythos/main.py` | 284–418 |
| `gqaAttention` | `open_mythos/main.py` | 177–276 |
| `variants` | `open_mythos/variants.py` | full file |
| `modaAttention` | `open_mythos/moda.py` | 671–814 |

---

### 3.11 Standard Transformer Comparison (`/architecture`)

**Concept:** Toggle that overlays a “vanilla stacked transformer” baseline next to the RDT pipeline — same `dim` and approximate param budget, but unique layers instead of loops.

**Interactions:**
- **Toggle:** “Compare to standard transformer” — swaps recurrent column for a stack of `N` unique blocks
- **Callouts:** parameter count (shared weights vs `N` unique), no `e` injection, no ACT, no depth extrapolation
- **CodeRefPanel:** `OpenMythos.forward` vs a short illustrative pseudo-stack comment block

---

## 4. Technical Architecture (Vercel-Ready)

### 4.1 Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15** (App Router) | Vercel-native, SSG/ISR, API routes if needed |
| UI | **React 19** + **Tailwind CSS** + **shadcn/ui** | Fast polish, accessible components |
| Animation | **Framer Motion** | Pipeline transitions, loop stepping |
| Diagrams | **React Flow** or **@xyflow/react** | Node graphs for architecture |
| Charts | **Recharts** or **visx** | ρ(A) gauge, scaling curves, param breakdown |
| Math | **KaTeX** (via `react-katex`) | Render `h_{t+1} = A·h_t + B·e + …` |
| State | **URL search params** + **Zustand** | Shareable config links |

### 4.2 Directory Layout (proposed)

```
visualizer/
├── PLAN.md                    ← this file
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── data/
│       └── demo-trajectories.json
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── architecture/
    │   ├── recurrent-loop/
    │   ├── attention/
    │   ├── moe/
    │   ├── stability/
    │   ├── depth-extrapolation/
    │   ├── variants/
    │   ├── moda/
    │   └── references/
    ├── components/
    │   ├── layout/            # Nav, footer, theme toggle
    │   ├── pipeline/          # Stage nodes, connectors
    │   ├── recurrent/         # Loop stepper, ACT bars, injection viz
    │   ├── attention/         # MLA/GQA panes
    │   ├── moe/               # Expert grid, router heatmap
    │   ├── stability/         # ρ(A) gauge, phase plot
    │   └── shared/            # ConfigPanel, FormulaBlock, TokenStrip, CodeRefPanel
    ├── lib/
    │   ├── config.ts          # MythosConfig types + defaults
    │   ├── code-refs.ts       # Topic → file:line manifest (§3.10)
    │   ├── lti.ts             # Port of LTIInjection math
    │   ├── act.ts             # ACT simulation
    │   ├── loop-embedding.ts  # loop_index_embedding
    │   └── variants.ts        # Hand-authored mythos_1b … mythos_1t specs
    └── styles/
        └── globals.css
```

### 4.3 Vercel Deployment

- **Root directory:** `visualizer/` (set in Vercel project settings)
- **Framework preset:** Next.js (auto-detected)
- **Build:** `npm run build` or `pnpm build`
- **No Python runtime on Vercel** — interactivity uses client-side TypeScript ports of the math
- **ρ(A) verification:** document a one-liner in `/stability` for local dev (`model.recurrent.injection.get_A()`) so readers can confirm the gauge matches a real init; values in the UI remain computed in TS from the same formulas as `LTIInjection.get_A()`

### 4.4 Monorepo Integration

- Visualizer is **self-contained** — own `package.json`, no Poetry dependency
- Root `README.md` gets a "Visualizer" section linking to `/visualizer` and the deployed URL
- CI: optional GitHub Action to build visualizer on PR

---

## 5. Visual Design Direction

**Tone:** Technical museum exhibit — dark theme default, high contrast, monospace for formulas.

| Element | Direction |
|---------|-----------|
| Color | Prelude = blue, Recurrent = amber/orange (loop heat), Coda = violet |
| Motion | Restrained — step-on-demand, not autoplay loops |
| Typography | Inter (UI) + JetBrains Mono (code, dims, tensor shapes) |
| Icons | Custom SVG for loop arrow, expert grid, cache blocks |

**Accessibility:** Keyboard-navigable loop stepper, reduced-motion mode disables trajectory animations.

---

## 6. Data Strategy (No Live Model Required for v1)

| Visualization | Data source |
|---------------|-------------|
| Architecture labels | `src/lib/variants.ts` (hand-maintained from `variants.py`) |
| LTI ρ(A), trajectories | TypeScript port of `LTIInjection` formulas |
| ACT halting | Simulated per-token probabilities (seeded PRNG, labeled "illustrative") |
| MoE routing | Simulated softmax scores; patterns tuned to look realistic |
| MLA/GQA cache sizes | Computed from config formulas in docs |
| Depth extrapolation curve | Parametric saturating exponential (Parcae-inspired) |

**Label clearly:** "Interactive simulation" vs "measured from model" when we add real inference later.

---

## 7. Implementation Phases

### Phase 0 — Scaffold (current)
- [x] Codebase analysis
- [x] `PLAN.md`

### Phase 1 — Core narrative
- [ ] Next.js init, Tailwind, shadcn, base layout + nav
- [ ] `src/lib/code-refs.ts` manifest + `<CodeRefPanel>` component (§3.10)
- [ ] Landing page + `/architecture` pipeline (include standard-transformer compare toggle, §3.11)
- [ ] `/recurrent-loop` with loop stepper, formula highlight, and step-synced snippet highlights
- [ ] Config panel wired to URL params
- [ ] `src/lib/variants.ts` + `/variants` page

### Phase 2 — Distinctive mechanics
- [ ] `/stability` LTI lab (+ CodeRefPanel for `LTIInjection`, local ρ(A) verify note)
- [ ] ACT halting integrated in recurrent view
- [ ] `/attention` MLA vs GQA
- [ ] `/moe` router

### Phase 3 — Complete & deploy
- [ ] `/depth-extrapolation`, `/references`, `/moda` (each with CodeRefPanel)
- [ ] CodeRef highlight sync on all interactive pages (full table in §3.10)
- [ ] Mobile layout, a11y pass
- [ ] Vercel deploy + root README link
- [ ] OG images / social preview

---

## 8. Open Questions / Decisions

1. **Monorepo vs separate deploy:** Keep `visualizer/` in-repo (recommended) — single clone, Vercel root dir override.
2. **Live PyTorch on Vercel:** No — TS ports for math; snippets + local verify one-liner for ρ(A).
3. **MoDA prominence:** Secondary track — core brand is RDT (Prelude/Recurrent/Coda), not MoDA.
4. **Variant data:** Hand-maintained `variants.ts` — no build script.
5. **3D vs 2D:** 2D diagrams only.
6. **Snippet freshness:** `code-refs.ts` updated manually when Python line numbers shift.

---

## 10. Success Criteria

When complete, a visitor should be able to:

1. **Understand** why OpenMythos is not a vanilla transformer in < 2 minutes (landing + architecture)
2. **Explain** the recurrent update rule and why `e` is injected every loop
3. **See** how ρ(A) < 1 prevents training instability
4. **Compare** MLA vs GQA KV cache tradeoffs
5. **Explore** how MoE routing differs per loop iteration
6. **Adjust** `n_loops` and grasp depth extrapolation vs overthinking
7. **Read** the implementation inline — synced highlights on every deep-dive page (§3.10)
8. **Compare** RDT vs a standard stacked transformer on `/architecture`
9. **Deploy** by connecting the repo to Vercel with `visualizer` as root — no extra setup

---

*Last updated: planning phase — Phase 1 scaffold + CodeRefPanel next.*
