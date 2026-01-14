export type DueFilterType = "exact" | "until";

export interface DueFilter {
  readonly type: DueFilterType;
  readonly date: Date;
}

export function createDueFilter(type: DueFilterType, date: Date): DueFilter {
  return Object.freeze({
    type,
    date: new Date(date.getTime()),
  });
}

export function matchesDueFilter(
  filter: DueFilter,
  dueAt: Date | null
): boolean {
  if (dueAt === null) {
    return false;
  }

  const filterDate = normalizeToDateOnly(filter.date);
  const targetDate = normalizeToDateOnly(dueAt);

  if (filter.type === "exact") {
    return targetDate.getTime() === filterDate.getTime();
  }

  // until: dueAt <= date
  return targetDate.getTime() <= filterDate.getTime();
}

function normalizeToDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Parse due filter from URL query string
 * Format:
 *   - "2026-01-14" -> exact match
 *   - "~2026-01-14" -> until (<=) match
 */
export function parseDueFilter(value: string): DueFilter | null {
  if (!value) {
    return null;
  }

  const isUntil = value.startsWith("~");
  const dateStr = isUntil ? value.slice(1) : value;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }

  return createDueFilter(isUntil ? "until" : "exact", date);
}

export function formatDueFilter(filter: DueFilter): string {
  const isoString = filter.date.toISOString();
  const dateStr = isoString.substring(0, 10);
  if (filter.type === "until") {
    return `~${dateStr}`;
  }
  return dateStr;
}
