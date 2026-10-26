import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { downloadUpload, fileExists, mapLimit, normaliseUploadUrl, type WpMedia } from "./wp.mts";

// Downloads the originals of the images used in the pages and writes optimised
// WebP copies to public/images (max 2000 px on the long edge).

export const MAX_SIZE = 2000;
export const WEBP_QUALITY = 80;

/** Lowercase ASCII slug (Catalan accents removed, l·l → ll). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[·•]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Clean base name for an uploaded file: no extension, size suffix or "-scaled". */
export function baseName(url: string): string {
  const file = decodeURIComponent(normaliseUploadUrl(url).split("/").pop() ?? "");
  const name = file
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-\d+x\d+$/, "")
    .replace(/-scaled(-\d+)?$/, "");
  return slugify(name) || "imatge";
}

/** Maps every URL of the media library (all sizes) to its attachment. */
export class MediaIndex {
  private byUrl = new Map<string, WpMedia>();

  constructor(media: readonly WpMedia[]) {
    for (const item of media) {
      this.byUrl.set(normaliseUploadUrl(item.source_url), item);
      for (const size of Object.values(item.media_details?.sizes ?? {})) {
        this.byUrl.set(normaliseUploadUrl(size.source_url), item);
      }
    }
  }

  find(url: string): WpMedia | undefined {
    const normalised = normaliseUploadUrl(url);
    return (
      this.byUrl.get(normalised) ??
      this.byUrl.get(normalised.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1"))
    );
  }
}

/** Decodes an uncompressed (BI_RGB) 8, 24 or 32-bit BMP, which sharp cannot read. */
export function decodeBmp(buffer: Buffer): { data: Buffer; width: number; height: number } {
  if (buffer.toString("ascii", 0, 2) !== "BM") throw new Error("Not a BMP file");
  const dataOffset = buffer.readUInt32LE(10);
  const headerSize = buffer.readUInt32LE(14);
  const width = buffer.readInt32LE(18);
  const rawHeight = buffer.readInt32LE(22);
  const bpp = buffer.readUInt16LE(28);
  const compression = buffer.readUInt32LE(30);
  if (compression !== 0 && !(compression === 3 && bpp === 32)) {
    throw new Error(`Unsupported BMP compression ${compression}`);
  }
  const height = Math.abs(rawHeight);
  const bottomUp = rawHeight > 0;
  const rowSize = Math.ceil((bpp * width) / 32) * 4;
  let palette: Buffer | null = null;
  if (bpp <= 8) {
    const colours = buffer.readUInt32LE(46) || 1 << bpp;
    palette = buffer.subarray(14 + headerSize, 14 + headerSize + colours * 4);
  } else if (bpp !== 24 && bpp !== 32) {
    throw new Error(`Unsupported BMP depth ${bpp}`);
  }

  const out = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const row = dataOffset + (bottomUp ? height - 1 - y : y) * rowSize;
    for (let x = 0; x < width; x++) {
      let b: number, g: number, r: number;
      if (palette) {
        const index = buffer[row + x]!;
        b = palette[index * 4]!;
        g = palette[index * 4 + 1]!;
        r = palette[index * 4 + 2]!;
      } else {
        const p = row + x * (bpp / 8);
        b = buffer[p]!;
        g = buffer[p + 1]!;
        r = buffer[p + 2]!;
      }
      const o = (y * width + x) * 3;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
    }
  }
  return { data: out, width, height };
}

export async function optimiseImage(input: string, output: string): Promise<void> {
  const buffer = await readFile(input);
  const image =
    buffer.toString("ascii", 0, 2) === "BM"
      ? (() => {
          const { data, width, height } = decodeBmp(buffer);
          return sharp(data, { raw: { width, height, channels: 3 } });
        })()
      : sharp(buffer).rotate();
  await mkdir(path.dirname(output), { recursive: true });
  await image
    .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(output);
}

type Job = { url: string; output: string };

/**
 * Collects the images a page uses. `add` returns the public path at once;
 * `process` downloads and optimises everything that was added.
 */
export class ImageStore {
  private jobs = new Map<string, Job>();
  private usedNames = new Map<string, Set<string>>();

  private media: MediaIndex;
  private publicDir: string;
  private force: boolean;

  constructor(media: MediaIndex, publicDir: string, force = false) {
    this.media = media;
    this.publicDir = publicDir;
    this.force = force;
  }

  /** Original URL (largest available size) of an image used in a page. */
  originalUrl(src: string): string {
    return this.media.find(src)?.source_url ?? normaliseUploadUrl(src);
  }

  altText(src: string): string {
    return this.media.find(src)?.alt_text.trim() ?? "";
  }

  /**
   * Registers an image. `dir` is relative to /images (e.g. "pagines/historia")
   * and `name` defaults to the WordPress file name.
   */
  add(src: string, dir: string, name?: string): string {
    const url = this.originalUrl(src);
    const used = this.usedNames.get(dir) ?? new Set<string>();
    this.usedNames.set(dir, used);
    const base = name ?? baseName(url);
    let candidate = base;
    for (let i = 2; used.has(candidate); i++) candidate = `${base}-${i}`;
    used.add(candidate);
    const publicPath = `/images/${dir}/${candidate}.webp`;
    this.jobs.set(publicPath, {
      url,
      output: path.join(this.publicDir, ...publicPath.split("/").filter(Boolean)),
    });
    return publicPath;
  }

  /** Deletes images under `public/images/<dir>` that no migrated content references. */
  async prune(dirs: readonly string[]): Promise<number> {
    const keep = new Set([...this.jobs.values()].map((job) => job.output));
    let removed = 0;
    for (const dir of dirs) {
      const root = path.join(this.publicDir, "images", dir);
      if (!(await fileExists(root))) continue;
      for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
        const file = path.join(entry.parentPath, entry.name);
        if (entry.isFile() && !keep.has(file)) {
          await rm(file);
          removed++;
        }
      }
    }
    return removed;
  }

  async process(): Promise<{ written: number; skipped: number }> {
    let written = 0;
    let skipped = 0;
    await mapLimit([...this.jobs.values()], 4, async ({ url, output }) => {
      if (!this.force && (await fileExists(output))) {
        skipped++;
        return;
      }
      const original = await downloadUpload(url);
      await optimiseImage(original, output);
      written++;
    });
    return { written, skipped };
  }
}
