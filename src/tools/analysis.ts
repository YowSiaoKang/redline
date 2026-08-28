import { errorMessage, errorResult, textResult, type ToolDeps } from "./register";
import { getDocumentStateInput } from "./schemas";

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
