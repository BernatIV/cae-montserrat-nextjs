// Small text helpers used by the migration (kept pure for unit tests).

const MONTHS: Record<string, number> = {
  gener: 1,
  febrer: 2,
  marc: 3,
  abril: 4,
  maig: 5,
  juny: 6,
  juliol: 7,
  agost: 8,
  setembre: 9,
  octubre: 10,
  novembre: 11,
  desembre: 12,
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Parses the dates used in the WordPress concert table, e.g. "7 octubre de 1948",
 * "18 de juny del 2023", "14 d'abril del 2024" or "2002.09.07". Returns YYYY-MM-DD.
 */
export function parseCatalanDate(input: string): string {
  const value = input.trim().toLowerCase().replace(/’/g, "'");
  const iso = /^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/.exec(value);
  if (iso) return `${iso[1]}-${pad(Number(iso[2]))}-${pad(Number(iso[3]))}`;

  const match = /^(\d{1,2})\s+(?:de\s+|d')?([a-zçà-ú]+)\s+(?:de|del)\s+(\d{4})$/.exec(value);
  const month = match && MONTHS[match[2]!.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
  if (!match || !month) throw new Error(`Unrecognised date: "${input}"`);
  const day = Number(match[1]);
  if (day < 1 || day > 31) throw new Error(`Invalid day in date: "${input}"`);
  return `${match[3]}-${pad(month)}-${pad(day)}`;
}

/** Fixes SQL-style escaping left in some TablePress cells ('' and wrapping quotes). */
export function cleanCell(text: string): string {
  return text
    .trim()
    .replace(/^'(.*)'$/, "$1")
    .replace(/''/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * First sentence of a text, at most `max` characters (cut at a word boundary).
 * A sentence ends at `.`, `!` or `?` followed by a capital letter, and is at
 * least 40 characters long, so abbreviations ("núm. 7", "Ntra. Sra.") don't cut it.
 */
export function summary(text: string, max = 300): string {
  const end = /[.!?](?=\s+[\p{Lu}¡¿«"“]|$)/gu;
  const abbreviation = /(?:^|[\s(])(?:\p{L}|Sr|Sra|Srta|Ntra|Nra|St|Mn|Dr|Dra|núm|pàg|Dir)$/iu;
  let sentence = text;
  for (let match = end.exec(text); match; match = end.exec(text)) {
    if (match.index + 1 >= 40 && !abbreviation.test(text.slice(0, match.index))) {
      sentence = text.slice(0, match.index + 1);
      break;
    }
  }
  sentence = sentence.trim();
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** Compares headings ignoring case, spacing, emojis and leading numbering. */
export function sameHeading(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .replace(/^[^\p{L}]+/u, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("ca");
  return norm(a) === norm(b);
}

/** Uppercases the first letter. */
export function capitalise(text: string): string {
  return text.charAt(0).toLocaleUpperCase("ca") + text.slice(1);
}

/** Truncates a slug to `max` characters at a dash boundary. */
export function truncateSlug(slug: string, max = 60): string {
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  return cut.slice(0, cut.lastIndexOf("-") > 0 ? cut.lastIndexOf("-") : max);
}
