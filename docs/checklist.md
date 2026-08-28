# Build Checklist — Redline

> Normal people get what lawyers have.
> Built from `docs/spec.md` + `docs/prd.md`. Deadline: Sep 3, 2026, 1pm PT.

## Build Preferences

- **Build mode:** Autonomous — one run through the entire checklist, summary at the end.
- **Exception — single pause at item 4:** the WebMCP risk gate requires the learner to drive a real agent (ChatGPT Desktop). Pause there, learner runs the round-trip, then continue. This is the only pause.
- **Comprehension checks:** N/A (autonomous mode).
- **Git:** `git init` happens in item 1. Commit after each item, message style: `Complete step N: [title]`. Commits are revert points — if something breaks, revert to last clean commit, revise checklist, resume.
- **Verification:** Skipped (build straight through) — except the mandatory learner pause at item 4. Learner reviews at the end.

## Checklist

- [ ] **1. Project scaffold + git init**
  Spec ref: `spec.md > Stack` · `spec.md > File Structure`
  What to build: Vite + React 19 + TypeScript scaffold at repo root. `src/styles/tokens.css` with the paper-white/ink-red token palette and type scale (Newsreader document serif, Inter UI chrome via @fontsource — self-hosted), `app.css` layout shell. `wrangler.jsonc` placeholder for Workers static assets. npm scripts: `dev`, `build`, `deploy` (wrangler), `preview`. `git init` + initial commit + `.gitignore` (node_modules, dist, .wrangler). Minimal entry: `main.tsx` mounts `App.tsx` showing a styled placeholder landing so tokens are visible.
  Acceptance: Dev server serves a styled page in the editorial aesthetic (paper-white background, ink-red accent visible). TypeScript compiles clean. Git repo initialized with first commit.
  Verify: `npm run dev` → open browser → styled placeholder renders; `npm run build` and `tsc --noEmit` pass; `git log` shows the initial commit.

- [ ] **2. State store — the contract everything plugs into**
  Spec ref: `spec.md > State Layer > ReviewSession store` · `Actions` · `Derived selectors` · `spec.md > Data Model`
  What to build: `src/state/session.tsx` (ReviewSession context + useReducer + the live ref updated on every render), `src/state/actions.ts` (`DOCUMENT_LOADED`, `CLAUSE_ASSESSED` with upsert semantics + thread-append, `VERDICT_SET`, `RESET`), `src/state/select.ts` (clause clarity rule: un-blurred iff `status === 'cleared'` OR every redline decided; `reviewComplete` incl. vacuous all-clean case; phase machine `landing → awaiting-agent → reviewing → complete` with honest reopen). All interfaces exactly per `spec.md > Data Model`.
  Acceptance: Reducer transitions match the phase diagram; `CLAUSE_ASSESSED` on an already-assessed clause upserts (new redlines appear, ids store-assigned); clarity rule is the one derived expression; `RESET` clears to landing.
  Verify: `tsc --noEmit` passes (types enforce the data model); reducer unit sanity via a scratch test or temporary console dispatch in dev — phase transitions and clarity derivations return expected values.

- [ ] **3. Landing + clause splitter + blurred document**
  Spec ref: `spec.md > UI Components > Landing` · `NotAContractMsg` · `NoWebMCP` · `AwaitingAgent` · `spec.md > Clause Splitter`
  What to build: `Landing.tsx` (three sample cards — placeholders until item 6 wires real text; free-paste box; the three usage instructions above the fold; not-legal-advice + privacy lines), `NotAContractMsg.tsx` (friendly/funny garbage-paste state), `NoWebMCP.tsx` (detection explainer with both enablement paths when `document.modelContext` is undefined), `clause-splitter.ts` (heading/numbering segmentation, assigns `c1…cn`, preserves document order, forgiving of irregular formatting), `DocumentView.tsx` rendering raw text blurred + `AwaitingAgent.tsx` overlay, `ClauseBlock.tsx` with blur + hover-peek. Paste dispatches `DOCUMENT_LOADED` → phase `awaiting-agent`.
  Acceptance: Paste of real contract text renders blurred, in order, clause-per-block; hovering any span reveals it while hovered (PRD: peekable blur); grocery-list paste gets the funny message + try-again, never an error dialog; in a plain browser the no-WebMCP explainer shows with both paths.
  Verify: `npm run dev`, paste sample text from a scratch file (console dispatch or temp button), confirm blurred clause blocks in document order, hover-peek works, garbage paste shows the message.

