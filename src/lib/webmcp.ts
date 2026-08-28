export function hasWebMCP(): boolean {
  return typeof document !== "undefined" && document.modelContext !== undefined;
}

export function getModelContext(): WebMCP.ModelContext | null {
  if (typeof document === "undefined") return null;
  return document.modelContext ?? null;
}
