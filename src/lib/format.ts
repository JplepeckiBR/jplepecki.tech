// Small formatting helpers shared across pages.

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const MONTH_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
});

export function formatDate(d: Date): string {
  return DATE_FMT.format(d);
}

export function formatMonth(d: Date): string {
  return MONTH_FMT.format(d);
}

/** ISO yyyy-mm-dd for <time datetime>. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** A compact date-range label for projects: "Jun 2026 → now" / "2024 → 2025". */
export function dateRange(start: Date, end?: Date): string {
  const s = MONTH_FMT.format(start);
  if (!end) return `${s} → now`;
  return `${s} → ${MONTH_FMT.format(end)}`;
}

/** Rough reading time from rendered text content. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
