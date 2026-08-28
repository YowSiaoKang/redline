import type { Clause } from "../state/types";

const RECITAL_START = /^whereas\b/i;
const OPERATIVE_START = /^now,?\s+therefore\b/i;
const NUMBERED = /^\d{1,2}(?:\.\d{1,2})*\.?\s+\S/;
const NUMBERED_PAREN = /^\(\d{1,2}(?:\.\d{1,2})*\)\s+\S/;
const LETTER_PAREN = /^\([a-z]\)\s+\S/;
const ARTICLE = /^article\s+[ivxlcdm\d]+\.?(?:\s|$)/i;
const SECTION = /^section\s+\d+(?:\.\d+)*\.?(?:\s|$)/i;
const MINOR_WORDS = new Set([
  "of",
  "the",
  "and",
  "to",
  "in",
  "for",
  "a",
  "an",
  "or",
  "with",
  "on",
  "per",
]);

export function splitClauses(rawText: string): Clause[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const chunks: string[] = [];
  let current: string[] = [];
  let inRecitals = false;

  const flush = () => {
    if (current.length > 0) chunks.push(current.join("\n"));
    current = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1];
    const startsRecital = RECITAL_START.test(line);

    if (startsRecital ? !inRecitals : isClauseBoundary(line, next)) {
      flush();
      inRecitals = startsRecital;
    } else if (OPERATIVE_START.test(line)) {
      flush();
      inRecitals = false;
    }
    current.push(line);
  }
  flush();

  return chunks.map((text, index) => ({
    id: `c${index + 1}`,
    order: index,
    rawText: text,
    status: "cleared" as const,
    flags: [],
    redlines: [],
    chat: [],
    assessed: false,
  }));
}

function isClauseBoundary(line: string, next: string | undefined): boolean {
  return (
    NUMBERED.test(line) ||
    NUMBERED_PAREN.test(line) ||
    LETTER_PAREN.test(line) ||
    ARTICLE.test(line) ||
    SECTION.test(line) ||
    isCapsHeading(line) ||
    isTitleHeading(line, next)
  );
}

function isCapsHeading(line: string): boolean {
  if (line.length > 80) return false;
  const letters = line.replace(/[^A-Za-z]/g, "");
  return letters.length >= 2 && letters === letters.toUpperCase();
}

function isTitleHeading(line: string, next: string | undefined): boolean {
  if (next === undefined || next.length <= line.length) return false;
  if (line.length < 3 || line.length > 90) return false;
  if (/[.;,!?]$/.test(line)) return false;
  const words = line.split(/\s+/);
  if (words.length > 10) return false;
  let minors = 0;
  for (const word of words) {
    const first = word.charAt(0);
    if (!/[a-z]/.test(first)) continue;
    if (MINOR_WORDS.has(word.toLowerCase())) {
      minors += 1;
      if (minors > 2) return false;
      continue;
    }
    return false;
  }
  return true;
}
