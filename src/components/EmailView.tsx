import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../lib/clipboard";
import { composeEmail } from "../lib/email";
import { reviewComplete } from "../state/select";
import { useSession } from "../state/session";

export function EmailView() {
  const { session } = useSession();
  const doc = session.document;
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!doc) return null;

  const complete = reviewComplete(session);
  const redlines = doc.clauses.flatMap((clause) => clause.redlines);
  const decided = redlines.filter((redline) => redline.verdict !== "undecided").length;
  const text = composeEmail(doc);

  const copy = async () => {
    const done = await copyToClipboard(text);
    if (!done) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="email">
      <div className="email__bar">
        <h2 className="email__title">Your negotiation email</h2>
        <span
          className={`email__status${complete ? " email__status--ready" : ""}`}
          aria-live="polite"
        >
          {complete
            ? "Ready to send"
            : redlines.length > 0
              ? `In progress — ${decided} of ${redlines.length} decisions made`
              : "In progress — review underway"}
        </span>
        <button type="button" className="email__copy" aria-live="polite" onClick={copy}>
          {copied ? "Copied" : "Copy email"}
        </button>
      </div>
      <pre className="email__body">{text}</pre>
      <p className="email__note">This draft updates live with your decisions.</p>
    </div>
  );
}
