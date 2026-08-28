import { sampleContracts } from "../data/samples";
import { splitClauses } from "../lib/clause-splitter";
import { errorMessage, errorResult, textResult, type ToolDeps } from "./register";
import { getSampleContractInput } from "./schemas";

export function getSampleContractTool(deps: ToolDeps): WebMCP.ModelContextTool {
  return {
    name: "get_sample_contract",
    title: "Load a sample contract",
    description:
      "Load one of Redline's built-in sample contracts into the review session, exactly as if the user had clicked its card. Provide sampleId: 'offer-letter' for an employment offer letter, 'training-agreement' for a training repayment agreement, or 'nda' for a one-way non-disclosure agreement. Returns the full contract text and switches the page into the review view, ready for analysis. Use get_document_state afterwards to check where the review stands.",
    inputSchema: getSampleContractInput,
    execute: (input) => {
      try {
        const sampleId = input.sampleId;
        if (typeof sampleId !== "string") {
          return errorResult(
            "get_sample_contract requires a string sampleId: 'offer-letter', 'training-agreement', or 'nda'.",
          );
        }
        const sample = sampleContracts.find((candidate) => candidate.id === sampleId);
        if (!sample) {
          return errorResult(
            `Unknown sampleId "${sampleId}". Valid ids: ${sampleContracts.map((candidate) => candidate.id).join(", ")}.`,
          );
        }
        deps.dispatch({
          type: "DOCUMENT_LOADED",
          title: sample.title,
          source: { kind: "sample", sampleId: sample.id },
          rawText: sample.text,
          clauses: splitClauses(sample.text),
        });
        return textResult({
          loaded: true,
          sampleId: sample.id,
          title: sample.title,
          text: sample.text,
        });
      } catch (error) {
        return errorResult(errorMessage(error));
      }
    },
  };
}
