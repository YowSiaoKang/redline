import { useSession } from "../state/session";
import { reviewComplete } from "../state/select";
import { AwaitingAgent } from "./AwaitingAgent";
import { ClauseBlock } from "./ClauseBlock";

interface DocumentViewProps {
  onComposeEmail?: () => void;
}

export function DocumentView({ onComposeEmail }: DocumentViewProps) {
  const { session, dispatch } = useSession();
  const doc = session.document;
  if (!doc) return null;

  const complete = reviewComplete(session);

  return (
    <main className="document">
      <header className="document__head">
        <h1 className="document__title">{doc.title}</h1>
        <button
          type="button"
          className="document__start"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Start over
        </button>
      </header>
      {complete && (
        <section className="completion" aria-live="polite">
          <h2 className="completion__title">All redlines decided.</h2>
          <p className="completion__note">
            Every clause now carries your verdict &mdash; your negotiation email is ready.
          </p>
          <a className="completion__cta" href="#email" onClick={() => onComposeEmail?.()}>
            Compose email
          </a>
        </section>
      )}
      <div className="document__body">
        {doc.clauses.map((clause) => (
          <ClauseBlock key={clause.id} clause={clause} dispatch={dispatch} />
        ))}
      </div>
      {complete && (
        <section id="email" className="document__emailstub" aria-label="Negotiation email">
          <p>The negotiation email takes shape here.</p>
        </section>
      )}
      {session.phase === "awaiting-agent" && <AwaitingAgent />}
    </main>
  );
}
