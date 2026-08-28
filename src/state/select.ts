import type { Clause, ContractDoc, Phase, ReviewSession } from "./types";

export function clauseIsClear(clause: Clause): boolean {
  return clause.status === "cleared" || clause.redlines.every((redline) => redline.verdict !== "undecided");
}

export function documentReviewComplete(doc: ContractDoc | null): boolean {
  const clauses = doc?.clauses ?? [];
  return (
    clauses.length > 0 &&
    clauses.every((clause) => clause.assessed) &&
    clauses.every((clause) => clause.redlines.every((redline) => redline.verdict !== "undecided"))
  );
}

export function reviewComplete(session: ReviewSession): boolean {
  return documentReviewComplete(session.document);
}

export function phaseFor(session: ReviewSession): Phase {
  if (!session.document) return "landing";
  if (!session.document.clauses.some((clause) => clause.assessed)) return "awaiting-agent";
  return reviewComplete(session) ? "complete" : "reviewing";
}
