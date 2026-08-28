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

function askSentence(redline: Redline, first: boolean): string {
  const lead = first ? "I'd" : "Also, I'd";
  if (redline.type === "remove") {
    return `${lead} like to remove "${redline.originalSpan}".`;
  }
  return `${lead} like to replace "${redline.originalSpan}" with "${redline.proposedText}".`;
}

function clauseParagraph(clause: Clause, adopted: Redline[]): string {
  const asks = adopted.map((redline, index) => askSentence(redline, index === 0)).join(" ");
  if (clause.summary) {
    return `${ensurePeriod(clause.summary.trim())} ${asks}`;
  }
  return `About Section ${clause.order + 1}: ${asks}`;
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

  for (const { clause, adopted } of adoptedByClause) {
    body.push(clauseParagraph(clause, adopted));
  }

  body.push(
    adoptedCount > 0
      ? "These are the only points I'd change — everything else works for me as written. Happy to talk through any of them, and once we've aligned, I'm ready to sign."
      : "Happy to talk through any of it — once we've aligned, I'm ready to sign.",
  );
  body.push(`Best,\n${yourName}`);

  return `Subject: Quick follow-up on the offer — a few terms to align on\n\n${body.join("\n\n")}`;
}
