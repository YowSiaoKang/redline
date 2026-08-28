import type { Dispatch, ReactNode } from "react";
import type { SessionAction } from "../state/actions";
import { clauseIsClear } from "../state/select";
import type { Clause, Flag, Redline, Verdict } from "../state/types";
import { ClauseChat } from "./ClauseChat";
import { FlagBadge, SeverityPill } from "./FlagBadge";
import { RedlineCard } from "./RedlineCard";

interface ClauseBlockProps {
  clause: Clause;
  dispatch: Dispatch<SessionAction>;
}

function findSpan(text: string, span: string): [number, number] | null {
  if (span.length === 0) return null;
  const exact = text.indexOf(span);
  if (exact !== -1) return [exact, exact + span.length];
  const loose = text.toLowerCase().indexOf(span.toLowerCase());
  if (loose !== -1) return [loose, loose + span.length];
  return null;
}

function highlightedText(text: string, redlines: Redline[]): ReactNode {
  const ranges: Array<[number, number]> = [];
  for (const redline of redlines) {
    const range = findSpan(text, redline.originalSpan);
    if (range) ranges.push(range);
  }
  if (ranges.length === 0) return text;
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([range[0], range[1]]);
    }
  }
  const nodes: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], index) => {
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <mark key={index} className="clause__marked">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function worstSeverity(flags: Flag[]): Flag["severity"] | undefined {
  if (flags.some((flag) => flag.severity === "high")) return "high";
  if (flags.some((flag) => flag.severity === "medium")) return "medium";
  if (flags.some((flag) => flag.severity === "low")) return "low";
  return undefined;
}

export function ClauseBlock({ clause, dispatch }: ClauseBlockProps) {
  const clear = clauseIsClear(clause);
  const severity = worstSeverity(clause.flags);
  const setVerdict = (redlineId: string, verdict: Verdict) => {
    dispatch({ type: "VERDICT_SET", clauseId: clause.id, redlineId, verdict });
  };

  return (
    <article
      className={clear ? "clause clause--clear" : "clause"}
      aria-label={`Clause ${clause.order + 1}`}
    >
      <header className="clause__head">
        <span className="clause__num">Clause {clause.order + 1}</span>
        {severity && <SeverityPill severity={severity} />}
      </header>
      {clause.summary && <p className="clause__summary">{clause.summary}</p>}
      <p className="clause__text">{highlightedText(clause.rawText, clause.redlines)}</p>
      {clause.flags.length > 0 && (
        <div className="clause__flags">
          {clause.flags.map((flag, index) => (
            <FlagBadge key={index} flag={flag} />
          ))}
        </div>
      )}
      {clause.redlines.length > 0 && (
        <div className="clause__redlines">
          {clause.redlines.map((redline) => (
            <RedlineCard
              key={redline.id}
              redline={redline}
              onVerdict={(verdict) => setVerdict(redline.id, verdict)}
            />
          ))}
        </div>
      )}
      <ClauseChat clause={clause} />
    </article>
  );
}
