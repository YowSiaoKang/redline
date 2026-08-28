# Process Notes

## /onboard

- **Who they are:** Developer; joined to build and learn high-demand industry skills through hackathons.
- **Technical experience:** CS degree, Python primary. No framework preference — delegates framework choice to agent based on project fit. Prior AI coding agent experience.
- **Learning goals:** Master the full develop-and-deploy lifecycle — end-to-end shipping, not just coding.
- **Creative sensibility:** Interested in AI video creation/generative media — potential project direction signal.
- **Prior SDD experience:** Yes (informal). Don't over-explain planning concepts; focus on tradeoffs and speed.
- **Energy/engagement style:** Brief, direct answers; moves fast. Match with brisk pace — minimal hand-holding, substantive coaching.

## /scope

- **Context:** Entered with no idea; brought the OpenAI WebMCP Challenge (Devpost) as the target. Deadline Sep 3, 1pm PT (~6 days from Aug 28). Solo build.
- **Research findings:** Travel is Google's official WebMCP demo (travel-demo.bandarra.me) — trip planning is saturated. E-commerce/ticketing equally canonical. WebMCP spec read (webmachinelearning/webmcp): human-in-the-loop is the standard's DNA; tools are client-side `document.modelContext.registerTool()`; dynamic tool registration + iframe/multi-agent support (`exposedTo`, `getTools`/`executeTool`) are underused differentiators. Rules digested: <3min YouTube video with audio, public repo w/ visible OSS license, live URL, **judges may judge from video/text alone without testing**.
- **Idea evolution:** AI-video sparks → non-video preferred; trip planning (learner's instinct) killed as canonical demo; "logistics juggling" itch → multi-party agent coordination (my top pitch) — learner rejected it; nine niche coordination scenarios offered; learner asked for judging-criteria-driven options → four concepts pitched → **chose Redline Studio** (contract/lease review: agent extracts clauses, flags risk, proposes inline redlines human accepts/rejects).
- **Pushback pattern:** Learner verifies before committing — asked "is this novel?", "is it just a frontend?", "it's not meta-tool generation, right?", requested reading the spec repo and rules. Shared research proactively, accepted challenges. Dropped coordination decisively despite my advocacy — driver, not passenger.
- **Architecture consensus:** Frontend owns all WebMCP tools; thin backend/sync layer allowed; deployed live; text-based app chosen partly for 6-day feasibility and video-first judging.

### /scope — Outcome

- **Idea evolution (full arc):** no idea → AI-video sparks (rejected: wanted non-video) → trip planning (killed: Google's canonical WebMCP demo) → "logistics juggling" itch → multi-party agent coordination (my top pitch; learner rejected it) → nine niche coordination scenarios → judging-criteria-driven four-concept pitch → **Redline Studio** → named **Redline**.
- **Chosen concept:** employment-contract review studio; agent extracts clauses/flags risk/proposes inline redlines; human accept/reject per redline; accepted changes → negotiation email. Blur-to-clarity signature mechanic. Demo villain: overbroad non-compete; secondary: TRAP.
- **Pushback the learner received & response:** I proposed shallow treatment for 6/7 clause families; learner pushed back on coherence grounds ("product is coherent? No?") — **learner was right**: agent-as-analyzer architecture makes uniform coverage nearly free; I conceded and tiered only the hand-built data packs instead.
- **References that resonated:** softlabor.biz — learner brought it unprompted and adapted the hover-blur into the blur-to-clarity progress mechanic (their idea, the product's signature moment). Non-compete research (Wikipedia + stats) anchored persona and stakes.
- **Deepening rounds:** 1 round (5 questions). Surfaced: demo arc beat-by-beat (opens on person receiving offer; final frame = negotiation email sent → email composer promoted from stretch to core); design language (paper-white/ink-red, editorial); emotional hook ("normal people get what lawyers have" — democratization voice); name (Redline); sample contracts agent-drafted + learner-curated.
- **Active shaping:** learner drove direction throughout — rejected coordination decisively, demanded rules/spec reading before committing, overturned my clause-family cut, chose the blur mechanic, picked the video's opening and closing frames. Verified-before-committing pattern held: asked "is this novel?", "frontend only?", "not meta-tools, right?" — each pinned real understanding, not box-checking.

## /prd

- **Deepening rounds:** 1 round (5 questions) after 5 mandatory beats. Surfaced: per-redline decision granularity (vs per-clause), the cold-start/"waiting for your agent" state, demo-reliability stance, document-order-sacred + "all redlines decided" moment, and the persistent "ask about this" affordance on every clause.
- **Key decisions & why:**
  - **"Keep as-is" / "Redline it"** replaces accept/reject-the-redline — learner spotted the terminology trap themselves (accepting a redline ≠ accepting the clause); verdict is on the clause, email collects adopted changes.
  - **Clarity mechanic refined:** clean clauses snap clear as the agent clears them; flagged ones stay blurred until decided — progress bar is now two-trigger (agent pass + human verdicts).
  - **Per-redline verdicts**, partially-disputed clause = full email paragraph covering only adopted changes.
  - **Refresh = clean start** (in-memory session) — learner simplified away scope's localStorage; judge-proof, no stale demo state. Logged as non-goal.
  - **No scripted outcomes** — "accept whatever a good model produces"; reliability comes from drafting samples cartoonishly overbroad, not hardcoding.
  - **Zero-redline email case → offer-acceptance email** (learner's call) — the closer is always worth sending.
  - **Peekable-on-hover blur** — skeptics can verify the text is real.
  - **Funny garbage-paste copy** — learner wants humor in error states.
- **Coach contributions learner accepted:** per-clause plain-English summary before decision UI; usage instructions on first screen (WebMCP cold-start is an adoption risk); "all decided" moment tied to email CTA.
- **Pushback/struggle:** naming collision (accept redline vs accept clause) caused visible confusion — resolved collaboratively, learner picked from three options. Otherwise fast, decisive, no stalls.
- **Open items handed to /spec:** redline visual treatment, framework/host, tool surface + API shapes, data-pack structure, sample-contract requirements.

### /prd — Outcome

- **Artifact:** `docs/prd.md` — problem statement, 5 epics (Loading a Contract, Agent Analysis, Deciding Redlines, The Negotiation Email, Trust & Privacy) with story-level acceptance criteria, behavior inventory, 7 with-more-time items, 6 non-goals, 6 open questions routed to /spec or build.
- **Deepening rounds total:** 1. Pattern held: brisk answers, strong opinions on UX/semantics, delegates visual/implementation detail to agent.

## /spec

- **Stack decisions & rationale:** React 19 + Vite + TS (boring frontend on purpose — WebMCP is client-side JS, learner delegated framework choice); no state library (context+reducer, in-memory session aligns with refresh=clean-start non-goal); vanilla CSS over Tailwind (bespoke editorial aesthetic); Cloudflare **Workers static assets** over Pages (research caught Cloudflare steering new projects to Workers — better industry-skill fit for learner's deployment goal); custom domain already on Cloudflare DNS. Hosting is learner-run for the learning goal.
- **Research findings shared:** WebMCP native in ChatGPT Desktop; Chrome 149 Origin Trial live (+ flag fallback); `registerTool`/`getTools`/`executeTool`/`toolchange` API shapes confirmed; `webmcp-types` npm package; MCP-style tool returns; secure-context requirement → HTTPS via custom domain.
- **Key architectural moves:** derived clarity rule (two-trigger blur mechanic = one expression); tools→actions→store→UI single direction; tools read store via live ref (stale-closure trap named in spec); phase-gated dynamic registration (base tool at boot, analysis suite on document load); tool descriptions as prompt surface (only steering we control — no system-prompt access, no LLM keys); "ask why" as copyable grounded prompt (page can't call the agent — platform constraint honored, learner confirmed).
- **Deepening rounds:** 1 round (5 questions). Surfaced: error strategy (no-WebMCP detection screen — biggest cold-start risk, accepted; honest blur for agent stalls; no spinners), Chrome origin-trial enrollment (flag-free judging, accepted), email reachable from first assessment with honest partial state (acceptance only at true reviewComplete), the three landing instruction lines + named-agents overlay (learner delegated copy to me), film-tuned 500ms clarity transition + reduced-motion + 1440px reference frame.
- **Active shaping:** unlike /scope and /prd, learner accepted every proposal wholesale this session ("sounds good"/"good" cadence) — high trust, low friction; the one substantive design reaction I solicited (ask-why cut) was confirmed without modification. Copy detail (instructions, titles) explicitly delegated. Consistent with profile: strong opinions on product semantics, hands implementation detail to the agent.
- **Spec self-review surfaced (open issues in spec.md):** splitter/agent disagreement (no merge verb — accepted tradeoff), contradictory duplicate redlines on same span (both cards, judge picks), origin-trial token validity past Sep 3 (verify at build), ChatGPT judges may skip landing (base tool covers it).

### /spec — Outcome

- **Artifact:** `docs/spec.md` — stack, runtime/deployment (incl. origin-trial enrollment), architecture overview + redline lifecycle diagram, state layer, 7-tool WebMCP surface with API shapes, clause splitter, enforceability data packs, 10 UI components, email composer, sample-contract requirements, data model (TS interfaces), annotated file tree, 5 key technical decisions, dependencies with doc links, 4 open issues. Every component heading is a /checklist address; PRD epics cross-referenced throughout.

## /checklist

- **Sequencing logic (agreed):** scaffold → store → landing/splitter/blur → WebMCP vertical slice (risk gate) → analysis tools + data packs → samples → decision UI → email composer + EmailView → export tool → deployment (learner-run) → GitHub → demo/video/Devpost. Rationale: store is the contract everything plugs into; WebMCP platform behavior is the biggest unknown → vertical slice early; deploy/GitHub explicit items per learner's end-to-end learning goal.
- **Methodology chosen:** Autonomous mode (locked, no mid-build switching) + build straight through (verification declined) — learner is experienced, trusts the agent, consistent with /spec's "accepted wholesale" pattern. Comprehension checks N/A. Git: commit after each item (`Complete step N: [title]`), commits are revert points.
- **One exception negotiated:** single learner pause at item 4 — the WebMCP round-trip needs a human driving ChatGPT Desktop; without it, platform surprises surface at hour five instead of hour two. Encoded in checklist header + item 4 verify.
- **12 items total**, each nominally 15–30 min (~4–6 hrs build time against a ~6-day window — ample margin).
- **Confident vs guided:** decisive and fast on sequencing and granularity ("keep them" on big items 5/7, "keep deployment as one item"); accepted all coach framing without counter-proposals. Active shaping was lower than /scope//prd this session — learner validated coach's plan rather than reshaping it, except the git-init catch (below).
- **Deepening rounds:** 1 round (5 questions). Surfaced: kept heavy items whole (autonomous-mode timer softer); item-4 human-pause exception; deployment timing risk (early smoke deploy offered — declined, kept at position 10 with origin-trial validity check in verify); video production split (coach drafts script + shot list + rehearsal click-path; learner generates AI shots); git-init dependency catch — init moved into item 1 so per-item commits work from the start, item 11 slimmed to repo+license+push.
- **Submission planning:** four screenshots mapped to PRD epics; wow moment = blur-to-clarity in motion (learner's AI-video interest engaged); live deploy + public MIT repo already definition-of-done; script/shot-list ownership agreed.
- **Active shaping:** one substantive catch (git init sequencing) — learner spotted the implication of "commit each item" vs item-11 repo creation and approved the fix immediately. Otherwise validation-mode. Noted for /reflect: deepening rounds still paid off (pause exception + rehearsal checklist were coach-surfaced, learner-adopted).

### /checklist — Outcome

- **Artifact:** `docs/checklist.md` — 12-item five-field checklist, autonomous + straight-through header with the item-4 pause exception, per-item spec refs, PRD-derived acceptance criteria, concrete verify steps, Devpost submission as item 12.
