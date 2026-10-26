import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// Shared access to the WordPress site and to the local backup (wp-backup/).

export const WP_ORIGIN = "https://caemontserrat.cat";
export const WP_API = `${WP_ORIGIN}/wp-json/wp/v2`;
export const BACKUP_DIR = path.resolve("wp-backup");
export const UPLOADS_PREFIX = `${WP_ORIGIN}/wp-content/uploads/`;

/** Old staging domain that still appears in a few `src` attributes. */
const LEGACY_ORIGINS = ["https://jordimanye.cat"];

export type WpPage = {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  modified: string;
};

export type WpMedia = {
  id: number;
  slug: string;
  mime_type: string;
  source_url: string;
  alt_text: string;
  title: { rendered: string };
  caption: { rendered: string };
  media_details?: {
    width?: number;
    height?: number;
    original_image?: string;
    sizes?: Record<string, { source_url: string }>;
  };
};

/** Fetches every item of a paginated REST collection. */
export async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${WP_API}/${endpoint}?per_page=100&page=${page}`);
    if (!res.ok) throw new Error(`GET ${endpoint} page ${page}: ${res.status}`);
    items.push(...((await res.json()) as T[]));
    const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
    if (page >= totalPages) return items;
  }
}

export function jsonPath(name: string): string {
  return path.join(BACKUP_DIR, "json", `${name}.json`);
}

export async function readBackupJson<T>(name: string): Promise<T> {
  try {
    return JSON.parse(await readFile(jsonPath(name), "utf8")) as T;
  } catch {
    throw new Error(`Missing ${jsonPath(name)}. Run "npm run wp:backup" first.`);
  }
}

export async function writeBackupJson(name: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(jsonPath(name)), { recursive: true });
  await writeFile(jsonPath(name), JSON.stringify(data, null, 2) + "\n");
}

/** Drops the query string and replaces legacy domains with the production one. */
export function normaliseUploadUrl(url: string): string {
  let result = url.split("?")[0]!;
  for (const origin of LEGACY_ORIGINS) {
    if (result.startsWith(origin)) result = WP_ORIGIN + result.slice(origin.length);
  }
  return result;
}

/** Local path of an uploaded file inside the backup. */
export function uploadPath(url: string): string {
  const normalised = normaliseUploadUrl(url);
  if (!normalised.startsWith(UPLOADS_PREFIX)) throw new Error(`Not an upload URL: ${url}`);
  const relative = decodeURIComponent(normalised.slice(UPLOADS_PREFIX.length));
  return path.join(BACKUP_DIR, "uploads", ...relative.split("/"));
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Downloads an uploaded file into the backup (skipped if already there) and returns its path. */
export async function downloadUpload(url: string): Promise<string> {
  const dest = uploadPath(url);
  if (await fileExists(dest)) return dest;
  const res = await fetch(normaliseUploadUrl(url));
  if (!res.ok || !res.body) throw new Error(`GET ${url}: ${res.status}`);
  await mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.part`;
  await pipeline(
    Readable.fromWeb(res.body as import("node:stream/web").ReadableStream<Uint8Array>),
    createWriteStream(tmp),
  );
  await rename(tmp, dest);
  return dest;
}

/** Runs `task` over `items` with at most `limit` running at once. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]!, index);
    }
  });
  await Promise.all(workers);
  return results;
}
