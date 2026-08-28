import type { Flag } from "../state/types";

const SEVERITY_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export function SeverityPill({ severity }: { severity: Flag["severity"] }) {
  return (
    <span className={`severity severity--${severity}`}>{SEVERITY_LABEL[severity]}</span>
  );
}

export function FlagBadge({ flag }: { flag: Flag }) {
  return (
    <p className={`flag flag--${flag.severity}`}>
      <span className="flag__head">
        <SeverityPill severity={flag.severity} />
        <span className="flag__issue">{flag.issue}</span>
      </span>
      <span className="flag__reason">{flag.reason}</span>
    </p>
  );
}
