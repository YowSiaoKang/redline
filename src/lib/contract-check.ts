const CONTRACT_KEYWORDS = [
  "agreement",
  "party",
  "parties",
  "hereby",
  "clause",
  "term",
  "employment",
  "confidential",
  "whereas",
  "company",
  "employee",
  "contract",
];

const NUMBERED_SECTION = /^\s*\d{1,2}(?:\.\d{1,2})*\.?\s+\S/m;
const LEGAL_HEADINGS = /^\s*(?:article\s+[ivxlcdm\d]+|section\s+\d+|whereas\b)/im;

export function looksLikeContract(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 200) return false;
  const lower = trimmed.toLowerCase();
  if (CONTRACT_KEYWORDS.some((word) => lower.includes(word))) return true;
  return NUMBERED_SECTION.test(trimmed) || LEGAL_HEADINGS.test(trimmed);
}

export function titleFromText(text: string): string {
  const firstLine = text
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);
  if (firstLine === undefined) return "Pasted contract";
  const title = firstLine.trim();
  return title.length <= 80 ? title : `${title.slice(0, 77).trimEnd()}…`;
}
