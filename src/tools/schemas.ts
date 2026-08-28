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
