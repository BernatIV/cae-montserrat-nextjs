// Data the WordPress HTML does not contain explicitly. Every value here was
// read from the old site's text; review it in F3-6 (docs/migracio.md).

/** 75th anniversary concerts: one WordPress page each, plus sub-pages merged into the entry. */
export const ANNIVERSARY_CONCERTS = [
  {
    slug: "concert-de-montserrat",
    title: "Concert de Montserrat",
    date: "2023-06-18",
    page: "concert-de-montserrat",
    program: "programa-de-montserrat",
    photos: "fotografies-del-concert-de-montserrat",
    recording: null,
    video: null,
  },
  {
    slug: "concert-de-la-bonanova",
    title: "Concert de la Bonanova",
    date: "2023-09-17",
    page: "concert-de-la-bonanova",
    program: "programa-de-la-bonanova",
    photos: "fotografies-del-concert-de-la-bonanova",
    recording: null,
    video: "enregistrament-del-concert-de-la-bonanova",
  },
  {
    slug: "concert-de-rubi",
    title: "Concert de Rubí",
    date: "2023-11-19",
    page: "concert-de-rubi",
    program: "programa-de-rubi",
    photos: "fotografies-del-concert-de-rubi",
    recording: "enregistrament-concert-rubi",
    video: "fotomuntatge-2",
  },
] as const;

/** Albums on /discografia-2/, in page order (the page has no titles). */
export const ALBUM_TITLES = [
  "Música del Siglo de Oro",
  "Música mossàrab",
  "Polifonia del Siglo de Oro",
  "La Passió de Barcelona",
  "Disc austríac amb l'Escolania",
  "Cançons populars catalanes",
  "Felicitació de Nadal de la Caixa d'Estalvis de la Diputació de Barcelona",
  "Missa del Papa Joan",
  "Diversitat",
] as const;

/** Album whose tracks are the audios of /audios/ (same cover images on both pages). */
export const AUDIOS_ALBUM = "Diversitat";

export const CHOIR_NAME = "Coral d'Antics Escolans de Montserrat";

/**
 * Heading rewrites per page (original text → level and Markdown). Fixes text in
 * capitals and restores the hierarchy (periods as sections, events inside them).
 */
export const HEADING_FIXES: Record<string, Record<string, [level: number, md: string]>> = {
  historia: {
    "LES PRIMERES ACTIVITATS. PERÍODE 1948 – 1973": [2, "Les primeres activitats (1948 – 1973)"],
    "1958 – VIATGE A ROMA": [3, "1958 – Viatge a Roma"],
    "LA PASSIÓ": [3, "La Passió"],
    "DESPRÉS DELS PRIMERS 25 ANYS. PERÍODE DEL 1973 – 1998": [
      2,
      "Després dels primers 25 anys (1973 – 1998)",
    ],
    "DESPRÉS DE LA CELEBRACIÓ DEL 50è ANIVERSARI. PERÍODE 1998 – 2023": [
      2,
      "Després de la celebració del 50è aniversari (1998 – 2023)",
    ],
    "24a festa del modernisme": [3, "24a Festa del Modernisme"],
    "Projecte: Et Lux Perpetua": [2, "Projecte *Et Lux Perpetua*"],
    "*": [3, ""],
  },
  projectes: {
    "PRÒXIMS PROJECTES": [2, "Pròxims projectes"],
  },
};

/** Paragraphs that only repeated a heading as decoration. */
export const DROPPED_PARAGRAPHS: Record<string, RegExp> = {
  historia: /^(Les Primeres Activitats|Període 1948 – 1973)$/,
  contacte: /camps amb|Per acabar, cliqueu/i,
};

export const CONTACT = {
  email: "info@caemontserrat.cat",
  address: "Passeig de l'Escolania, s/n\n08199 Montserrat (Barcelona)",
};

/** WordPress pages that are not migrated as their own entry, and why. */
export const MERGED_PAGES: Record<string, string> = {
  "historial-de-concerts": "empty page",
  "programa-de-montserrat": "merged into concert-de-montserrat",
  "fotografies-del-concert-de-montserrat": "merged into concert-de-montserrat",
  "programa-de-la-bonanova": "merged into concert-de-la-bonanova",
  "fotografies-del-concert-de-la-bonanova": "merged into concert-de-la-bonanova",
  "enregistrament-del-concert-de-la-bonanova": "merged into concert-de-la-bonanova",
  "programa-de-rubi": "merged into concert-de-rubi",
  "fotografies-del-concert-de-rubi": "merged into concert-de-rubi",
  "enregistrament-concert-rubi": "merged into concert-de-rubi (audio)",
  "fotomuntatge-2": "merged into concert-de-rubi (video)",
  "discografia-2": "discografia collection",
  audios: "audios collection",
  directors: "directors collection",
  concerts: "concerts collection (one entry per table row)",
};
