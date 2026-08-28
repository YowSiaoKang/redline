export type Phase = "landing" | "awaiting-agent" | "reviewing" | "complete";

export type Verdict = "undecided" | "keep" | "adopt";

export interface Flag {
  issue: string;
  severity: "high" | "medium" | "low";
  reason: string;
}

export interface Redline {
  id: string;
  type: "replace" | "remove";
  originalSpan: string;
  proposedText: string;
  reason: string;
  verdict: Verdict;
}

export interface ProposedRedline {
  type: Redline["type"];
  originalSpan: string;
  proposedText: string;
  reason: string;
}

export interface Message {
  role: "agent" | "judge";
  text: string;
}

export interface Clause {
  id: string;
  order: number;
  rawText: string;
  summary?: string;
  status: "cleared" | "flagged";
  flags: Flag[];
  redlines: Redline[];
  chat: Message[];
  assessed: boolean;
}

export interface ContractDoc {
  title: string;
  source: { kind: "paste" } | { kind: "sample"; sampleId: string };
  rawText: string;
  clauses: Clause[];
}

export interface ReviewSession {
  phase: Phase;
  document: ContractDoc | null;
}

export interface ClauseAssessment {
  summary: string;
  flags?: Flag[];
  redlines?: ProposedRedline[];
  note?: string;
}
