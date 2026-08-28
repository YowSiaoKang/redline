import { familyHeuristics } from "../data/enforceability/heuristics";
import { DATA_NOTE, nonCompeteProfiles } from "../data/enforceability/non-compete";
import { DATA_NOTE as TRAP_DATA_NOTE, defaultTrapNote, trapProfiles } from "../data/enforceability/trap";
import type { StateProfile, TrapProfile } from "../data/enforceability/types";
import { composeEmail, type EmailOptions } from "../lib/email";
import { documentReviewComplete } from "../state/select";
import type { Clause, ContractDoc, Flag, ProposedRedline } from "../state/types";
import { errorMessage, errorResult, textResult, type ToolDeps } from "./register";
import {
  assessClauseInput,
  extractClausesInput,
  getClauseTextInput,
  getDocumentStateInput,
  getEnforceabilityContextInput,
  exportNegotiationEmailInput,
} from "./schemas";

const UNKNOWN_CLAUSE = "unknown clauseId — call extract_clauses first.";
const NO_DOCUMENT =
  "no document loaded — load a contract first. Ask the user to paste one, or call get_sample_contract.";
const VALID_FAMILIES = [
  "non-compete",
  "trap",
  "invention-assignment",
  "forfeiture-for-competition",
  "garden-leave",
  "non-solicitation",
  "unlimited-scope-nda",
];

function requireDocument(session: { document: ContractDoc | null }): ContractDoc | null {
  return session.document;
}

function findClause(doc: ContractDoc, clauseId: string): Clause | undefined {
  return doc.clauses.find((candidate) => candidate.id === clauseId);
}

function parseFlags(input: Record<string, unknown>): Flag[] | undefined {
  const raw = input.flags;
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) throw new Error("flags must be an array");
  return raw.map((item) => {
    const flag = item as Record<string, unknown>;
    const issue = flag.issue;
    const severity = flag.severity;
    const reason = flag.reason;
    if (typeof issue !== "string" || typeof reason !== "string") {
      throw new Error("each flag needs string fields issue and reason");
    }
    if (severity !== "high" && severity !== "medium" && severity !== "low") {
      throw new Error('each flag needs severity "high", "medium", or "low"');
    }
    return { issue, severity, reason };
  });
}

function parseRedlines(input: Record<string, unknown>): ProposedRedline[] | undefined {
  const raw = input.redlines;
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) throw new Error("redlines must be an array");
  return raw.map((item) => {
    const redline = item as Record<string, unknown>;
    const type = redline.type;
    const originalSpan = redline.originalSpan;
    const proposedText = redline.proposedText;
    const reason = redline.reason;
    if (type !== "replace" && type !== "remove") {
      throw new Error('each redline needs type "replace" or "remove"');
    }
    if (
      typeof originalSpan !== "string" ||
      typeof proposedText !== "string" ||
      typeof reason !== "string"
    ) {
      throw new Error("each redline needs string fields originalSpan, proposedText, and reason");
    }
    return { type, originalSpan, proposedText, reason };
  });
}

