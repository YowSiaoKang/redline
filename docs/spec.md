# Redline — Technical Spec

> Normal people get what lawyers have.
> Implements `prd.md` in full; every component below cross-references its epic.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 19 + Vite + TypeScript** | Boring on purpose. WebMCP tools are client-side JS, so the frontend *is* the app; React has the largest ecosystem and Vite builds are Workers-static-assets ready. Learner is Python-first and delegated framework choice to project fit. |
| State | **React context + `useReducer`, no state library** | One in-memory store; "refresh = clean start" is a PRD non-goal we get for free. |
| WebMCP types | **`webmcp-types`** (npm) | Official TypeScript definitions for `document.modelContext`; no hand-rolled schemas. |
| Styling | **Vanilla CSS custom properties, no Tailwind** | The paper-white/ink-red editorial aesthetic is bespoke; zero framework friction, full control. |
| Fonts | **`@fontsource/newsreader`** (document serif), **`@fontsource/inter`** (UI chrome) | Self-hosted in the bundle — the demo never breaks on a CDN hiccup. |
| Hosting | **Cloudflare Workers (static assets)** via `wrangler` | Cloudflare's primary platform going forward (Pages is legacy-leaning); free for static; custom domain already on Cloudflare DNS; learner's deployment learning goal. |

Docs: [WebMCP explainer](https://github.com/webmachinelearning/webmcp) · [spec draft](https://webmachinelearning.github.io/webmcp/) · [webmcp-types](https://www.npmjs.com/package/webmcp-types) · [React](https://react.dev) · [Vite](https://vite.dev) · [TypeScript](https://www.typescriptlang.org/) · [Workers static assets](https://developers.cloudflare.com/workers/static-assets/) · [Wrangler](https://developers.cloudflare.com/workers/wrangler/) · [Newsreader](https://fontsource.org/fonts/newsreader) · [Inter](https://fontsource.org/fonts/inter)

## Runtime & Deployment

- **Static SPA** served over HTTPS (WebMCP requires a secure context — the custom domain provides it).
- **No backend. No database. No API keys of any kind.** The agent platform supplies 100% of the intelligence; Redline supplies structure, state, and UI.
- **Deploy:** `wrangler deploy` from a Vite build. Custom domain on Cloudflare DNS.
- **Chrome Origin Trial (live in Chrome 149):** enroll the deployed domain, add the trial token as a `<meta>` tag. Judges on stock Chrome get WebMCP with zero flags. Fallback paths, in order: flag (`chrome://flags/#enable-webmcp-testing`) → ChatGPT Desktop (native WebMCP support, no flags ever). Verify token validity dates at build time.
- **Test targets (definition of done):** ChatGPT Desktop; Chrome 149+ with origin-trial token.
- Local dev: Node 20+ LTS, `npm run dev` (Vite), WebMCP APIs absent until enabled — the no-WebMCP detection screen (below) doubles as the dev-mode explainer.
- Learner runs deployment personally (learning goal); deploy steps belong in the /checklist.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│   Agent platform (ChatGPT Desktop / Chrome browser agent)│
│         the only intelligence in the system              │
└───────────────┬──────────────────────────────────────────┘
                │ discovers + invokes tools (WebMCP)
┌───────────────▼──────────────────────────────────────────┐
│  Browser page — redline (HTTPS, secure context)          │
│                                                          │
│   ┌────────────────┐  dispatch   ┌────────────────────┐   │
│   │  Tool layer    │ ──────────▶ │  Session store     │   │
│   │ document.      │             │  context+reducer   │   │
│   │ modelContext   │ ◀────────── └─────────┬──────────┘   │
│   └────────────────┘  reads via live ref  │              │
│        ▲              (never stale)       │ render       │
│        │                        ┌─────────▼──────────┐   │
│   clause splitter · email       │   UI components    │   │
│   composer · data packs         └────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**One rule governs everything: tools → actions → store → UI, single direction.**
Tool `execute`s read the store through the live ref and dispatch reducer actions;
the UI is a pure function of the store. The agent never touches React state
directly; React never calls the agent.

**Lifecycle of a redline (the most important data):**

```
paste ──▶ clause-splitter ──▶ store.clauses[] (document blurred, awaiting agent)
                                   │  analysis tools registered
agent ◀─ extract_clauses() ────────┤
   └─▶ assess_clause(...) ──▶ CLAUSE_ASSESSED action
          clean ────▶ status=cleared ───▶ snap-to-clarity
          flagged ──▶ flags + redlines ──▶ stays blurred + verdict cards render
judge verdicts ──▶ VERDICT_SET ──▶ derived reviewComplete ──▶ banner + email CTA
agent ◀─ export_negotiation_email() ──▶ composer ──▶ EmailView + copy button
```

Chat threads append from both directions — agent `note`s via `assess_clause`,
judge verdicts via actions — so the clause conversation is just store data.

## State Layer

### ReviewSession store (`src/state/session.tsx`)
The single source of truth. One context + `useReducer`. Shape in [Data Model](#data-model).

**Critical implementation rule:** tool `execute` callbacks registered at mount
would capture stale closures. All tool reads go through a ref to the latest
store state (`useRef` updated on every render). This is the one genuinely
subtle trap in the app; every tool depends on it.

### Actions (`src/state/actions.ts`)
`DOCUMENT_LOADED` · `CLAUSE_ASSESSED` · `VERDICT_SET` · `RESET` (and trivial
derivatives: thread-append rides on `CLAUSE_ASSESSED`/`VERDICT_SET`).
`RESET` unregisters analysis tools and returns to landing — supports
"try another contract" between samples.

### Derived selectors (`src/state/select.ts`)
- **Clause clarity (the blur rule):** a clause renders un-blurred iff
  `status === 'cleared'` OR every one of its redlines has `verdict !== 'undecided'`.
  The PRD's two-trigger mechanic (agent pass + human verdicts) is this one expression.
- **`reviewComplete`:** `clauses.length > 0` AND every clause assessed AND every
  redline decided. Covers the all-clean edge: zero redlines produced → vacuously
  complete → acceptance-email path.
- **Phase:** `landing → awaiting-agent` on `DOCUMENT_LOADED`; `→ reviewing` on
  first `CLAUSE_ASSESSED`; `→ complete` when `reviewComplete` flips true; a
  reopened decision honestly returns to `reviewing` (the moment re-triggers, per PRD).

## WebMCP Tool Layer

Implements the heart of `prd.md > Agent Analysis`, `prd.md > Deciding Redlines`,
`prd.md > The Negotiation Email`. Tool descriptions are our only prompt surface —
we don't control the agent's system prompt — so they carry the seven-family
taxonomy, severity enum, and one-line-reason rule.

### Registration lifecycle (`src/tools/register.ts`)
- **Base phase** (page boot): `get_sample_contract` only.
- **Analysis phase** (`DOCUMENT_LOADED`): the five analysis tools register;
  `RESET` unregisters them. Phase-gated progressive disclosure — the dynamic
  registration story, first-class in the WebMCP spec (`toolchange` event).
- All registration through one helper; `AbortController` per phase for clean
  teardown; `webmcp-types` for signatures; MCP-style returns
  (`{ content: [{ type: 'text', text: JSON.stringify(...) }] }`).

### Base tool (`src/tools/base.ts`)

#### `get_sample_contract`
- Input: `{ sampleId: 'offer-letter' | 'training-agreement' | 'nda' }`
- Returns: full contract text; dispatches `DOCUMENT_LOADED`. Same path as UI
  sample clicks — agent and human converge on one action.

### Analysis tools (`src/tools/analysis.ts`)

#### `get_document_state`
- Input: none. Returns: title, source, clause count, cleared/flagged/undecided
  counts. The agent's "where am I" — cheap orientation call.

#### `extract_clauses`
- Input: none. Returns: array of `{ clauseId, text }` in document order.
- Description names the seven families (non-compete, TRAP, invention assignment,
  forfeiture-for-competition, garden leave, non-solicitation/antipiracy,
  unlimited-scope NDA) so the agent knows the taxonomy up front.
- The app owns structure; the agent owns judgment. Unknown-`clauseId` tool calls
  return a text error: "unknown clauseId — call extract_clauses first."

#### `get_clause_text`
- Input: `{ clauseId }`. Returns: exact clause text. For re-reading before
  drafting redline language, and for self-grounding when the judge asks "why?"

#### `assess_clause`
- Input: `{ clauseId, summary, flags?, redlines?, note? }`
  - `summary`: plain-English one-liner (PRD requires it per clause).
  - `flags[]`: `{ issue, severity: 'high'|'medium'|'low', reason }`.
  - `redlines[]`: `{ type: 'replace'|'remove', originalSpan, proposedText, reason }`
    — store assigns ids; agent never invents them.
  - `note`: the agent's message to the human; appended to the clause thread.
- **Upsert semantics:** re-invoking on a cleared clause is how the agent changes
  its mind under questioning — new redlines appear immediately (PRD: Agent
  Analysis + Deciding Redlines stories).
- Description carries the output contract: severity enum, one-line reasons,
  concrete replacement language.

#### `get_enforceability_context`
- Input: `{ family, state? }`. Returns: matching data-pack slice — state profile
  (duration caps, statutory cites, overbreadth signals) or the five-family
  reasonableness rubric. See [Enforceability Data Packs](#enforceability-data-packs).

#### `export_negotiation_email`
- Input: `{ yourName?, company?, hiringManagerName? }` (placeholders
  `[Your Name]` / `[Company]` / `[Hiring Manager Name]` when omitted).
- Returns: composed email text (see [Email Composer](#email-composer)).
- Mirrors the page exactly: current store state in, current draft out — partial
  state mid-review, acceptance email only at true `reviewComplete` with zero
  adopted redlines.

### The "ask why" loop (platform constraint, honored by design)
WebMCP tools are agent-invoked; **the page cannot call the agent.** So:
- The page displays the clause thread (agent notes + reasons + judge verdicts).
- Every clause carries **"ask about this"** — copies a grounded, clause-anchored
  question (clause text + current flags) to the clipboard for the judge to send
  in their agent window.
- The agent grounds itself via `get_clause_text` / `get_enforceability_context`,
  answers in chat, and pushes changed assessments back through `assess_clause`
  — new redlines appear on previously-clean clauses immediately.
- The loop closes through the agent platform: no LLM keys, exactly as scoped.

## Clause Splitter (`src/lib/clause-splitter.ts`)

Naive segmentation on headings/numbering — contracts are formulaic. Runs on
`DOCUMENT_LOADED`; assigns `clauseId`s (`c1…cn`); preserves document order
(sacred, per PRD). Forgiving of irregular formatting; no artificial length
limits. Sample contracts are drafted to exercise this splitter exactly like a
real 22-pager would.

## Enforceability Data Packs

Static TypeScript modules bundled with the app — no API, no backend.

### `src/data/enforceability/non-compete.ts`
Deep US state profiles: duration caps, geographic limits, centrality/notice
requirements, 2023-era overbreadth signals. ~15 states deep, incl. the
demonstration state.

### `src/data/enforceability/trap.ts`
Key-state consumer-protection statutes for training repayment agreements. ~5 states.

### `src/data/enforceability/heuristics.ts`
Reasonableness rubric for the other five families: *duration > 2 years?
unlimited geography? no compensation?* — exposed verbatim through
`get_enforceability_context`.

Agent flow: recognizes a non-compete → grounds in the state profile → redline
reason says "Texas courts won't enforce X" instead of vibes.

## UI Components

Design language: warm paper-white, editorial serif (Newsreader) for the
document, ink-red accents as the only sharp thing on the page. Desktop-first,
**1440px reference frame, composes clean at 1920×1080** for the screen
recording. Tokens in `src/styles/tokens.css`.

### Landing (`components/Landing.tsx`)
Implements `prd.md > Loading a Contract`.
- Three sample cards, one click each; free-paste box; three usage instructions
  visible above the fold:
  1. **Load a contract** — pick a sample or paste your own.
  2. **Open your AI assistant** — ChatGPT Desktop, or your browser's agent — and ask it to review.
  3. **Decide each redline** — your negotiation email writes itself as you go.
- "Not legal advice" + privacy line visible ("the document lives in your
  browser session; only what the tools return reaches your agent").
- **Garbage-paste state** (`NotAContractMsg`): friendly, funny —
  "That's not a contract. Nice grocery list though." — with a try-again
  invitation, never an error dialog.
- **No-WebMCP detection screen:** if `document.modelContext` is `undefined`,
  show an intentional explainer ("your browser can't run agent tools yet") with
  both enablement paths (Chrome flag, ChatGPT Desktop) — not a dead page.

### DocumentView (`components/DocumentView.tsx`)
Implements `prd.md > Agent Analysis`, `prd.md > Deciding Redlines`.
- Pre-extraction: raw text rendered blurred, one wall of dread.
- `AwaitingAgent` overlay: "waiting for your agent" + one-line instruction
  naming the agents; calm, resolves on first analysis tool call.
- Completion banner + email CTA when `reviewComplete`; honest reversal if a
  verdict reopens.

### ClauseBlock (`components/ClauseBlock.tsx`)
One per clause, document order. Header: plain-English summary line + severity
pill. Blur via `filter: blur(4px)`; hover-to-peek (`:hover`, press-and-hold on
touch). Snap-to-clarity: **500ms ease-out blur transition — tuned for film**
(it reads in real time on the recording); `prefers-reduced-motion` → instant.

### FlagBadge (`components/FlagBadge.tsx`)
Issue + severity pill (High/Medium/Low) + one-line reason.

### RedlineCard (`components/RedlineCard.tsx`)
Implements `prd.md > Deciding Redlines`.
- Lawyer-style treatment: the **original span is highlighted in the clause text**
  (ink-red underline); the **strike-and-propose rendering lives in the card** —
  `~~original~~ → proposed` + one-line reason + the two verdict buttons.
  (Cards carry the proposals so multiple/overlapping redlines on one clause
  never tangle the text rendering.)
- Verdicts: **Keep as-is** / **Redline it**, both always available, per-redline,
  revisable at any time (mixed outcomes normal — adopt duration, keep geography).

### ClauseChat (`components/ClauseChat.tsx`)
The clause-anchored thread: agent notes + verdict history; collapsed by default,
expandable. Home of "ask about this" (copies the grounded prompt).

### EmailView (`components/EmailView.tsx`)
Implements `prd.md > The Negotiation Email`.
- Reachable from first assessment onward (quiet affordance); clearly labeled
  in-progress mid-review; promoted to center stage by the completion banner.
- Copy affordance with confirmed-copied feedback. Placeholders per PRD.
- Zero *adopted* redlines at true `reviewComplete` → warm offer-acceptance email.

## Email Composer (`src/lib/email.ts`)
Pure function: store state → email text. Friendly-collaborative tone (excited
about the role, asking to align on a few terms); one paragraph per clause with
≥1 adopted redline, covering only the adopted changes (kept redlines omitted;
partially-disputed clauses still get a full paragraph). Used by both the page
and `export_negotiation_email` — they can never disagree.

## Sample Contracts (`src/data/samples/`)

Agent-drafted at build time, learner-curated. Requirements:

1. **`offer-letter.ts`** — the video's villain. Non-compete trips *every*
   heuristic at once: 5-year duration, worldwide scope, "any role in the
   industry," zero compensation, no garden leave.
2. **`training-agreement.ts`** — TRAP: interest accrual, employer discretion on
   "qualifying separation," repayment measured from hire date, intimidating
   dollar amount.
3. **`nda.ts`** — unlimited duration, covers public knowledge, no residuals
   carve-out, one-way.

Shared rules: structurally authentic furniture (recitals, definitions, numbered
headings — exercises the splitter); ~8-10 clauses, 700-900 words each (real
feel, snappy tool latency on camera); fictional companies, US framing, ASCII;
**no runtime metadata about expected outcomes** — the no-scripting non-goal
holds, and "would a good model flag this?" is a build-time verification question.
Each gets a one-line editorial title for its landing card (learner's call).

## Trust & Privacy framing
Implements `prd.md > Trust & Privacy`. All static copy + architecture honesty:
not-legal-advice on landing; privacy line on landing; the session lives in
memory (`RESET` and refresh both honest clean starts). Nothing to build beyond
saying it truthfully — the architecture already keeps the promise.

## Data Model

```ts
type Phase = 'landing' | 'awaiting-agent' | 'reviewing' | 'complete';

interface ReviewSession {
  phase: Phase;
  document: ContractDoc | null;
}

interface ContractDoc {
  title: string;
  source: { kind: 'paste' } | { kind: 'sample', sampleId: string };
  rawText: string;
  clauses: Clause[];            // document order sacred — never re-sorted
}

interface Clause {
  id: string;                   // c1…cn, assigned by splitter
  order: number;
  rawText: string;
  summary?: string;             // agent's plain-English one-liner
  status: 'cleared' | 'flagged';   // pre-extraction, clauses don't exist as entities
  flags: Flag[];
  redlines: Redline[];
  chat: Message[];
  assessed: boolean;
}

interface Flag {
  issue: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;               // one line, displayed
}

interface Redline {
  id: string;                   // store-assigned
  type: 'replace' | 'remove';
  originalSpan: string;
  proposedText: string;         // empty for 'remove'
  reason: string;               // one line, displayed with verdict UI
  verdict: 'undecided' | 'keep' | 'adopt';
}

interface Message {
  role: 'agent' | 'judge';
  text: string;
}
```

Blur rule (derived, never stored): un-blurred iff `status === 'cleared'` or
every redline decided. Hover-to-peek is CSS on top.

## File Structure

```
redline/
├── src/
│   ├── main.tsx                  # entry: mount React, boot base tool registration
│   ├── App.tsx                   # phase router: landing | document
│   ├── state/
│   │   ├── session.tsx           # ReviewSession context + reducer — the one store
│   │   ├── actions.ts            # DOCUMENT_LOADED · CLAUSE_ASSESSED · VERDICT_SET · RESET
│   │   └── select.ts             # derived: clauseClarity · reviewComplete · phase
│   ├── tools/
│   │   ├── register.ts           # modelContext layer: phase-gated register/unregister,
│   │   │                         #   AbortController teardown, live-ref access rule
│   │   ├── base.ts               # get_sample_contract
│   │   ├── analysis.ts           # get_document_state · extract_clauses · get_clause_text
│   │   │                         #   · assess_clause · get_enforceability_context
│   │   │                         #   · export_negotiation_email
│   │   └── schemas.ts            # JSON Schemas, typed via webmcp-types
│   ├── lib/
│   │   ├── clause-splitter.ts    # heading/numbering segmentation (app owns structure)
│   │   ├── email.ts              # composer: adopted redlines → email; all-kept → acceptance
│   │   └── ask.ts                # grounded "ask about this" prompt builder
│   ├── data/
│   │   ├── enforceability/       # non-compete.ts · trap.ts · heuristics.ts
│   │   └── samples/              # offer-letter.ts · training-agreement.ts · nda.ts
│   ├── components/
│   │   ├── Landing.tsx           # samples · paste · instructions · trust copy
│   │   ├── NotAContractMsg.tsx   # funny garbage-paste state
│   │   ├── NoWebMCP.tsx          # detection + enablement explainer
│   │   ├── DocumentView.tsx      # document rendering · completion banner
│   │   ├── AwaitingAgent.tsx     # calm "waiting for your agent" overlay
│   │   ├── ClauseBlock.tsx       # summary header · blur · hover-peek · clarity snap
│   │   ├── FlagBadge.tsx         # issue + severity + reason
│   │   ├── RedlineCard.tsx       # strike-and-propose · verdict buttons
│   │   ├── ClauseChat.tsx        # clause thread · "ask about this"
│   │   └── EmailView.tsx         # live email · copy affordance
│   └── styles/
│       ├── tokens.css            # paper-white · ink-red · type scale
│       └── app.css               # layout + component styles
├── docs/                         # scope.md · prd.md · spec.md · checklist.md
├── process-notes.md
├── wrangler.jsonc                # Workers static assets config + origin-trial token
├── vite.config.ts
├── package.json
└── README.md
```

## Key Technical Decisions

1. **Static-only, no backend; the agent platform is the only intelligence.**
   Why: WebMCP's model makes the browser page the tool host; a backend would
   replicate state for zero benefit and add deploy surface. Tradeoff accepted:
   analysis quality depends entirely on the judge's agent — mitigated by
   tool-description steering, data packs, and cartoonishly-overbroad samples.
2. **Tools read the store via live ref; single-direction flow.**
   Why: `execute` closures registered at mount go stale; the live ref is the
   difference between a working agent and a haunted one. Tradeoff: one extra
   indirection in the tool layer, paid once in `register.ts`.
3. **Clarity is derived, not stored.** Why: the two-trigger blur mechanic
   (agent pass + human verdicts) collapses to one expression and can never
   drift out of sync with decisions. Tradeoff: recompute on render — trivial
   at this scale.
4. **Tool descriptions as prompt surface.** Why: we don't control the agent's
   system prompt; descriptions are the only text we reliably get into context.
   Tradeoff: discipline required to keep descriptions current as behavior
   evolves — they're load-bearing, not documentation.
5. **"Ask why" as a copyable grounded prompt, not an in-page chat box.**
   Why: WebMCP tools are agent-invoked; the page cannot call the agent, and
   scope forbids LLM keys. Tradeoff: one clipboard hop for the judge — honest
   to the platform, and the loop still closes with zero backend.

## Dependencies & External Services

| Dependency | Role | Notes / docs |
|---|---|---|
| `react`, `react-dom` 19 | UI | [react.dev](https://react.dev) |
| `vite` + `@vitejs/plugin-react` | build/dev | [vite.dev](https://vite.dev) — static output feeds Workers assets |
| `typescript` | types | [typescriptlang.org](https://www.typescriptlang.org) |
| `webmcp-types` | `document.modelContext` TS defs | [npm](https://www.npmjs.com/package/webmcp-types) |
| `@fontsource/newsreader`, `@fontsource/inter` | self-hosted fonts | [fontsource.org](https://fontsource.org) |
| `wrangler` | deploy CLI | [docs](https://developers.cloudflare.com/workers/wrangler/) |
| Cloudflare Workers (static assets) | hosting, free tier | [docs](https://developers.cloudflare.com/workers/static-assets/) |
| Chrome Origin Trial (WebMCP) | flag-free Chrome judging | [announcement](https://developer.chrome.com/blog/ai-webmcp-origin-trial) · enroll the domain, token in `<meta>`; verify validity past Sep 3 at build |
| WebMCP spec | the platform | [explainer](https://github.com/webmachinelearning/webmcp) · [spec](https://webmachinelearning.github.io/webmcp/) · Chrome flag: `chrome://flags/#enable-webmcp-testing` |
| ChatGPT Desktop | judge path 2, native WebMCP | [chatgpt.com/download](https://chatgpt.com/download/) |

No API keys anywhere. No rate limits to manage — every service is either
static or the judge's own agent subscription.

## Open Issues

Self-review findings — genuine questions, not homework:

1. **Splitter/agent disagreement:** the agent may disagree with the naive clause
   segmentation (wanting to merge or split sections), and the tool surface has
   no merge/split verb. Current stance: the app owns structure — the agent
   assesses the clauses it's given. Acceptable, or worth a `merge_clauses` verb
   for agent-initiated restructuring?
2. **Overlapping redline spans** are handled by keeping proposals in cards
   (spans highlighted in text only) — but if an agent flags *the same span*
   twice with contradictory proposals, the UI shows both cards and the judge
   picks. Confirm that's the wanted behavior vs. deduplicating.
3. **Origin-trial timing:** token validity must be confirmed to cover Sep 3.
   Cheap to verify at build; flagging so it can't be forgotten.
4. **ChatGPT-Desktop judges may never see the landing screen** (they hand the
   URL to the agent, browsing happens in ChatGPT's window). The base tool +
   document state carry the flow — but if we later want sample discovery by
   chat alone (`get_sample_contract` covers it), no work is needed. Noted so
   nobody "fixes" this during /build.
