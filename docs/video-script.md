# Item 12 — Rehearsal, Video, Devpost

Coach-drafted rehearsal click-path + narration script + shot list.
Learner does: AI shots, screen recording, YouTube upload, Devpost submission.

---

## 1. Rehearsal click-path (run it twice before recording)

Setup: 1440px-wide browser window, bookmarks bar hidden, clean desktop, agent window (Chrome side panel or ChatGPT Desktop) docked beside the page. In-memory session = refresh is always a clean start between takes.

- [ ] **Path check A — stock Chrome, no flags, no Canary.** Open https://redline.kangyow.workers.dev/ in plain Chrome 149+. The NoWebMCP explainer should NOT show. This confirms the origin-trial token activates WebMCP for judges. If the explainer shows, the token isn't live for your Chrome build — record on Canary/flag instead and note it, but investigate first (hard-reload, check chrome://version is 149+).
- [ ] **Path check B — ChatGPT Desktop retry.** Open the live URL there, ask the agent to check document state. If it still can't connect, that's a platform limitation — note it in the Devpost story ("tested on WebMCP-native Chrome; ChatGPT Desktop connect failed on this URL") and move on. Chrome is the primary judging path.
- [ ] **Full arc (the recording script):**
  1. Land on the app. Pause 2s. (Three instructions + sample cards visible.)
  2. Click **The Offer Letter**. Document renders blurred, "Waiting for your agent" shows.
  3. In the agent: **"Review this contract."**
  4. Watch: agent calls tools (document state, extract, enforceability), clauses snap clear one by one, the non-compete (6.1) flags High with the RCW 49.62-grounded reason.
  5. Decide mixed: **Redline it** on the 5-year/worldwide duration; **Keep as-is** on geography; **Reset decision** on one redline and re-decide it (shows revisability).
  6. All decided → completion banner → email with Current/Proposed blocks → **Copy** → "Copied" feedback.
  7. (Optional beat, if time allows: refresh → clean start → this time **Keep as-is** everything → acceptance email variant.)
- [ ] **Capture the four Devpost screenshots during this run:**
  1. Landing (instructions + three sample cards)
  2. Blurred document + "waiting for your agent"
  3. Flagged non-compete clause — severity pill, flag badge, redline card with verdict buttons
  4. Final email with the Current/Proposed blocks

---

## 2. Narration script (target 2:35–2:50, ~430 words)

Voice: calm, competent, plain-spoken. "A sharp friend who happens to know employment law." No filler words; every line lands on a visual.

**[S1 — 0:00–0:15] (AI shot)**
> You got the offer. The salary is great, the team seems great, and the contract is twenty-two pages of fine print you have forty-eight hours to sign. A lawyer costs four hundred dollars an hour. Guessing is free — until it isn't.

**[S2 — 0:15–0:35] (screen)**
> This is Redline. Paste the contract — or open a sample — and the document loads exactly the way it feels: blurred. One wall of dread. But this page has a trick — it speaks WebMCP.

**[S3 — 0:35–0:55] (screen)**
> Open your AI assistant and just say: review this contract. No API keys, no backend — the agent works directly through tools the page registers in your browser. That's the whole WebMCP idea, taken seriously.

**[S4 — 0:55–1:25] (screen)**
> The agent reads every clause in order. Clean clauses snap into clarity as it goes. And the risky ones stay blurred — flagged with severity and reasons grounded in real enforceability data. Here's the villain: a five-year, worldwide non-compete — for a hundred-and-twenty-eight-k job in Seattle. Washington law is not impressed, and now the app says so, with the citation.

**[S5 — 1:25–1:55] (screen)**
> Every redline gets a verdict, and the decision is yours, one by one. Adopt the duration fix. Keep the geography. Change your mind whenever you want. This is the part that matters: the agent proposes, the human decides. You keep the pen.

**[S6 — 1:55–2:20] (screen)**
> As you decide, your negotiation email writes itself — current language against proposed, side by side, in a tone you'd actually send. One click to copy. The agent's work product just became your negotiation.

**[S7 — 2:20–2:40] (AI shot + endcard)**
> Normal people get what lawyers have. Redline is live — paste your own contract, or try one of the three villains. Built on WebMCP: the agent reads the fine print, and the app gives it eyes and hands inside the document.

---

## 3. Shot list

| # | Time | Type | Content | Notes |
|---|---|---|---|---|
| S1 | 0:00–0:15 | AI-generated | Offer email on a laptop; face brightens; dread as the 22-page document loads | Your AI-video step; generate 2–3 variants, pick the one that reads in 3s |
| S2 | 0:15–0:35 | Screen | Landing → paste/click offer letter → blurred document + waiting state | Straight from click-path steps 1–2 |
| S3 | 0:35–0:55 | Screen | Agent window beside page: "Review this contract." | Show both panes — the WebMCP story is the differentiator |
| S4 | 0:55–1:25 | Screen | Agent pass; clauses snapping clear; villain flagged High | The 500ms clarity snap is the cinematic signature — don't speed this up |
| S5 | 1:25–1:55 | Screen | Mixed verdicts, reset-and-re-decide, snap on final decision | Show "Reset decision" briefly — revisability is a scored feature |
| S6 | 1:55–2:20 | Screen | Completion banner → email blocks → Copy → "Copied" | Email blocks show Current/Proposed — hold 3s on the diff |
| S7 | 2:20–2:40 | AI-generated + endcard | Pen on paper / signing imagery → endcard: URL + tagline | Endcard: redline.kangyow.workers.dev · "Normal people get what lawyers have." |

Production notes: 30fps screen capture minimum (the blur transition needs it); record at 1920×1080 or higher; keep the agent visible in S3–S4 (judges score WebMCP leverage from what they can see); YouTube needs audio — narration is the audio.

---

## 4. Devpost submission copy (paste-ready)

- **Tagline:** The agent reads the fine print; the app gives it eyes and hands inside the document — and the human keeps the pen.
- **Built with:** React, TypeScript, WebMCP, Cloudflare Workers
- **Links:** Live — https://redline.kangyow.workers.dev/ · Repo — https://github.com/YowSiaoKang/redline · Video — (after upload)
- **Story skeleton (expand in your voice):** the problem (22 pages, no lawyer, 48 hours; ~30% of US workers bound by non-competes) → the idea (agent as analyzer via WebMCP tools; human keeps decision rights) → how it's built (7 client-side tools via `document.modelContext.registerTool`, phase-gated dynamic registration, live-ref state, derived clarity rule, no backend/keys, enforceability data packs) → the demo arc → what's honest (no scripting: the samples are drafted overbroad, but the app accepts whatever a good model produces) → the docs in the repo are the full spec-driven journey (scope → PRD → spec → checklist).
- **Screenshots:** the four from the rehearsal.
