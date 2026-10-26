import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";

export function createContentReader(rootDir: string = process.cwd()) {
  return createReader(rootDir, config);
}

export type ContentReader = ReturnType<typeof createContentReader>;

let defaultReader: ContentReader | undefined;

export function getDefaultReader(): ContentReader {
  defaultReader ??= createContentReader();
  return defaultReader;
}
