export const DATA_NOTE =
  "Static build-time snapshot for educational purposes; verify current law before relying on it.";

export type NonCompeteStatus = "banned" | "statutory-limits" | "reasonableness";

export interface StateProfile {
  state: string;
  stateName: string;
  status: NonCompeteStatus;
  durationCap?: string;
  geographicLimits?: string;
  requirements: string[];
  overbreadthSignals: string[];
  citations: string[];
  note?: string;
}

export interface TrapProfile {
  state: string;
  stateName: string;
  scope: string;
  keyProtections: string[];
  citations: string[];
  note?: string;
}

export interface FamilyHeuristic {
  family: string;
  familyName: string;
  baseline: string;
  rubric: { question: string; redFlag: string }[];
}
