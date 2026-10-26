import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import yaml from "js-yaml";
import {
  ALBUM_TITLES,
  ANNIVERSARY_CONCERTS,
  AUDIOS_ALBUM,
  CHOIR_NAME,
  CONTACT,
  DROPPED_PARAGRAPHS,
  HEADING_FIXES,
  MERGED_PAGES,
} from "./curation.mts";
import { cleanText, escapeInline, escapeLineStart, parsePage, type Block } from "./html.mts";
import { ImageStore, MediaIndex, slugify } from "./images.mts";
import { toMarkdoc, type BodyBlock } from "./markdoc.mts";
import {
  capitalise,
  cleanCell,
  parseCatalanDate,
  sameHeading,
  summary,
  truncateSlug,
} from "./text.mts";
import {
  fileExists,
  normaliseUploadUrl,
  readBackupJson,
  type WpMedia,
  type WpPage,
} from "./wp.mts";

// Converts the WordPress backup (wp-backup/, see backup.mts) into Keystatic
// content (content/) and optimised images (public/images/). See docs/migracio.md.
//
//   npm run wp:migrate                 first run (refuses to overwrite content)
//   npm run wp:migrate -- --overwrite  regenerate content (loses manual edits!)
//   add --force-images                 to re-encode images that already exist

const CONTENT_DIR = path.resolve("content");
const PUBLIC_DIR = path.resolve("public");
const AUDIO_URLS_FILE = path.resolve("scripts/migrate-wp/audio-urls.json");
const GENERATED_DIRS = ["pagines", "concerts", "directors", "discografia", "audios"];

const args = new Set(process.argv.slice(2));
const review: string[] = [];

type Data = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Output helpers

