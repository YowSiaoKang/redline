# Redline — Product Requirements

> Normal people get what lawyers have.

## Problem Statement

The job candidate with an offer in hand — no lawyer, 48 hours to sign — faces 22 pages of employment agreement they can't evaluate. Employment lawyers bill $300–500/hour; the alternative is signing blind, and roughly 30% of US workers are bound by non-competes while unenforceable clauses still intimidate people into obedience. Legalese is a power asymmetry; Redline is the counterweight: an agent reads the fine print, the app gives it eyes and hands inside the document, and the human keeps the pen.

Primary jurisdiction for enforceability reasoning: **US**. Ship deadline: **Sep 3, 2026, 1pm PT**.

## User Stories

### Loading a Contract

- As a **judge opening the app cold**, I want a first screen that shows sample contracts one click away, a free-paste box, and three plain instructions — paste a contract, open my AI assistant and ask it to review, decide the redlines and copy my email — so that I know exactly what to do even though the intelligence lives outside the page.
  - [ ] First screen shows 3 sample contracts (offer letter with overbroad non-compete, training agreement with TRAP clauses, NDA with poisoned confidentiality), each loadable in one click
  - [ ] Free-paste box is prominent; pasting and submitting renders the contract blurred
  - [ ] The three usage instructions are visible without scrolling past the fold
  - [ ] Paste of non-contract text (grocery list, lorem ipsum) produces a friendly, funny message — e.g. "That's not a contract. Nice grocery list though." — and an invitation to try again, not an error dialog

- As a **skeptical judge**, I want blurred text to be peekable on hover, so that I can verify it's a real document and not a prop.
  - [ ] All contract text starts blurred
  - [ ] Hovering any blurred span reveals it while hovered

### Agent Analysis

- As a **judge who hasn't noticed their agent yet**, I want a visible "waiting for your agent" state with gentle instructions, so that I understand the page expects my ChatGPT or Chrome agent to act, without being nagged.
  - [ ] After paste, the whole document stays blurred behind a "waiting for your agent" state with a one-line instruction to open their assistant and ask for a review
  - [ ] The state resolves the moment the agent first acts through the app's tools
  - [ ] The tone is calm, not pushy — no blinking, no countdown, no repeated prompts

- As a **judge**, I want the agent to extract the contract into clauses and assess each one, so that I can review section by section instead of 22 pages at once.
  - [ ] Clauses are surfaced in original document order, which never changes
  - [ ] Each clause gets a plain-English one-line summary of what it means
  - [ ] A clause the agent finds unproblematic snaps into clarity as soon as it's cleared
  - [ ] A clause with issues stays blurred and shows: the issue flagged, a severity level (High / Medium / Low), a one-line reason, and one or more proposed redlines
  - [ ] One clause can carry multiple redlines (e.g. a non-compete with both excessive duration and unlimited geography)
  - [ ] Each redline proposes concrete revised language — a replacement or a removal — and carries its own one-line reason
  - [ ] The seven clause families in scope: non-compete, training repayment agreement (TRAP), invention assignment, forfeiture-for-competition, garden leave, non-solicitation/antipiracy, unlimited-scope NDA

### Deciding Redlines

- As a **judge**, I want to render a verdict on each redline separately — "Keep as-is" (this clause is fine as written) or "Redline it" (adopt the proposed change) — so that the decision rights stay mine, issue by issue.
  - [ ] Every redline exposes both verdicts at all times
  - [ ] "Keep as-is" on a redline accepts the original language; when all of a clause's redlines are kept, the clause snaps into clarity
  - [ ] "Redline it" adopts the proposed language; the clause shows its redlined state and the change flows into the negotiation email
  - [ ] Decisions are per-redline: adopting duration but keeping geography is a normal, supported outcome
  - [ ] Every decision can be changed at any time, including after the "all decided" moment; the email always reflects current state

- As a **judge who wants to understand before deciding**, I want a back-and-forth conversation about any flagged clause, so that I can drill in — "why is 5 years too long?" "what's the industry norm?" — before committing.
  - [ ] Every flagged clause offers an "ask why" affordance that opens a real conversation with the agent, anchored to that clause
  - [ ] Follow-up questions are supported; answers stay visible in the context of the clause

- As a **suspicious judge**, I want a persistent "ask about this" affordance on every clause — clean or flagged — so that I can challenge even text the agent cleared.
  - [ ] Every clause in the document carries "ask about this" at all times
  - [ ] If the agent changes its mind under questioning, a new redline appears on the previously-clean clause immediately

- As a **judge finishing the review**, I want a clear "all redlines decided" moment, so that I know the review is complete and it's time for the email.
  - [ ] When every redline has a verdict, a completion state appears with a call-to-action into the email step
  - [ ] Reopening a decision after this moment returns the app to the in-progress state honestly — the moment can re-trigger

### The Negotiation Email