- [ ] **4. ⏸ WebMCP vertical slice — THE RISK GATE**
  Spec ref: `spec.md > WebMCP Tool Layer > Registration lifecycle` · `Base tool > get_sample_contract` · `Analysis tools > get_document_state`
  What to build: `src/tools/register.ts` (one registration helper; phase-gated: base tool at boot, analysis suite on `DOCUMENT_LOADED`, `RESET` unregisters; `AbortController` per phase; MCP-style returns `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`; all tool reads through the live ref — never stale closures), `src/tools/base.ts` (`get_sample_contract` — returns full text + dispatches `DOCUMENT_LOADED`, same path as UI clicks), `get_document_state` from `analysis.ts` (title, source, clause counts). `src/tools/schemas.ts` typed via `webmcp-types`.
  Acceptance: A real agent (ChatGPT Desktop) discovers the registered tools and a `get_document_state` call returns live JSON that matches what the page shows; `get_sample_contract` loads a document and the page transitions to awaiting-agent state (once item 6 provides real samples — for now placeholder text is fine).
  Verify: **LEARNER PAUSE — human in the loop required.** Learner opens the app in ChatGPT Desktop (deploy an early `wrangler deploy` if ChatGPT Desktop can't reach the dev server), asks the agent to check document state, and confirms the tool round-trips. If the platform misbehaves: stop, debug registration before building items 5–9 on top.

- [ ] **5. Analysis tools + enforceability data packs**
  Spec ref: `spec.md > WebMCP Tool Layer > Analysis tools` · `spec.md > Enforceability Data Packs` (all three subsections)
  What to build: `extract_clauses` (returns `{clauseId, text}` in order; description carries the seven-family taxonomy), `get_clause_text` (re-grounding + self-correction), `assess_clause` (`{clauseId, summary, flags?, redlines?, note?}`; severity enum + one-line-reason rule in the description; upsert semantics; store assigns redline ids), `get_enforceability_context` (data-pack slices). Data packs: `data/enforceability/non-compete.ts` (~15 US state profiles: duration caps, geographic limits, centrality/notice, overbreadth signals), `trap.ts` (~5 key-state statutes), `heuristics.ts` (five-family reasonableness rubric, exposed verbatim). Tool descriptions are load-bearing prompt surface — severity enum, concrete-replacement-language rule, one-line reasons.
  Acceptance: Agent can go extract → assess → see flags/redlines/summary land in the store and render; redline reason text reads grounded ("Texas courts won't enforce X"), not vibes (PRD: per-clause summary, severity, one-line reason, concrete proposed language).
  Verify: In ChatGPT Desktop, ask the agent to review a pasted contract; confirm summaries, flags, and redlines appear via `assess_clause` calls; spot-check `get_enforceability_context` returns the right slice for `{family: 'non-compete'}`.

- [ ] **6. Sample contracts — the three villains**
  Spec ref: `spec.md > Sample Contracts`
  What to build: `data/samples/offer-letter.ts` (non-compete trips every heuristic: 5-year duration, worldwide scope, "any role in the industry," zero compensation, no garden leave — the video's villain), `training-agreement.ts` (TRAP: interest accrual, employer-discretion "qualifying separation," repayment measured from hire date, intimidating dollar amount), `nda.ts` (unlimited duration, covers public knowledge, no residuals carve-out, one-way). Structurally authentic furniture (recitals, definitions, numbered headings) to exercise the splitter; ~8–10 clauses, 700–900 words each; fictional companies, US framing, ASCII; one-line editorial landing-card title each (learner's call). NO runtime metadata about expected outcomes — nothing scripted.
  Acceptance: Each card loads in one click into the blurred document view (PRD: 3 samples one click away); splitter handles the furniture correctly (clean clause boundaries, order preserved).
  Verify: Click each of the three cards on the landing page; confirm each renders blurred, split sensibly, with `AwaitingAgent` showing; paste path still works alongside.

- [ ] **7. Decision UI — verdicts, clarity snap, clause threads**
  Spec ref: `spec.md > UI Components > DocumentView` · `ClauseBlock` · `FlagBadge` · `RedlineCard` · `ClauseChat` · `spec.md > lib > ask.ts`
  What to build: `ClauseBlock.tsx` final form (summary line + severity pill header; blur cleared per the derived rule; 500ms ease-out snap-to-clarity tuned for film; `prefers-reduced-motion` → instant), `FlagBadge.tsx` (issue + High/Medium/Low pill + one-line reason), `RedlineCard.tsx` (original span ink-red-underlined in clause text; strike-and-propose `~~original~~ → proposed` + reason + **Keep as-is** / **Redline it** verdict buttons, both always available, revisable), `ClauseChat.tsx` (agent notes + verdict history thread, collapsed by default; "ask about this" copies the grounded clause-anchored prompt via `lib/ask.ts`), `DocumentView.tsx` completion banner + email CTA when `reviewComplete`, honest reversal on reopened verdicts.
  Acceptance: Clean clauses snap clear on agent pass; flagged stay blurred until every redline decided; per-redline verdicts (adopt duration / keep geography works); decisions revisable any time; banner appears when all decided and reverts honestly on reopen (PRD: Deciding Redlines epic); every clause carries "ask about this" at all times.
  Verify: Run the full agent pass on the offer letter; decide redlines mixed ways; watch clauses snap in ~500ms; reopen a decision and confirm the banner disappears; confirm "ask about this" copies a prompt containing clause text + current flags.

- [ ] **8. Email composer + EmailView**
  Spec ref: `spec.md > Email Composer` · `spec.md > UI Components > EmailView`
  What to build: `lib/email.ts` pure function (store state → email text; one paragraph per clause with ≥1 adopted redline, covering only adopted changes; partial-dispute = full paragraph; friendly-collaborative tone; placeholders `[Your Name]` / `[Company]` / `[Hiring Manager Name]`; zero adopted redlines at true `reviewComplete` → warm offer-acceptance email), `EmailView.tsx` (reachable from first assessment as a quiet affordance, labeled in-progress mid-review, center stage via banner; copy button with confirmed-copied feedback).
  Acceptance: Email always reflects current decision state including after changed decisions; kept redlines omitted; acceptance email only at true reviewComplete with zero adopted (PRD: The Negotiation Email epic).
  Verify: Adopt one redline → paragraph appears in EmailView; change the verdict → email updates; adopt nothing + finish → acceptance email; copy → confirmed-copied feedback shows.

- [ ] **9. export_negotiation_email tool**
  Spec ref: `spec.md > WebMCP Tool Layer > Analysis tools > export_negotiation_email`
  What to build: Register the export tool with input `{yourName?, company?, hiringManagerName?}` (placeholders when omitted); returns composed email text by calling the same `lib/email.ts` the page uses — they can never disagree. Partial state mid-review; acceptance email only at true `reviewComplete` with zero adopted redlines.
  Acceptance: Agent-requested email is character-identical to what EmailView shows for the same state (PRD: agent's work product becomes the user's negotiation).
  Verify: In ChatGPT Desktop, ask the agent for the negotiation email; diff against EmailView content — must match; test mid-review (labeled in-progress state reflected) and the all-kept completion case.

- [ ] **10. Deployment — learner runs it personally**
  Spec ref: `spec.md > Runtime & Deployment` · `spec.md > Dependencies & External Services`
  What to build (learner-driven, coach guides): `npm run build` → `wrangler deploy` to Cloudflare Workers static assets on the custom domain (already on Cloudflare DNS). Chrome Origin Trial: enroll the domain, add trial token as `<meta>` tag, **verify token validity covers Sep 3** (spec open issue #3). Confirm HTTPS secure context (WebMCP requirement). This is the learning goal — walk through what wrangler is doing.
  Acceptance: Live URL serves the app over HTTPS on the custom domain; WebMCP works in Chrome 149 with no flags (origin trial token); both test targets reachable.
  Verify: Open the live URL in a plain browser (app + no-WebMCP explainer render), in Chrome with the flag, and in ChatGPT Desktop; `wrangler deploy` output shows the custom domain; origin-trial token date range confirmed past Sep 3.

- [ ] **11. GitHub repo — public + licensed**
  Spec ref: `scope.md > What "Done" Looks Like` · `spec.md > File Structure` (README)
  What to build: Create the GitHub repo, add remote, push full history (per-item commits from items 1–10 are the visible work). Add MIT LICENSE file (visible OSS license is a Devpost requirement) + a real README (what it is, the WebMCP tool table, how to run/deploy, link to live URL). Confirm repo visibility is public.
  Acceptance: Public repo URL live with commit history, LICENSE visible, README rendering.
  Verify: Open the repo in an incognito browser — no auth wall, LICENSE and README visible at the root, commit history shows the per-item cadence.

- [ ] **12. End-to-end demo run, video assets, and Devpost submission**
  Spec ref: `prd.md > What We're Building` · `scope.md > What "Done" Looks Like`
  What to build: (a) Full rehearsal pass of the demo arc — click-path checklist: open app → click offer letter → open ChatGPT Desktop → "review this contract" → watch blur/awaiting-agent → agent extracts + flags (villain non-compete) → decide redlines mixed (adopt duration, keep geography) → clauses snap clear → completion banner → email → copy. Confirm both test targets. (b) Coach drafts the <3min narration script + shot list (arc from scope.md: offer received → 22 pages of dread → paste → blur → agent analysis → human verdicts → clarity snap → negotiation email); learner generates the AI shots, records the screen capture using the rehearsal click-path, and publishes to YouTube with audio. (c) Devpost submission: tagline ("the agent reads the fine print; the app gives it eyes and hands inside the document — and the human keeps the pen"), project story from scope.md/prd.md, built-with tags (React, TypeScript, WebMCP, Cloudflare Workers), four screenshots (landing / blurred+awaiting-agent / flagged clause with redline cards / final email), docs artifacts, public repo link, live URL, YouTube video link. Submit.
  Acceptance: Definition of done from scope.md: live URL working in ChatGPT's in-app browser AND Chrome; public repo with visible OSS license; <3min public YouTube video with audio following the arc; landing page with samples one click away; free-paste working. Submission live on Devpost with all required fields complete.
  Verify: Watch your own video start to finish — does it make a stranger want to try the app? Open the Devpost page and confirm the "Submitted" state; click every link (repo, live URL, video) from an incognito window.
