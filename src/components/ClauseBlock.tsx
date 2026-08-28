import type { Clause } from "../state/types";

export function ClauseBlock({ clause }: { clause: Clause }) {
  return (
    <article className="clause" aria-label={`Clause ${clause.order + 1}`}>
      <span className="clause__num">Clause {clause.order + 1}</span>
      <p className="clause__text">{clause.rawText}</p>
    </article>
  );
}
