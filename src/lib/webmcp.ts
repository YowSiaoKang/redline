export function hasWebMCP(): boolean {
  return (
    typeof document !== "undefined" &&
    (document as { modelContext?: unknown }).modelContext !== undefined
  );
}