function compact(data: Data): Data {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

async function write(relative: string, content: string) {
  const file = path.join(CONTENT_DIR, ...relative.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

/** Markdoc entry with YAML frontmatter, as Keystatic writes it. */
function writeEntry(relative: string, data: Data, body = "") {
  return write(relative, `---\n${yaml.dump(compact(data))}---\n${body}`);
}

function writeYaml(relative: string, data: Data) {
  return write(relative, yaml.dump(compact(data)));
}

// ---------------------------------------------------------------------------
// Source helpers

const pages = await readBackupJson<WpPage[]>("pages");
const media = await readBackupJson<WpMedia[]>("media");
const mediaIndex = new MediaIndex(media);
const images = new ImageStore(mediaIndex, PUBLIC_DIR, args.has("--force-images"));
const audioUrls: Record<string, string> = (await fileExists(AUDIO_URLS_FILE))
  ? JSON.parse(await readFile(AUDIO_URLS_FILE, "utf8"))
  : {};

function decode(html: string): string {
  return cleanText(cheerio.load(html, null, false).root().text());
}

function wpPage(slug: string): WpPage {
  const page = pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`WordPress page "${slug}" not found`);
  return page;
}

function pageTitle(slug: string): string {
  return decode(wpPage(slug).title.rendered);
}

/** Blocks of a page without the visual title Elementor repeats at the top. */
function pageBlocks(slug: string, title = pageTitle(slug)): Block[] {
  const blocks = parsePage(wpPage(slug).content.rendered).filter((b) => {
    if (b.type !== "image" || mediaIndex.find(b.src)) return true;
    review.push(
      `${slug}: image ${b.src} is not in the media library (broken in WordPress too); dropped`,
    );
    return false;
  });
  const first = blocks.findIndex((b) => b.type === "heading" || b.type === "paragraph");
  if (first >= 0 && blocks[first]!.type === "heading" && sameHeading(blocks[first]!.text, title)) {
    blocks.splice(first, 1);
  }
  return blocks;
}

function audioUrl(src: string): string {
  const url = normaliseUploadUrl(src);
  return audioUrls[url] ?? url;
}

function mediaTitleAlt(src: string): string {
  const title = decode(mediaIndex.find(src)?.title.rendered ?? "").replace(/[-_]+/g, " ");
  const words = title.match(/\p{L}{2,}/gu) ?? [];
  return words.length >= 3 && !/^(img|dsc|whatsapp|screenshot)/i.test(title)
    ? capitalise(cleanText(title))
    : "";
}

/**
 * Alt text for an image: WordPress alt text, else the caption that follows it
 * (paragraphs after a run of images), else a descriptive file title, else `fallback`.
 */
function altFor(blocks: readonly Block[], index: number, fallback: string): string {
  const block = blocks[index];
  if (block?.type !== "image") return fallback;
  const wpAlt = images.altText(block.src);
  if (wpAlt) return wpAlt;
  let i = index + 1;
  while (blocks[i]?.type === "image") i++;
  const caption: string[] = [];
  while (caption.length < 2 && blocks[i]?.type === "paragraph") {
    caption.push((blocks[i] as { text: string }).text.replace(/[.:]$/, ""));
    i++;
  }
  if (caption.length) return summary(caption.join(" – "), 160).replace(/[.]$/, "");
  return mediaTitleAlt(block.src) || fallback;
}

/** Shifts headings so the highest one is a level-2 heading (h1 is the page title). */
function shiftHeadings(blocks: Block[]): Block[] {
  const levels = blocks.flatMap((b) => (b.type === "heading" ? [b.level] : []));
  if (!levels.length) return blocks;
  const offset = Math.min(...levels) - 2;
  return blocks.map((b) =>
    b.type === "heading" ? { ...b, level: Math.min(6, Math.max(2, b.level - offset)) } : b,
  );
}

function headingsToParagraphs(blocks: Block[]): Block[] {
  return blocks.map((b) =>
    b.type === "heading" ? { type: "paragraph", md: b.md, text: b.text } : b,
  );
}

/** Converts page blocks into body blocks, registering images under `imageDir`. */
function toBody(blocks: readonly Block[], imageDir: string, defaultAlt: string, source: string) {
  const body: BodyBlock[] = [];
  blocks.forEach((block, index) => {
    switch (block.type) {
      case "image":
        body.push({
          type: "image",
          src: images.add(block.src, imageDir),
          alt: altFor(blocks, index, defaultAlt),
        });
        break;
      case "button":
        // Internal buttons were navigation between WordPress sub-pages.
        if (!block.href.startsWith("/")) body.push(block);
        break;
      case "audio":
      case "video":
        review.push(`${source}: ${block.type} ${block.src} not migrated in the body`);
        break;
      default:
        body.push(block);
    }
  });
  // No leading, trailing or repeated dividers.
  return body.filter(
    (b, i) =>
      b.type !== "divider" ||
      (i > 0 &&
        i < body.length - 1 &&
        body[i - 1]!.type !== "divider" &&
        body[i - 1]!.type !== "heading"),
  );
}

function firstParagraph(blocks: readonly Block[]): string {
  const block = blocks.find((b) => b.type === "paragraph");
  return block?.type === "paragraph" ? summary(block.text) : "";
}

// ---------------------------------------------------------------------------
// Pages (singletons)

type PageSpec = {
  wp: string;
  file: string;
  featured?: boolean;
  headingsAsText?: boolean;
  extra?: Data;
};

/** Applies HEADING_FIXES; "*" sets the level of headings not listed. */
function fixHeadings(blocks: Block[], fixes: Record<string, [number, string]>): Block[] {
  return blocks.map((b) => {
    if (b.type !== "heading") return b;
    const [level, md] = fixes[b.text] ?? fixes["*"] ?? [b.level, ""];
    return md ? { ...b, level, md, text: md.replace(/\*/g, "") } : { ...b, level };
  });
}

async function migratePage({ wp, file, featured, headingsAsText, extra }: PageSpec) {
  const title = pageTitle(wp);
  let blocks = pageBlocks(wp, title);
  const drop = DROPPED_PARAGRAPHS[file];
  if (drop) blocks = blocks.filter((b) => !("text" in b) || !drop.test(b.text));
  if (headingsAsText) blocks = headingsToParagraphs(blocks);
  const fixes = HEADING_FIXES[file];
  blocks = fixes ? fixHeadings(blocks, fixes) : shiftHeadings(blocks);
  if (blocks.some((b) => b.type === "heading" && b.text === b.text.toLocaleUpperCase("ca"))) {
    review.push(`pagines/${file}: headings in capitals`);
  }

  const dir = `pagines/${file}`;
  const data: Data = { title, description: firstParagraph(blocks) };
  const imageIndex = featured ? blocks.findIndex((b) => b.type === "image") : -1;
  if (imageIndex >= 0) {
    const image = blocks[imageIndex] as Extract<Block, { type: "image" }>;
    data.imageAlt = altFor(blocks, imageIndex, `Fotografia de la ${CHOIR_NAME}`);
    data.image = images.add(image.src, dir, "image");
    blocks = blocks.filter((_, i) => i !== imageIndex);
  }
  const body = toMarkdoc(toBody(blocks, dir, `Fotografia de la ${CHOIR_NAME}`, wp));
  await writeEntry(
    `pagines/${file}.md`,
    {
      title: data.title,
      description: data.description,
      image: data.image,
      imageAlt: data.imageAlt,
      ...extra,
    },
    body,
  );
}

async function migrateHome() {
  const blocks = pageBlocks("inici");
  const heading = blocks.find((b) => b.type === "heading");
  const [hero, ...rest] = blocks.filter((b) => b.type === "image");
  const dir = "pagines/inici";
  const alt = `Fotografia de la ${CHOIR_NAME}`;
  await writeEntry(
    "pagines/inici.md",
    {
      title: pageTitle("inici"),
      heroTitle: heading?.type === "heading" ? heading.text : CHOIR_NAME,
      heroImage: hero ? images.add(hero.src, dir, "heroImage") : undefined,
      heroImageAlt: hero ? alt : undefined,
    },
    toMarkdoc(toBody(rest, dir, alt, "inici")),
  );
  review.push("inici: hero image and body images have generic alt texts");
}

// ---------------------------------------------------------------------------
// Directors

async function migrateDirectors() {
  const blocks = pageBlocks("directors");
  const groups: Block[][] = [];
  for (const block of blocks) {
    if (block.type === "image") groups.push([block]);
    else if (block.type !== "divider") groups.at(-1)?.push(block);
  }
  for (const group of groups) {
    const [photo, ...rest] = group as [Extract<Block, { type: "image" }>, ...Block[]];
    const texts = rest.flatMap((b) => (b.type === "paragraph" ? [b.text] : []));
    const match = /^(.+?)\s*\((.+)\)$/.exec(texts[0] ?? "");
    if (!match) throw new Error(`Unexpected director text: "${texts[0]}"`);
    const name = match[1]!.trim();
    const period = match[2]!
      .replace(/\s*[–-]\s*/g, "–")
      .replace(/[…]|\.\.\./g, "")
      .trim();
    const slug = slugify(name);
    const bio = texts.slice(1).map((t) => capitalise(t.replace(/^\((.*)\)$/, "$1")));
    await writeEntry(
      `directors/${slug}.md`,
      {
        name,
        period,
        startYear: Number(/\d{4}/.exec(period)?.[0]),
        photo: images.add(photo.src, `directors/${slug}`, "photo"),
        photoAlt: `Fotografia de ${name}`,
      },
      toMarkdoc(bio.map((text) => ({ type: "paragraph", md: text, text }))),
    );
  }
  console.log(`directors: ${groups.length}`);
}

// ---------------------------------------------------------------------------
// Audios and discography

type AudioEntry = Data & { slug: string };

function diversitatAudios(): AudioEntry[] {
  const albumSlug = slugify(AUDIOS_ALBUM);
  return parsePage(wpPage("audios").content.rendered)
    .filter((b) => b.type === "audio")
    .map((block, i) => {
      const match = /^(.*?)\s*\(([^)]+)\)$/.exec(block.title);
      const title = match ? match[1]! : block.title;
      return {
        slug: slugify(title),
        title,
        composer: match ? match[2]!.replace(/\s*[–-]\s*/g, " – ") : "",
        performers: CHOIR_NAME,
        url: audioUrl(block.src),
        album: albumSlug,
        track: i + 1,
      };
    });
}

function rubiRecording(): AudioEntry {
  const audio = parsePage(wpPage("enregistrament-concert-rubi").content.rendered).find(
    (b) => b.type === "audio",
  );
  if (!audio) throw new Error("Rubí recording not found");
  return {
    slug: "concert-de-rubi-enregistrament",
    title: "Concert de Rubí (enregistrament complet)",
    performers: CHOIR_NAME,
    url: audioUrl(audio.src),
    date: "2023-11-19",
    concert: "concert-de-rubi",
  };
}

async function migrateAudios(entries: AudioEntry[]) {
  const seen = new Set<string>();
  let onWordPress = 0;
  for (const { slug, ...data } of entries) {
    if (seen.has(slug)) throw new Error(`Duplicated audio slug ${slug}`);
    seen.add(slug);
    if (String(data.url).startsWith("https://caemontserrat.cat/")) onWordPress++;
    await writeYaml(`audios/${slug}.yaml`, data);
  }
  if (onWordPress) {
    review.push(
      `audios: ${onWordPress} URLs still point to WordPress (run npm run wp:upload-audio)`,
    );
  }
  console.log(`audios: ${entries.length}`);
}

async function migrateDiscography(tracks: AudioEntry[]) {
  const blocks = pageBlocks("discografia-2").filter((b) => b.type !== "button");
  const groups: Block[][] = [[]];
  for (const block of blocks) {
    if (block.type === "divider") groups.push([]);
    else groups.at(-1)!.push(block);
  }
  const albums = groups.filter((g) => g.length);
  if (albums.length !== ALBUM_TITLES.length) {
    throw new Error(`Expected ${ALBUM_TITLES.length} albums, found ${albums.length}`);
  }

  for (const [i, group] of albums.entries()) {
    const title = ALBUM_TITLES[i]!;
    const slug = slugify(title);
    const dir = `discografia/${slug}`;
    const texts = headingsToParagraphs(group).filter(
      (b) => b.type === "paragraph" && !sameHeading(b.text, title),
    );
    const year = Number(
      /\b(19|20)\d{2}\b/.exec(texts.map((b) => ("text" in b ? b.text : "")).join(" "))?.[0],
    );
    if (!year) throw new Error(`No year for album "${title}"`);
    const paragraphs: BodyBlock[] = texts.map((b, j) => {
      const block = b as Extract<Block, { type: "paragraph" }>;
      if (j > 0) return block;
      const md = capitalise(block.md.replace(/^Any \d{4}\s*[–-]\s*/, ""));
      return { ...block, md, text: md };
    });
    const [cover, ...others] = group.filter((b) => b.type === "image");
    const extraImages: BodyBlock[] = others.map((image, n) => ({
      type: "image",
      src: images.add(image.src, dir),
      alt: `Disc «${title}» (imatge ${n + 2})`,
    }));
    await writeEntry(
      `discografia/${slug}.md`,
      {
        title,
        year,
        cover: cover ? images.add(cover.src, dir, "cover") : undefined,
        coverAlt: cover ? `Portada del disc «${title}»` : undefined,
        tracks:
          title === AUDIOS_ALBUM
            ? tracks.map((t) => compact({ title: t.title, composer: t.composer }))
            : [],
      },
      toMarkdoc([...paragraphs, ...extraImages]),
    );
  }
  review.push("discografia: album titles were written by hand (curation.mts); check them");
  console.log(`discografia: ${albums.length}`);
}

// ---------------------------------------------------------------------------
// Concerts

type TableRow = { date: string; location: string; city: string; title: string; notes: string };

function concertTable(): TableRow[] {
  const table = parsePage(wpPage("concerts").content.rendered).find((b) => b.type === "table");
  if (!table) throw new Error("Concerts table not found");
  return table.rows.map((cells) => {
    const [date, location, city, title, notes] = cells.map(cleanCell);
    if (!date || !location || !title) throw new Error(`Incomplete row: ${cells.join(" | ")}`);
    return { date: parseCatalanDate(date), location, city: city ?? "", title, notes: notes ?? "" };
  });
}

function dedupe(blocks: BodyBlock[]): BodyBlock[] {
  const seen = new Set<string>();
  return blocks.filter((b) => {
    if (b.type !== "button") return true;
    const key = b.href.replace(/[?#].*$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function migrateAnniversaryConcert(
  spec: (typeof ANNIVERSARY_CONCERTS)[number],
  row: TableRow,
  audios: string[],
) {
  const dir = `concerts/${spec.slug}`;
  const main = pageBlocks(spec.page, spec.title).filter(
    (b) => b.type !== "paragraph" || !/^Podeu prémer/.test(b.text),
  );
  const poster = main.find((b) => b.type === "image");
  const intro = toBody(
    main.filter((b) => b.type !== "image"),
    dir,
    "",
    spec.page,
  );

  const programImages = pageBlocks(spec.program).filter((b) => b.type === "image");
  const programLinks = pageBlocks(spec.program).filter(
    (b): b is Extract<Block, { type: "button" }> => b.type === "button" && !b.href.startsWith("/"),
  );
  const program: BodyBlock[] = programImages.length
    ? [
        { type: "heading", level: 2, md: "Programa", text: "Programa" },
        ...programImages.map((image, n): BodyBlock => ({
          type: "image",
          src: images.add(image.src, dir, `programa-${n + 1}`),
          alt: `Programa del ${spec.title.charAt(0).toLowerCase()}${spec.title.slice(1)} (pàgina ${n + 1})`,
        })),
        ...programLinks,
      ]
    : [];

  let caption = "";
  const gallery: Data[] = [];
  for (const block of pageBlocks(spec.photos)) {
    if (block.type === "paragraph") caption = block.text;
    if (block.type !== "image") continue;
    const n = String(gallery.length + 1).padStart(2, "0");
    gallery.push(
      compact({
        image: images.add(block.src, dir, `galeria-${n}`),
        alt: `Fotografia del ${spec.title.charAt(0).toLowerCase()}${spec.title.slice(1)} (${n})`,
        caption,
      }),
    );
  }

  if (spec.video) {
    const video = parsePage(wpPage(spec.video).content.rendered).find((b) => b.type === "video");
    review.push(
      `${spec.slug}: upload ${video?.type === "video" ? video.src : spec.video} to YouTube and set youtubeId (F3-5)`,
    );
  }

  await writeEntry(
    `concerts/${spec.slug}.md`,
    {
      title: spec.title,
      date: spec.date,
      location: row.location,
      city: row.city,
      description: firstParagraph(main),
      poster: poster?.type === "image" ? images.add(poster.src, dir, "poster") : undefined,
      posterAlt: poster
        ? `Fotografia del ${spec.title.charAt(0).toLowerCase()}${spec.title.slice(1)}`
        : undefined,
      program: [],
      gallery,
      audios,
    },
    toMarkdoc(dedupe([...intro, ...program])),
  );
}

async function migrateConcerts(recordings: AudioEntry[]) {
  const rows = concertTable();
  const used = new Set<string>();
  const anniversary = new Map<string, (typeof ANNIVERSARY_CONCERTS)[number]>(
    ANNIVERSARY_CONCERTS.map((c) => [c.date, c]),
  );

  for (const row of rows) {
    const spec = anniversary.get(row.date);
    if (spec) {
      const audios = recordings.filter((a) => a.concert === spec.slug).map((a) => a.slug);
      await migrateAnniversaryConcert(spec, row, audios);
      used.add(spec.slug);
      anniversary.delete(row.date);
      continue;
    }
    const base = truncateSlug(`${row.date}-${slugify(row.title)}`);
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
    used.add(slug);
    const body: BodyBlock[] = row.notes
      ? [{ type: "paragraph", md: escapeLineStart(escapeInline(row.notes)), text: row.notes }]
      : [];
    await writeEntry(
      `concerts/${slug}.md`,
      {
        title: row.title,
        date: row.date,
        location: row.location,
        city: row.city,
        program: [],
        gallery: [],
        audios: [],
      },
      toMarkdoc(body),
    );
  }
  if (anniversary.size) {
    throw new Error(`Anniversary concerts missing from the table: ${[...anniversary.keys()]}`);
  }
  review.push(
    'concerts: table text kept as in WordPress (typos such as "Parr?quia", abbreviations)',
  );
  console.log(`concerts: ${rows.length}`);
}

// ---------------------------------------------------------------------------
// Global settings

async function migrateSettings() {
  const file = path.join(CONTENT_DIR, "configuracio.yaml");
  const settings = (yaml.load(await readFile(file, "utf8")) ?? {}) as Data;
  const contact = (settings.contact ?? {}) as Data;
  settings.contact = {
    ...contact,
    email: contact.email || CONTACT.email,
    address: contact.address || CONTACT.address,
  };
  await writeFile(file, yaml.dump(settings));
}

// ---------------------------------------------------------------------------

async function main() {
  const existing = [];
  for (const dir of GENERATED_DIRS) {
    if (await fileExists(path.join(CONTENT_DIR, dir))) existing.push(dir);
  }
  if (existing.length && !args.has("--overwrite")) {
    throw new Error(
      `content/{${existing.join(",")}} already exist. Re-running the migration discards ` +
        "manual edits: pass --overwrite if that is really what you want.",
    );
  }
  for (const dir of existing) await rm(path.join(CONTENT_DIR, dir), { recursive: true });

  const pageSpecs: PageSpec[] = [
    { wp: "qui-som", file: "qui-som", featured: true },
    { wp: "historia", file: "historia" },
    { wp: "projectes", file: "projectes" },
    {
      wp: "75e-aniversari",
      file: "75e-aniversari",
      featured: true,
      extra: { concerts: ANNIVERSARY_CONCERTS.map((c) => c.slug) },
    },
    { wp: "enregistraments", file: "enregistraments", featured: true },
    {
      wp: "contacte",
      file: "contacte",
      headingsAsText: true,
    },
    { wp: "avis-legal", file: "avis-legal" },
    { wp: "politica-de-cookies", file: "politica-de-cookies" },
    { wp: "politica-de-privacitat", file: "politica-de-privacitat" },
  ];

  await migrateHome();
  for (const spec of pageSpecs) await migratePage(spec);
  console.log(`pages: ${pageSpecs.length + 1}`);

  await migrateDirectors();
  const tracks = diversitatAudios();
  const recordings = [rubiRecording()];
  await migrateAudios([...tracks, ...recordings]);
  await migrateDiscography(tracks);
  await migrateConcerts(recordings);
  await migrateSettings();

  const handled = new Set([
    "inici",
    ...pageSpecs.map((s) => s.wp),
    ...ANNIVERSARY_CONCERTS.map((c) => c.page),
    ...Object.keys(MERGED_PAGES),
  ]);
  for (const page of pages) {
    if (!handled.has(page.slug)) review.push(`page "${page.slug}" was not migrated`);
  }

  const { written, skipped } = await images.process();
  const pruned = await images.prune(GENERATED_DIRS);
  console.log(`images: ${written} written, ${skipped} already present, ${pruned} unused removed`);
  console.log(`\nTo review (${review.length}):\n- ${review.join("\n- ")}`);
}

await main();
