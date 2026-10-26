import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { fileExists, normaliseUploadUrl, uploadPath } from "./wp.mts";

// Uploads the MP3s referenced by content/audios/*.yaml from the WordPress
// backup to Vercel Blob and points each entry at its new public URL.
// Needs BLOB_READ_WRITE_TOKEN (in .env.local or the environment). Idempotent:
// entries that already point to Blob are skipped. See docs/migracio.md.

const AUDIOS_DIR = path.resolve("content/audios");
const MAPPING_FILE = path.resolve("scripts/migrate-wp/audio-urls.json");
const URL_LINE = /^url:\s*(\S+)\s*$/m;

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set (see .env.example and docs/migracio.md).");
  process.exit(1);
}

const mapping: Record<string, string> = (await fileExists(MAPPING_FILE))
  ? JSON.parse(await readFile(MAPPING_FILE, "utf8"))
  : {};

let uploaded = 0;
for (const name of (await readdir(AUDIOS_DIR)).filter((n) => n.endsWith(".yaml")).sort()) {
  const file = path.join(AUDIOS_DIR, name);
  const yaml = await readFile(file, "utf8");
  const current = URL_LINE.exec(yaml)?.[1]?.replace(/^['"]|['"]$/g, "");
  if (!current || !current.includes("/wp-content/uploads/")) continue;

  const source = normaliseUploadUrl(current);
  let url = mapping[source];
  if (!url) {
    const local = uploadPath(source);
    const { size } = await stat(local);
    const pathname = `audios/${path.basename(local)}`;
    console.log(`Uploading ${pathname} (${(size / 1024 / 1024).toFixed(1)} MB)…`);
    const blob = await put(pathname, createReadStream(local), {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
      multipart: size > 50 * 1024 * 1024,
    });
    url = blob.url;
    mapping[source] = url;
    await writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2) + "\n");
    uploaded++;
  }
  await writeFile(file, yaml.replace(URL_LINE, `url: ${url}`));
  console.log(`${name}: ${url}`);
}
console.log(`Done: ${uploaded} files uploaded.`);
