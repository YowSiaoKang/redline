# Redline

> Normal people get what lawyers have.

## Idea

A WebMCP-powered contract review studio: paste an employment contract, and your AI agent — working through the app's registered tools — extracts every clause, flags the risky ones, and proposes inline redlines **you accept or reject one by one**. Accepted redlines roll up into a negotiation email. The document starts blurred and snaps into clarity as you decide: clarity is the progress bar. One line for the submission form: *the agent reads the fine print; the app gives it eyes and hands inside the document — and the human keeps the pen.*

## Who It's For

**The job candidate with an offer in hand — no lawyer, 48 hours to sign.** They face a 22-page employment agreement containing clauses they don't understand and can't afford to have reviewed: employment lawyers bill $300–500/hour; the alternative is signing blind. The problem is documented, not hypothetical — ~30% of US workers are bound by non-competes (nearly half of technical workers), Training Repayment Agreements target nurses and truckers, and research shows *unenforceable* clauses still intimidate people into obedience. Legalese is a power asymmetry; Redline is the counterweight. Primary jurisdiction for enforceability data: US.

## Inspiration & References

**Research map (URLs = downstream context for /prd and /spec):**
- WebMCP spec & explainer: https://github.com/webmachinelearning/webmcp — human-in-the-loop is the standard's DNA; tools are client-side `document.modelContext.registerTool()`; dynamic registration + `getTools`/`executeTool` are underused differentiators
- The challenge: https://webmcp.devpost.com/ — judging: WebMCP Leverage / Execution / Impact / Creativity; deadline Sep 3, 2026 1pm PT; judges may judge from video alone
- Google's canonical travel demo: https://travel-demo.bandarra.me — what every entrant will clone; we differentiate
- Non-compete research base: https://en.wikipedia.org/wiki/Non-compete_clause — stats, clause taxonomy, FTC 2024 ban, behavioral-effects study, Germany 2023 overbreadth ruling
- Design reference: https://www.softlabor.biz/ — editorial calm, warm paper aesthetic, blur-on-text mechanic

**Design energy:** clean warm paper-white, editorial serif calm; **ink-red accents are the only sharp thing on the page** — redlines and stamps. Signature interaction adapted from Soft Labor's hover-blur: contract text loads blurred (the dread of 22 pages), and each clause snaps into focus when its redline is decided. Fonts TBD in /spec; vibe = "a sharp friend who happens to know employment law."

## Goals

- Ship a complete, judge-testable WebMCP app live by **Sep 3, 2026, 1pm PT** (~6 days)
- Score on all four criteria, with edge on **WebMCP Leverage** (thoughtful tool design, dynamic registration) and **Creativity** (no contract-review demo exists in the ecosystem)
- Make the "difficult or impossible before" case undeniable: agent + human co-editing the same live document with split decision rights; the agent's work product becomes the user's negotiation email
- Learning goal: end-to-end deployment experience — real app, real host, real submission

## What "Done" Looks Like

The demo arc films start-to-finish without a hitch, on a sample contract:
1. Open on a person receiving an offer — excitement curdling into 22 pages of dread
2. They paste the contract; the page renders it blurred
3. Agent (via the judge's ChatGPT / Chrome agent, through our tools) extracts clauses and marks risky ones — the **non-compete** gets the villain treatment: flagged, explained, declared likely-overbroad
4. Human decisions: accept/reject each proposed redline; accepted clause text snaps into clarity
5. Final beat: the negotiation email — drafted from accepted redlines — composed and sent/copied

**Definition of done:** live URL working in ChatGPT's in-app browser AND Chrome (`chrome://flags/#enable-webmcp-testing`); public repo with visible OSS license containing real `registerTool` implementations; <3min public YouTube video with audio following this arc; landing page with sample contracts one click away; free-paste path working.

## What's Explicitly Cut

- **PDF/DOCX upload & parsing** — paste text only. Parsing is a swamp; the product is the review, not ingestion.
- **Accounts/auth** — single session, localStorage. Judges test with zero friction.
- **Free-form human text editing** — approve/reject agent redlines only. The decision-rights loop IS the product; an editor buries it.
- **Hand-curated enforceability data for all 7 clause families** — all 7 get the full tool pipeline with agent-reasoned redlines (uniform, coherent), but hand-built state-profile data packs ship only for **non-compete (deep, US state profiles)** and **TRAP (key states)**; the other five are assessed via reasonableness heuristics our tools return (duration > 2 years? unlimited geography? no compensation?).
- **Multi-document management, version history, side-by-side diffs** — one document, one linear flow.
- **Multi-party coordination** (earlier direction, dropped) — different product, different hackathon.

## Loose Implementation Notes

Non-binding; /spec refines and owns these.

- **Architecture:** frontend owns every WebMCP tool; single-session means no backend sync needed → static deploy (Vercel/Netlify/Cloudflare Pages). The agent platform supplies the intelligence — no LLM keys, no analysis API of our own.
- **Agent-as-analyzer pattern:** tools expose document structure and state (`extract_clauses`, `get_clause_text`, `get_document_state`); the agent's model does the legal reading; `apply_redline` writes proposals into the live UI; `export_negotiation_email` composes the closer.
- **Dynamic tool registration:** analysis tools register only after a document loads — progressive disclosure, spec-fluent, visible in the repo for the Leverage criterion.
- **Every redline carries a one-line reason** — displayed with the accept/reject control. Trust is UX.
- **Trust framing:** clear "not legal advice" positioning; privacy line — the document lives in the browser session; only what tools return reaches the agent platform.
- **Sample contracts:** agent-drafted, learner-curated — (1) offer letter with overbroad non-compete (the video's villain), (2) training agreement with TRAP clauses, (3) NDA with poisoned confidentiality terms. Free paste stays fully supported.
- **Stack instinct:** TypeScript frontend (WebMCP is client-side JS); framework chosen in /spec; learner is Python-first — backend surface is minimal by design.
- **Video plan:** arc above; blur-to-clarity transitions are the cinematic signature; narration voice = calm, competent, plain-spoken.
