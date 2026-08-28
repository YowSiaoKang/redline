import type { Dispatch, RefObject } from "react";
import type { SessionAction } from "../state/actions";
import type { ReviewSession } from "../state/types";

export interface ToolDeps {
  sessionRef: RefObject<ReviewSession>;
  dispatch: Dispatch<SessionAction>;
}

export interface TextToolResult {
  content: Array<{ type: "text"; text: string }>;
}

export function textResult(payload: unknown): TextToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload) }] };
}

export function errorResult(message: string): TextToolResult {
  return textResult({ error: message });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class ToolPhase {
  private controller: AbortController | null = null;
  private readonly modelContext: WebMCP.ModelContext;

  constructor(modelContext: WebMCP.ModelContext) {
    this.modelContext = modelContext;
  }

  activate(tools: readonly WebMCP.ModelContextTool[]): void {
    this.deactivate();
    const controller = new AbortController();
    this.controller = controller;
    for (const tool of tools) {
      this.modelContext
        .registerTool(tool, { signal: controller.signal })
        .catch((error: unknown) => {
          console.warn(`webmcp: could not register tool "${tool.name}"`, error);
        });
    }
  }

  deactivate(): void {
    const controller = this.controller;
    this.controller = null;
    controller?.abort();
  }
}
