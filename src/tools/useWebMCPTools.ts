import { useEffect } from "react";
import { useSession } from "../state/session";
import { getDocumentStateTool } from "./analysis";
import { getSampleContractTool } from "./base";
import { ToolPhase } from "./register";

export function useWebMCPTools(): void {
  const { session, sessionRef, dispatch } = useSession();
  const hasDocument = session.document !== null;

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) return undefined;
    const basePhase = new ToolPhase(modelContext);
    basePhase.activate([getSampleContractTool({ sessionRef, dispatch })]);
    return () => basePhase.deactivate();
  }, [sessionRef, dispatch]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) return undefined;
    const analysisPhase = new ToolPhase(modelContext);
    if (hasDocument) {
      analysisPhase.activate([getDocumentStateTool({ sessionRef, dispatch })]);
    }
    return () => analysisPhase.deactivate();
  }, [hasDocument, sessionRef, dispatch]);
}
