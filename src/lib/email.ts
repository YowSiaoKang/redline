import { documentReviewComplete } from "../state/select";
import type { Clause, ContractDoc, Redline } from "../state/types";

export interface EmailOptions {
  yourName?: string;
  company?: string;
  hiringManagerName?: string;
}

function ensurePeriod(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function shortenSummary(summary: string): string {
  const trimmed = summary.trim();
  const sentenceEnd = trimmed.search(/[.!?](\s|$)/);
  const firstSentence = sentenceEnd === -1 ? trimmed : trimmed.slice(0, sentenceEnd + 1);
  if (firstSentence.length <= 80) return firstSentence;
  const cut = firstSentence.slice(0, 80);
  const breakAt = cut.lastIndexOf(" ");
  return `${(breakAt > 0 ? cut.slice(0, breakAt) : cut).trimEnd()}…`;
}

function proposedLabel(redline: Redline): string {
  if (redline.type === "remove" && redline.proposedText.trim() === "") {
    return "Remove this language entirely.";
  }
  return redline.proposedText;
}

function clauseBlock(clause: Clause, adopted: Redline[], position: number): string {
  const name = clause.summary ? shortenSummary(clause.summary) : `Section ${clause.order + 1}`;
  const lines: string[] = [`${position}. ${name}`];
  for (const redline of adopted) {
    lines.push(
      `   Current:  "${redline.originalSpan}"`,
      `   Proposed: "${proposedLabel(redline)}"`,
      `   Reason:   ${ensurePeriod(redline.reason.trim())}`,
    );
  }
  return lines.join("\n");
}

export function composeEmail(doc: ContractDoc, opts: EmailOptions = {}): string {
  const yourName = opts.yourName ?? "[Your Name]";
  const company = opts.company ?? "[Company]";
  const hiringManagerName = opts.hiringManagerName ?? "[Hiring Manager Name]";

  const complete = documentReviewComplete(doc);
  const clauses = [...doc.clauses].sort((a, b) => a.order - b.order);
  const adoptedByClause = clauses
    .map((clause) => ({
      clause,
      adopted: clause.redlines.filter((redline) => redline.verdict === "adopt"),
    }))
    .filter((entry) => entry.adopted.length > 0);
  const adoptedCount = adoptedByClause.reduce((sum, entry) => sum + entry.adopted.length, 0);

  if (complete && adoptedCount === 0) {
    const body = [
      `Dear ${hiringManagerName},`,
      `Thank you — I'm delighted to accept. I'm excited about the role and about joining ${company}, and I'm ready to get started.`,
      "If there's anything you need from me before my first day — paperwork, intros, anything at all — just send it my way.",
      `Best,\n${yourName}`,
    ];
    return `Subject: Offer acceptance — excited to join\n\n${body.join("\n\n")}`;
  }

  const body: string[] = [];
  if (!complete) {
    const redlines = clauses.flatMap((clause) => clause.redlines);
    const decided = redlines.filter((redline) => redline.verdict !== "undecided").length;
    body.push(
      redlines.length > 0
        ? `[Draft — ${decided} of ${redlines.length} decisions made]`
        : "[Draft — review in progress]",
    );
  }

  body.push(`Dear ${hiringManagerName},`);
  body.push(
    adoptedCount > 0
      ? `Thank you again for the offer — I'm excited about the role and about joining ${company}. Before I sign, I'd like to align on a few terms, and I've listed them below.`
      : `Thank you again for the offer — I'm excited about the role and about joining ${company}. Before I sign, I'd like to align on a few terms — I'll list them here as the review wraps up.`,
  );

  adoptedByClause.forEach((entry, index) => {
    body.push(clauseBlock(entry.clause, entry.adopted, index + 1));
  });

  body.push(
    adoptedCount > 0
      ? "These are the only points I'd change — everything else works for me as written. Happy to talk through any of them, and once we've aligned, I'm ready to sign."
      : "Happy to talk through any of it — once we've aligned, I'm ready to sign.",
  );
  body.push(`Best,\n${yourName}`);

  return `Subject: Quick follow-up on the offer — a few terms to align on\n\n${body.join("\n\n")}`;
}
