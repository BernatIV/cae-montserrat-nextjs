const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Accepts a bare YouTube video ID or any common YouTube URL
 * (watch, youtu.be, embed, shorts, live) and returns the 11-character ID.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  const value = input?.trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let candidate: string | null | undefined;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    candidate =
      first === "watch"
        ? url.searchParams.get("v")
        : ["embed", "shorts", "live", "v"].includes(first ?? "")
          ? second
          : null;
  }
  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
}

/** Today's date as `YYYY-MM-DD` in the choir's time zone. */
export function todayIso(now: Date = new Date(), timeZone = "Europe/Madrid"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

type Dated = { date: string | null };

/** Newest first. Entries without a date go last. */
export function sortByDateDesc<T extends Dated>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.date === b.date) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date < b.date ? 1 : -1;
  });
}

/**
 * Splits concerts into upcoming (today included, soonest first)
 * and past (most recent first).
 */
export function splitByDate<T extends Dated>(
  items: readonly T[],
  today: string = todayIso(),
): { upcoming: T[]; past: T[] } {
  const sorted = sortByDateDesc(items);
  const upcoming = sorted.filter((item) => item.date !== null && item.date >= today).reverse();
  const past = sorted.filter((item) => item.date === null || item.date < today);
  return { upcoming, past };
}
