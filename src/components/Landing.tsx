import { useState, type FormEvent } from "react";
import { sampleContracts, type SampleContract } from "../data/samples/stub";
import { splitClauses } from "../lib/clause-splitter";
import { looksLikeContract, titleFromText } from "../lib/contract-check";
import { useSession } from "../state/session";
import { NotAContractMsg } from "./NotAContractMsg";
import { NoWebMCP } from "./NoWebMCP";

const steps = [
  {
    title: "Load a contract",
    note: "Pick a sample below, or paste your own.",
  },
  {
    title: "Open your AI assistant",
    note: "ChatGPT Desktop, or your browser\u2019s agent \u2014 and ask it to review.",
  },
  {
    title: "Decide each redline",
    note: "Your negotiation email writes itself as you go.",
  },
];

export function Landing({ webMcpAvailable }: { webMcpAvailable: boolean }) {
  const { dispatch } = useSession();
  const [draft, setDraft] = useState("");
  const [rejected, setRejected] = useState(false);

  function loadSample(sample: SampleContract) {
    dispatch({
      type: "DOCUMENT_LOADED",
      title: sample.title,
      source: { kind: "sample", sampleId: sample.id },
      rawText: sample.text,
      clauses: splitClauses(sample.text),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!looksLikeContract(draft)) {
      setRejected(true);
      return;
    }
    dispatch({
      type: "DOCUMENT_LOADED",
      title: titleFromText(draft),
      source: { kind: "paste" },
      rawText: draft,
      clauses: splitClauses(draft),
    });
  }

  function handleTryAgain() {
    setRejected(false);
    setDraft("");
  }

  return (
    <main className="landing">
      {!webMcpAvailable && <NoWebMCP />}
      <section className="landing__hero">
        <p className="landing__kicker">WebMCP contract-review studio</p>
        <h1 className="landing__title">Redline</h1>
        <p className="landing__tagline">Normal people get what lawyers have.</p>
        <div className="landing__rule" aria-hidden="true" />
      </section>
      <ol className="steps">
        {steps.map((step, index) => (
          <li key={step.title} className="step">
            <span className="step__num">{index + 1}</span>
            <div>
              <p className="step__title">{step.title}</p>
              <p className="step__note">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="cards" aria-label="Sample contracts">
        {sampleContracts.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="card"
            onClick={() => loadSample(sample)}
          >
            <span className="card__title">{sample.title}</span>
            <span className="card__blurb">{sample.blurb}</span>
            <span className="card__open">Open it</span>
          </button>
        ))}
      </section>
      {rejected ? (
        <NotAContractMsg onTryAgain={handleTryAgain} />
      ) : (
        <form className="paste" onSubmit={handleSubmit}>
          <label className="paste__label" htmlFor="paste-box">
            Or paste your own
          </label>
          <textarea
            id="paste-box"
            className="paste__box"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Paste a contract here &mdash; an offer letter, an NDA, a lease&hellip;"
          />
          <button
            type="submit"
            className="paste__submit"
            disabled={draft.trim().length === 0}
          >
            Load contract
          </button>
        </form>
      )}
      <footer className="footnote">
        Not legal advice. Your document lives in your browser session; only
        what the tools return reaches your agent.
      </footer>
    </main>
  );
}
