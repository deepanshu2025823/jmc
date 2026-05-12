/**
 * Minimal CSV parser — handles quoted fields, embedded commas, escaped quotes
 * (RFC 4180-style "doubled quotes"), and CRLF/LF line endings.
 *
 * Limits: doesn't stream — loads the entire file into memory. Fine for
 * admin product imports up to a few MB.
 */

export interface ParseResult {
  /** Column names from the header row, lowercased + trimmed. */
  headers: string[];
  /** Rows as objects keyed by header. Empty fields are empty strings. */
  rows: Record<string, string>[];
  /** Raw row count (excluding header). */
  rowCount: number;
}

export function parseCsv(text: string): ParseResult {
  const cleaned = text.replace(/^﻿/, ""); // strip BOM
  const cells: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      // Handle CRLF — skip the LF if we just consumed a CR.
      if (ch === "\r" && cleaned[i + 1] === "\n") i += 1;
      row.push(field);
      cells.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }
  // Flush trailing field/row.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    cells.push(row);
  }

  // Drop blank trailing rows.
  while (cells.length > 0) {
    const last = cells[cells.length - 1]!;
    if (last.length === 1 && last[0]!.trim() === "") cells.pop();
    else break;
  }

  if (cells.length === 0) return { headers: [], rows: [], rowCount: 0 };

  const headers = cells[0]!.map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let r = 1; r < cells.length; r++) {
    const obj: Record<string, string> = {};
    const cols = cells[r]!;
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? "").trim();
    });
    rows.push(obj);
  }

  return { headers, rows, rowCount: rows.length };
}

/** Builds a slug from a product name. Idempotent + collision-prone (admin should de-dupe). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
