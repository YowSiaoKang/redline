import { phaseFor } from "./select";
import type {
  Clause,
  ClauseAssessment,
  ContractDoc,
  Flag,
  Message,
  Redline,
  ReviewSession,
} from "./types";

export type DocumentLoadedAction = {
  type: "DOCUMENT_LOADED";
  title: string;
  source: ContractDoc["source"];
  rawText: string;
  clauses: Clause[];
};

export type ClauseAssessedAction = {
  type: "CLAUSE_ASSESSED";
  clauseId: string;
} & ClauseAssessment;

export type VerdictSetAction = {
  type: "VERDICT_SET";
  clauseId: string;
  redlineId: string;
  verdict: Redline["verdict"];
};

export type SessionAction =
  | DocumentLoadedAction
  | ClauseAssessedAction
  | VerdictSetAction
  | { type: "RESET" };

export const initialSession: ReviewSession = { phase: "landing", document: null };

export function sessionReducer(session: ReviewSession, action: SessionAction): ReviewSession {
  switch (action.type) {
    case "DOCUMENT_LOADED":
      return withDerivedPhase({
        phase: "awaiting-agent",
        document: {
          title: action.title,
          source: action.source,
          rawText: action.rawText,
          clauses: action.clauses,
        },
      });
    case "CLAUSE_ASSESSED":
      return withDerivedPhase(applyAssessment(session, action));
    case "VERDICT_SET":
      return withDerivedPhase(applyVerdict(session, action));
    case "RESET":
      return initialSession;
  }
}

function applyAssessment(session: ReviewSession, action: ClauseAssessedAction): ReviewSession {
  const doc = session.document;
  const clause = doc?.clauses.find((candidate) => candidate.id === action.clauseId);
  if (!doc || !clause) return session;

  const additions = (action.redlines ?? []).map((proposed, index) => ({
    ...proposed,
    id: `${clause.id}-r${clause.redlines.length + index + 1}`,
    verdict: "undecided" as const,
  }));

  const flags: Flag[] = action.flags ? [...action.flags] : clause.flags;
  const redlines = [...clause.redlines, ...additions];
  const chat: Message[] = action.note
    ? [...clause.chat, { role: "agent" as const, text: action.note }]
    : clause.chat;

  const assessed: Clause = {
    ...clause,
    summary: action.summary,
    flags,
    redlines,
    chat,
    status: flags.length > 0 || redlines.length > 0 ? "flagged" : "cleared",
    assessed: true,
  };

  return {
    ...session,
    document: { ...doc, clauses: doc.clauses.map((candidate) => (candidate.id === clause.id ? assessed : candidate)) },
  };
}

function applyVerdict(session: ReviewSession, action: VerdictSetAction): ReviewSession {
  const doc = session.document;
  const clause = doc?.clauses.find((candidate) => candidate.id === action.clauseId);
  if (!doc || !clause) return session;
  if (!clause.redlines.some((redline) => redline.id === action.redlineId)) return session;

  const chat: Message[] = [
    ...clause.chat,
    {
      role: "judge" as const,
      text:
        action.verdict === "undecided"
          ? "Judge reopened this redline."
          : `Judge verdict: ${action.verdict}.`,
    },
  ];

  const updated: Clause = {
    ...clause,
    chat,
    redlines: clause.redlines.map((redline) =>
      redline.id === action.redlineId ? { ...redline, verdict: action.verdict } : redline,
    ),
  };

  return {
    ...session,
    document: { ...doc, clauses: doc.clauses.map((candidate) => (candidate.id === clause.id ? updated : candidate)) },
  };
}

function withDerivedPhase(session: ReviewSession): ReviewSession {
  return { ...session, phase: phaseFor(session) };
}
