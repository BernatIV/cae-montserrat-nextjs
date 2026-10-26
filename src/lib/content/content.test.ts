// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import config from "../../../keystatic.config";
import { createContentReader } from "./reader";

// Checks the real content in content/ (not the fixtures): every entry must
// match the Keystatic schema, images must exist and relationships must resolve.

const root = path.resolve(__dirname, "../../..");
const reader = createContentReader(root);
const collections = Object.keys(config.collections) as (keyof typeof config.collections)[];
const singletons = Object.keys(config.singletons) as (keyof typeof config.singletons)[];

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => path.join(e.parentPath, e.name));
}

describe("content/", () => {
  it.each(collections)("collection %s matches the schema", async (name) => {
    const entries = await reader.collections[name].all({ resolveLinkedFiles: true });
    expect(Array.isArray(entries)).toBe(true);
  });

  it.each(singletons)("singleton %s matches the schema", async (name) => {
    expect(await reader.singletons[name].read({ resolveLinkedFiles: true })).not.toBeNull();
  });

  it("only references images that exist in public/", async () => {
    const missing: string[] = [];
    for (const file of await files(path.join(root, "content"))) {
      const text = await readFile(file, "utf8");
      for (const [src] of text.matchAll(/\/images\/[^\s)'"]+/g)) {
        if (!existsSync(path.join(root, "public", ...src.split("/")))) {
          missing.push(`${path.relative(root, file)}: ${src}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("has relationships that point to existing entries", async () => {
    const slugs = async (name: (typeof collections)[number]) =>
      new Set(await reader.collections[name].list());
    const concerts = await slugs("concerts");
    const albums = await slugs("discografia");
    const audios = await slugs("audios");
    const broken: string[] = [];

    for (const { slug, entry } of await reader.collections.audios.all()) {
      if (entry.concert && !concerts.has(entry.concert)) broken.push(`audio ${slug} → ${entry.concert}`);
      if (entry.album && !albums.has(entry.album)) broken.push(`audio ${slug} → ${entry.album}`);
    }
    for (const { slug, entry } of await reader.collections.concerts.all()) {
      for (const audio of entry.audios) {
        if (!audios.has(audio)) broken.push(`concert ${slug} → ${audio}`);
      }
    }
    const anniversary = await reader.singletons.aniversari75.read();
    for (const concert of anniversary?.concerts ?? []) {
      if (!concerts.has(concert)) broken.push(`75è aniversari → ${concert}`);
    }
    expect(broken).toEqual([]);
  });
});
