import {
  BACKUP_DIR,
  downloadUpload,
  fetchCollection,
  mapLimit,
  readBackupJson,
  writeBackupJson,
  type WpMedia,
} from "./wp.mts";

// Full backup of the public WordPress content into wp-backup/ (git-ignored):
// REST JSON of every public type plus every file in the media library.
// The XML export from wp-admin still has to be done by hand (docs/migracio.md).

const COLLECTIONS = ["pages", "posts", "media", "categories", "tags", "users"] as const;

async function main() {
  for (const name of COLLECTIONS) {
    const items = await fetchCollection<unknown>(name);
    await writeBackupJson(name, items);
    console.log(`${name}: ${items.length}`);
  }

  const media = await readBackupJson<WpMedia[]>("media");
  const urls = new Set<string>();
  for (const item of media) {
    urls.add(item.source_url);
    if (item.media_details?.original_image) {
      urls.add(new URL(item.media_details.original_image, item.source_url).href);
    }
  }

  let failed = 0;
  await mapLimit([...urls], 6, async (url, i) => {
    try {
      await downloadUpload(url);
      if ((i + 1) % 25 === 0) console.log(`files: ${i + 1}/${urls.size}`);
    } catch (error) {
      failed++;
      console.warn(`! ${url}: ${(error as Error).message}`);
    }
  });
  console.log(`Backup in ${BACKUP_DIR}: ${urls.size - failed}/${urls.size} files.`);
  if (failed) process.exitCode = 1;
}

await main();
