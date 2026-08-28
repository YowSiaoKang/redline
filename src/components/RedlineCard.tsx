import type { Redline } from "../state/types";

interface RedlineCardProps {
  redline: Redline;
  onVerdict: (verdict: Redline["verdict"]) => void;
}

function proposedLabel(redline: Redline): string {
  if (redline.type === "remove" && redline.proposedText.trim() === "") {
    return "remove this language entirely";
  }
  return redline.proposedText;
}

export function RedlineCard({ redline, onVerdict }: RedlineCardProps) {
  const decide = (verdict: "keep" | "adopt") => {
    if (redline.verdict !== verdict) onVerdict(verdict);
  };

  return (
    <article className="redcard" aria-label={`Redline proposal: ${redline.originalSpan}`}>
      <p className="redcard__diff">
        <s className="redcard__original">{redline.originalSpan}</s>
        <span className="redcard__arrow" aria-hidden="true">
          &rarr;
        </span>
        <span className="redcard__proposed">{proposedLabel(redline)}</span>
      </p>
      <p className="redcard__reason">{redline.reason}</p>
      <div className="redcard__actions">
        <button
          type="button"
          className={`redcard__verdict redcard__verdict--keep${
            redline.verdict === "keep" ? " is-active" : ""
          }`}
          aria-pressed={redline.verdict === "keep"}
          onClick={() => decide("keep")}
        >
          Keep as-is
        </button>
        <button
          type="button"
          className={`redcard__verdict redcard__verdict--adopt${
            redline.verdict === "adopt" ? " is-active" : ""
          }`}
          aria-pressed={redline.verdict === "adopt"}
          onClick={() => decide("adopt")}
        >
          Redline it
        </button>
        {redline.verdict !== "undecided" && (
          <button
            type="button"
            className="redcard__undecide"
            onClick={() => onVerdict("undecided")}
          >
            Reset decision
          </button>
        )}
      </div>
    </article>
  );
}
