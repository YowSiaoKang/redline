export interface JsonObjectSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export const getSampleContractInput: JsonObjectSchema = {
  type: "object",
  properties: {
    sampleId: {
      type: "string",
      enum: ["offer-letter", "training-agreement", "nda"],
      description: "Which sample contract to load.",
    },
  },
  required: ["sampleId"],
  additionalProperties: false,
};

export const getDocumentStateInput: JsonObjectSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export const extractClausesInput: JsonObjectSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export const getClauseTextInput: JsonObjectSchema = {
  type: "object",
  properties: {
    clauseId: {
      type: "string",
      description: "Clause id from extract_clauses, e.g. 'c2'.",
    },
  },
  required: ["clauseId"],
  additionalProperties: false,
};

export const assessClauseInput: JsonObjectSchema = {
  type: "object",
  properties: {
    clauseId: {
      type: "string",
      description: "Clause id from extract_clauses, e.g. 'c2'.",
    },
    summary: {
      type: "string",
      description: "Plain-English one-liner saying what this clause obligates the reader to do.",
    },
    flags: {
      type: "array",
      description:
        "Issues worth the human's attention. Omit for a clean clause. Reasons must be one line.",
      items: {
        type: "object",
        properties: {
          issue: {
            type: "string",
            description: "Short label for the problem, e.g. '5-year non-compete'.",
          },
          severity: {
            type: "string",
            enum: ["high", "medium", "low"],
            description:
              "'high' = likely unenforceable or significant harm to the reader; 'medium' = questionable, worth negotiating; 'low' = worth noting.",
          },
          reason: {
            type: "string",
            description:
              "One line. Ground it in get_enforceability_context data where possible ('Texas courts won't enforce a 5-year, nationwide ban'), not vibes ('this seems long').",
          },
        },
        required: ["issue", "severity", "reason"],
        additionalProperties: false,
      },
    },
    redlines: {
      type: "array",
      description:
        "Concrete proposed edits. The store assigns redline ids — never invent ids. Omit if no edit is warranted.",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["replace", "remove"],
            description: "'replace' swaps originalSpan for proposedText; 'remove' strikes originalSpan.",
          },
          originalSpan: {
            type: "string",
            description: "Exact text from the clause to be replaced or removed (copy it verbatim from get_clause_text).",
          },
          proposedText: {
            type: "string",
            description:
              "For 'replace': ACTUAL contract language a lawyer could paste in (e.g. 'for a period of six months and within a 25-mile radius of the Employee's primary work location') — never an instruction like 'shorten this'. Use '' for 'remove'.",
          },
          reason: {
            type: "string",
            description:
              "One line. Ground it in get_enforceability_context data where possible ('Texas courts won't enforce a nationwide 5-year ban').",
          },
        },
        required: ["type", "originalSpan", "proposedText", "reason"],
        additionalProperties: false,
      },
    },
    note: {
      type: "string",
      description: "One-paragraph message to the human explaining your assessment; appended to the clause thread.",
    },
  },
  required: ["clauseId", "summary"],
  additionalProperties: false,
};

export const getEnforceabilityContextInput: JsonObjectSchema = {
  type: "object",
  properties: {
    family: {
      type: "string",
      description:
        "Restrictive-covenant family: 'non-compete', 'trap' (training repayment), 'invention-assignment', 'forfeiture-for-competition', 'garden-leave', 'non-solicitation', or 'unlimited-scope-nda'.",
    },
    state: {
      type: "string",
      description: "Two-letter US state code, e.g. 'TX'. Used for the 'non-compete' and 'trap' data packs.",
    },
  },
  required: ["family"],
  additionalProperties: false,
};