- As a **judge who redlined clauses**, I want a negotiation email drafted from my decisions — friendly-collaborative in tone, one paragraph per disputed clause containing the adopted proposed language — so that my agent's work product becomes my negotiation, ready to send.
  - [ ] Email uses placeholders: [Hiring Manager Name], [Company], [Your Name]
  - [ ] One paragraph per clause with at least one adopted redline; the paragraph covers just the adopted changes (kept redlines are omitted)
  - [ ] A partially-disputed clause (one of two redlines adopted) still appears as a full paragraph
  - [ ] Tone is friendly-collaborative: excited about the role, asking to align on a few terms
  - [ ] The email always reflects current decision state, including after changed decisions

- As a **judge who kept every clause as-is**, I want an offer-acceptance email instead, so that the final step is worth completing either way.
  - [ ] Zero adopted redlines produces a warm offer-acceptance email with the same placeholders
  - [ ] The email is delivered by copy-paste — a clear copy affordance with confirmed-copied feedback

### Trust & Privacy

- As a **judge assessing credibility**, I want honest positioning — "not legal advice" and a plain statement of what data goes where — so that I trust the tool enough to use it.
  - [ ] "Not legal advice" is stated visibly on the first screen
  - [ ] The privacy line is stated: the document lives in the browser session; only what the tools return reaches the agent platform
  - [ ] The session lives in memory — a refresh is a clean start, and the app doesn't pretend otherwise

## What We're Building

The complete behavior inventory, by epic (detailed acceptance criteria live in the stories above):

1. **Loading a Contract** — landing screen with instructions, three overbroad sample contracts, free paste, blur rendering, hover-to-peek, funny not-a-contract state
2. **Agent Analysis** — waiting-for-agent state, clause extraction, per-clause summary, clean-clause clarity, flag + severity + reason + redline rendering across all seven clause families
3. **Deciding Redlines** — per-redline "Keep as-is" / "Redline it" verdicts, per-clause "ask why" back-and-forth, persistent "ask about this" on every clause, agent-spawned redlines on clean clauses, full decision revisability, "all redlines decided" moment
4. **The Negotiation Email** — decisions-driven draft with placeholders, friendly-collaborative tone, offer-acceptance fallback at zero redlines, copy-paste delivery
5. **Trust & Privacy** — not-legal-advice and privacy framing, in-memory session

Non-negotiable demo property: the three samples are *drafted* cartoonishly overbroad so any competent model flags them, but nothing is hardcoded or scripted — the app accepts whatever a good model produces. Build-time verification confirms the video arc works on a real run.

## What We'd Add With More Time

- **PDF/DOCX upload & parsing** — the obvious next ingestion step; paste-only is the hackathon cut
- **Session persistence** — pick up mid-review after refresh; nice, not needed for judging
- **Severity-ordered summary tray** — a flagged-clauses index that jumps to each clause; document order wins for now
- **Hand-curated enforceability data for the other five families** — deep state profiles like non-compete's, beyond reasonableness heuristics
- **Email send integrations** — mailto: handoff or webmail deep links beyond copy-paste
- **Non-English contracts** — the pipeline should degrade gracefully, but English-only is the tested case
- **A jurisdiction selector** — beyond "US default"

## Non-Goals

- **No PDF/DOCX upload** — parsing is a swamp; the product is the review, not ingestion. Paste text only.
- **No accounts, auth, or persistence** — in-memory session; refresh is a clean start. Judges test with zero friction and no stale state during demos.
- **No free-form editing of contract text** — approve/adopt agent redlines only. The decision-rights loop IS the product; an editor buries it.
- **No scripted or hardcoded analysis outcomes** — even for sample contracts. The demo arc is earned by drafting extreme samples, not by faking results.
- **No multi-document management, version history, or diffs** — one document, one linear flow.
- **No hand-curated enforceability data beyond non-compete (deep US state profiles) and TRAP (key states)** — the other five families are assessed through reasonableness heuristics (duration > 2 years? unlimited geography? no compensation?).

## Open Questions

- **Exact visual treatment of redlines** (highlight of risky span + inline proposed language vs. box annotation) — answer at **/spec**
- **Framework and static host choice** (TypeScript frontend; Vercel / Netlify / Cloudflare Pages) — answer at **/spec**
- **WebMCP tool surface and registerTool API shapes** (`extract_clauses`, `get_clause_text`, `get_document_state`, `apply_redline`, `export_negotiation_email`, plus conversational support) — answer at **/spec**
- **Structure of the non-compete state-profile and TRAP data packs** and how reasonableness heuristics are exposed to the agent — answer at **/spec**
- **Sample contract drafting and curation** (agent-drafted, learner-curated; extreme enough to guarantee flags in practice) — requirements at **/spec**, drafting during build
- **Video production details** (AI video tooling per learner's interest, narration script) — can wait until build
