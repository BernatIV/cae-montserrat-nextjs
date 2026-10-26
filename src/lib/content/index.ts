import { getDefaultReader, type ContentReader } from "./reader";
import { parseYouTubeId, sortByDateDesc } from "./utils";

export { createContentReader, type ContentReader } from "./reader";
export { parseYouTubeId, sortByDateDesc, splitByDate, todayIso } from "./utils";

/** Singleton keys of the simple pages (see keystatic.config.ts). */
export type PageKey =
  | "quiSom"
  | "historia"
  | "projectes"
  | "enregistraments"
  | "contacte"
  | "avisLegal"
  | "politicaCookies"
  | "politicaPrivacitat";

const resolved = { resolveLinkedFiles: true } as const;

export async function getSettings(reader: ContentReader = getDefaultReader()) {
  const settings = await reader.singletons.configuracio.read();
  return (
    settings ?? {
      menu: [],
      social: [],
      contact: { email: "", phone: "", address: "" },
    }
  );
}

export async function getHomePage(reader: ContentReader = getDefaultReader()) {
  return reader.singletons.inici.read(resolved);
}

export async function getPage(key: PageKey, reader: ContentReader = getDefaultReader()) {
  return reader.singletons[key].read(resolved);
}

/** 75è Aniversari page with its related concerts resolved, in the chosen order. */
export async function getAnniversaryPage(reader: ContentReader = getDefaultReader()) {
  const page = await reader.singletons.aniversari75.read(resolved);
  if (!page) return null;
  const concerts = await readMany(reader.collections.concerts, page.concerts);
  return { ...page, concerts };
}

/** All concerts, newest first. The body is not loaded. */
export async function getConcerts(reader: ContentReader = getDefaultReader()) {
  const entries = await reader.collections.concerts.all();
  return sortByDateDesc(entries.map(({ slug, entry }) => ({ ...entry, slug })));
}

/** A single concert with its body and related audios resolved. */
export async function getConcert(slug: string, reader: ContentReader = getDefaultReader()) {
  const concert = await reader.collections.concerts.read(slug, resolved);
  if (!concert) return null;
  const audios = await readMany(reader.collections.audios, concert.audios);
  return {
    ...concert,
    slug,
    youtubeId: parseYouTubeId(concert.youtubeId),
    audios,
  };
}

export async function getConcertSlugs(reader: ContentReader = getDefaultReader()) {
  return reader.collections.concerts.list();
}

/** Directors in chronological order (oldest first), with biography. */
export async function getDirectors(reader: ContentReader = getDefaultReader()) {
  const entries = await reader.collections.directors.all(resolved);
  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((a, b) => a.startYear - b.startYear || a.name.localeCompare(b.name, "ca"));
}

/** Albums, newest first, with description. */
export async function getDiscography(reader: ContentReader = getDefaultReader()) {
  const entries = await reader.collections.discografia.all(resolved);
  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "ca"));
}

/** All audios, newest recording first. */
export async function getAudios(reader: ContentReader = getDefaultReader()) {
  const entries = await reader.collections.audios.all();
  return sortByDateDesc(entries.map(({ slug, entry }) => ({ ...entry, slug })));
}

async function readMany<T extends object>(
  collection: { read: (slug: string) => Promise<T | null> },
  slugs: readonly string[],
): Promise<(T & { slug: string })[]> {
  const entries = await Promise.all(
    slugs.map(async (slug): Promise<(T & { slug: string }) | null> => {
      const entry = await collection.read(slug);
      return entry ? { ...entry, slug } : null;
    }),
  );
  return entries.filter((entry) => entry !== null);
}
