import { defaultLocale } from "@/lib/i18n";

const longDate = new Intl.DateTimeFormat(defaultLocale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function toUtcDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

/** `2023-06-18` → `18 de juny de 2023`. Returns an empty string when there is no valid date. */
export function formatDate(iso: string | null | undefined): string {
  const date = iso ? toUtcDate(iso) : null;
  return date ? longDate.format(date) : "";
}

/** Day, month and year as separate strings, for date badges. */
export function dateParts(iso: string | null | undefined) {
  const date = iso ? toUtcDate(iso) : null;
  if (!date) return null;
  const parts = new Intl.DateTimeFormat(defaultLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return { day: get("day"), month: get("month").replace(/\.$/, ""), year: get("year") };
}

type Dated = { date: string | null };

/**
 * Groups items by decade, keeping their order. Items without a date go into a
 * final group with `decade: null`.
 */
export function groupByDecade<T extends Dated>(items: readonly T[]) {
  const groups: { decade: number | null; items: T[] }[] = [];
  for (const item of items) {
    const year = item.date ? Number(item.date.slice(0, 4)) : NaN;
    const decade = Number.isFinite(year) ? Math.floor(year / 10) * 10 : null;
    let group = groups.find((g) => g.decade === decade);
    if (!group) {
      group = { decade, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups.sort((a, b) => {
    if (a.decade === b.decade) return 0;
    if (a.decade === null) return 1;
    if (b.decade === null) return -1;
    return b.decade - a.decade;
  });
}

/** Joins non-empty parts with a separator (e.g. location and city). */
export function joinParts(parts: readonly (string | null | undefined)[], separator = ", "): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(separator);
}
