import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

export type ImageSize = { width: number; height: number };

const publicDir = path.join(process.cwd(), "public");
const cache = new Map<string, ImageSize | null>();

/**
 * Reads the intrinsic size of an image stored in `public/` (e.g.
 * `/images/historia/1.webp`), so `next/image` can reserve its space.
 * Returns null for remote images or files that can't be read.
 */
export function getLocalImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;
  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  let size: ImageSize | null = null;
  try {
    const file = path.join(publicDir, decodeURIComponent(src.split(/[?#]/)[0] ?? ""));
    if (file.startsWith(publicDir + path.sep)) {
      const { width, height } = imageSize(readFileSync(file));
      if (width && height) size = { width, height };
    }
  } catch {
    size = null;
  }
  cache.set(src, size);
  return size;
}
