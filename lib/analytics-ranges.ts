export type RangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "this_year";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "this_year", label: "This year" },
];

const RANGE_KEYS = new Set<RangeKey>(RANGE_OPTIONS.map((r) => r.key));

export function parseRange(value: string | undefined): RangeKey {
  if (value && RANGE_KEYS.has(value as RangeKey)) return value as RangeKey;
  return "30d";
}

export function rangeLabel(key: RangeKey): string {
  return RANGE_OPTIONS.find((r) => r.key === key)?.label ?? "Last 30 days";
}
