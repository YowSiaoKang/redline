import type { Clause } from "../state/types";

export function buildAskPrompt(clause: Clause): string {
  const lines: string[] = [
    "I'm reviewing a contract in Redline and I have a question about one clause.",
    "",
    `Clause ${clause.order + 1} — clauseId ${clause.id}:`,
    clause.rawText,
    "",
  ];
  if (clause.summary) {
    lines.push(`Your summary of this clause so far: ${clause.summary}`);
  }
  if (clause.flags.length > 0) {
    lines.push("Your current flags on this clause:");
    for (const flag of clause.flags) {
      lines.push(`- ${flag.issue} (severity: ${flag.severity}) — ${flag.reason}`);
    }
  } else {
    lines.push("You have not flagged this clause — your current assessment marks it clear.");
  }
  lines.push(
    "",
    "Explain your reasoning about this clause in plain language. If, under this questioning, your assessment should change, revise it by calling assess_clause with this clauseId — revised flags replace your old ones and any new redlines appear for me to judge immediately.",
  );
  return lines.join("\n");
}
