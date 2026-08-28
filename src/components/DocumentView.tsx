import { useSession } from "../state/session";
import { AwaitingAgent } from "./AwaitingAgent";
import { ClauseBlock } from "./ClauseBlock";

export function DocumentView() {
  const { session, dispatch } = useSession();
  const doc = session.document;
  if (!doc) return null;

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
      <div className="document__body">
        {doc.clauses.map((clause) => (
          <ClauseBlock key={clause.id} clause={clause} />
        ))}
      </div>
      {session.phase === "awaiting-agent" && <AwaitingAgent />}
    </main>
  );
}