export function getDocumentStateTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "get_document_state",
    title: "Get document review state",
    description:
      "Get a live snapshot of the contract currently under review in Redline: the document title, where it came from (a built-in sample or a user paste), the current review phase, and progress counts — total clauses, how many are cleared, flagged, or still undecided, and how many redlines await a verdict. Cheap orientation call: use it whenever you need to know where the review stands. Returns a clear error if no document is loaded yet.",
    inputSchema: getDocumentStateInput,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => {
      try {
        const session = deps.sessionRef.current;
        const doc = session.document;
        if (!doc) {
          return errorResult(
            "No document is loaded. Ask the user to paste a contract, or call get_sample_contract to load a built-in sample.",
          );
        }
        let clausesCleared = 0;
        let clausesFlagged = 0;
        let clausesUndecided = 0;
        let redlinesUndecided = 0;
        for (const clause of doc.clauses) {
          if (!clause.assessed) {
            clausesUndecided += 1;
            continue;
          }
          if (clause.status === "flagged") {
            clausesFlagged += 1;
          } else {
            clausesCleared += 1;
          }
          for (const redline of clause.redlines) {
            if (redline.verdict === "undecided") redlinesUndecided += 1;
          }
        }
        return textResult({
          title: doc.title,
          source: doc.source,
          phase: session.phase,
          clauseCount: doc.clauses.length,
          clausesCleared,
          clausesFlagged,
          clausesUndecided,
          redlinesUndecided,
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}

export function extractClausesTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "extract_clauses",
    title: "List clauses of the contract",
    description:
      "List every clause of the loaded contract in document order as {clauseId, text}. Work through ALL clauses in order — read every one before judging. As you read, sort each clause into one of seven restrictive-covenant families: (1) non-compete (barring work for competitors), (2) TRAP / training repayment (owing money back if you leave), (3) invention assignment (who owns what you invent), (4) forfeiture-for-competition (losing earned pay/equity if you compete), (5) garden leave (paid time out of the market), (6) non-solicitation / antipiracy (no poaching customers or coworkers), (7) unlimited-scope NDA (confidentiality with no public-knowledge carve-out or end date). Clauses that fit none of these still get a summary and assessment. Returns a clear error if no document is loaded.",
    inputSchema: extractClausesInput,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => {
      try {
        const doc = requireDocument(deps.sessionRef.current);
        if (!doc) return errorResult(NO_DOCUMENT);
        return textResult({
          title: doc.title,
          clauses: doc.clauses.map((clause) => ({ clauseId: clause.id, text: clause.rawText })),
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}

export function getClauseTextTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "get_clause_text",
    title: "Get exact clause text",
    description:
      "Return the exact, verbatim text of one clause by clauseId. Use it to re-ground yourself before drafting redline language — proposedText must be real contract language you can write only after re-reading the source — and when the human asks 'why did you say that?' so your answer quotes the actual words, not a paraphrase. Returns a clear error for an unknown clauseId.",
    inputSchema: getClauseTextInput,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: (input) => {
      try {
        const doc = requireDocument(deps.sessionRef.current);
        if (!doc) return errorResult(NO_DOCUMENT);
        const clauseId = input.clauseId;
        if (typeof clauseId !== "string") {
          return errorResult("get_clause_text requires a string clauseId from extract_clauses.");
        }
        const clause = findClause(doc, clauseId);
        if (!clause) return errorResult(UNKNOWN_CLAUSE);
        return textResult({ clauseId: clause.id, text: clause.rawText });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}

export function assessClauseTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "assess_clause",
    title: "Record a clause assessment",
    description:
      "Record your assessment of one clause: a plain-English one-line summary, flags for issues, proposed redlines, and an optional note to the human. This MUTATES the review — the human sees the results immediately. Output contract: flags[] need {issue, severity, reason} where severity is exactly 'high' (likely unenforceable or significant harm), 'medium' (questionable, worth negotiating), or 'low' (worth noting); reason must be ONE line grounded in get_enforceability_context data ('Texas courts won't enforce a 5-year, nationwide ban'), never vibes ('this seems long'). redlines[] need {type: 'replace'|'remove', originalSpan, proposedText, reason}: originalSpan copied verbatim from get_clause_text; for 'replace', proposedText must be ACTUAL contract language a lawyer could paste in ('for a period of six months and within a 25-mile radius of the Employee's primary work location') — never an instruction like 'shorten this'; the store assigns redline ids, never invent them. Re-invoke assess_clause on a clause you already assessed to change your mind under questioning — new flags replace old ones and new redlines append immediately.",
    inputSchema: assessClauseInput,
    annotations: { untrustedContentHint: true },
    execute: (input) => {
      try {
        const doc = requireDocument(deps.sessionRef.current);
        if (!doc) return errorResult(NO_DOCUMENT);
        const clauseId = input.clauseId;
        if (typeof clauseId !== "string") {
          return errorResult("assess_clause requires a string clauseId from extract_clauses.");
        }
        const clause = findClause(doc, clauseId);
        if (!clause) return errorResult(UNKNOWN_CLAUSE);
        const summary = input.summary;
        if (typeof summary !== "string" || summary.trim().length === 0) {
          return errorResult("assess_clause requires a non-empty string summary (one plain-English line).");
        }
        const flags = parseFlags(input);
        const redlines = parseRedlines(input);
        const note = input.note;
        if (note !== undefined && typeof note !== "string") {
          return errorResult("note must be a string.");
        }
        deps.dispatch({
          type: "CLAUSE_ASSESSED",
          clauseId: clause.id,
          summary,
          flags,
          redlines,
          note,
        });
        const effectiveFlags = flags ?? clause.flags;
        const freshIds = (redlines ?? []).map(
          (_, index) => `${clause.id}-r${clause.redlines.length + index + 1}`,
        );
        return textResult({
          assessed: clause.id,
          status: effectiveFlags.length > 0 || clause.redlines.length > 0 || freshIds.length > 0 ? "flagged" : "cleared",
          summary,
          flagsRecorded: effectiveFlags.length,
          redlinesAppended: freshIds,
          totalRedlines: clause.redlines.length + freshIds.length,
          dataNote: DATA_NOTE,
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}

export function getEnforceabilityContextTool(): WebMCP.ModelContextTool {
  return {
    name: "get_enforceability_context",
    title: "Get enforceability data-pack context",
    description:
      "Ground your judgment in Redline's built-in enforceability data packs before writing reasons or redline language. Call it for 'non-compete' clauses with the relevant US state to get that state's profile — duration caps, geographic limits, notice/garden-leave requirements, statutory cites, and overbreadth signals you can quote verbatim in a reason. Call it for 'trap' (training repayment) clauses with a state for key-state TRAP protections. For the other five families (invention-assignment, forfeiture-for-competition, garden-leave, non-solicitation, unlimited-scope-nda) it returns a reasonableness rubric of questions and red flags to apply. Do not write non-compete or TRAP redlines without calling this first. Returns are a static educational snapshot — say so when you lean on them.",
    inputSchema: getEnforceabilityContextInput,
    annotations: { readOnlyHint: true },
    execute: (input) => {
      try {
        const family = input.family;
        if (typeof family !== "string") {
          return errorResult(`get_enforceability_context requires a string family. Valid families: ${VALID_FAMILIES.join(", ")}.`);
        }
        const state = typeof input.state === "string" ? input.state.toUpperCase() : undefined;

        if (family === "non-compete" || family === "trap") {
          const profiles: StateProfile[] | TrapProfile[] =
            family === "non-compete" ? nonCompeteProfiles : trapProfiles;
          const dataNote = family === "non-compete" ? DATA_NOTE : TRAP_DATA_NOTE;
          if (state) {
            const profile = profiles.find((candidate) => candidate.state === state);
            if (!profile) {
              return errorResult(
                `unknown state "${state}" for family "${family}" — states covered: ${profiles
                  .map((candidate) => candidate.state)
                  .join(", ")}.`,
              );
            }
            return textResult({ family, ...profile, dataNote });
          }
          const coveredStates = profiles.map((candidate) => ({
            state: candidate.state,
            stateName: candidate.stateName,
            status: "status" in candidate ? candidate.status : undefined,
          }));
          if (family === "trap") {
            return textResult({
              family,
              dataNote,
              coveredStates,
              defaultNote: defaultTrapNote,
              hint: "Pass a two-letter state code to get that state's TRAP profile.",
            });
          }
          return textResult({
            family,
            dataNote,
            coveredStates,
            hint: "Pass a two-letter state code (e.g. 'TX') to get that state's non-compete profile.",
          });
        }

        const heuristic = familyHeuristics.find((candidate) => candidate.family === family);
        if (!heuristic) {
          return errorResult(
            `unknown family "${family}" — valid families: ${VALID_FAMILIES.join(", ")}.`,
          );
        }
        return textResult({
          family: heuristic.family,
          familyName: heuristic.familyName,
          baseline: heuristic.baseline,
          rubric: heuristic.rubric,
          dataNote: DATA_NOTE,
          note:
            state !== undefined
              ? `State "${state}" was requested, but this family uses a state-general reasonableness rubric.`
              : undefined,
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}

export function exportNegotiationEmailTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "export_negotiation_email",
    title: "Compose the negotiation email",
    description:
      "Compose the user's negotiation email from the review's CURRENT decision state — the exact same draft shown in the page's email panel, generated by the same composer. Partial state mid-review is expected and returned honestly: a [Draft — N of M decisions made] marker appears until every redline verdict is in. Only when the review is truly complete AND zero redlines were adopted does the draft become the offer-acceptance email. Call it whenever the user asks for the email or wants to see how their asks read so far. Present the returned email text verbatim — do not edit, reformat, or paraphrase it. Personalization: without options the email contains the [Your Name] / [Company] / [Hiring Manager Name] placeholders exactly as the page shows; pass the user's real names via the optional yourName, company, and hiringManagerName inputs when they provide them. Read-only: mutates nothing. Returns a clear error if no document is loaded.",
    inputSchema: exportNegotiationEmailInput,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: (input) => {
      try {
        const doc = requireDocument(deps.sessionRef.current);
        if (!doc) return errorResult(NO_DOCUMENT);
        const opts: EmailOptions = {};
        if (typeof input.yourName === "string") opts.yourName = input.yourName;
        if (typeof input.company === "string") opts.company = input.company;
        if (typeof input.hiringManagerName === "string") opts.hiringManagerName = input.hiringManagerName;
        const email = composeEmail(doc, opts);
        const adoptedCount = doc.clauses.reduce(
          (sum, clause) => sum + clause.redlines.filter((redline) => redline.verdict === "adopt").length,
          0,
        );
        return textResult({
          email,
          reviewComplete: documentReviewComplete(doc),
          adoptedCount,
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}
