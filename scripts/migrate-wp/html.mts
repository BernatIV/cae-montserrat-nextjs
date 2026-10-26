import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { WP_ORIGIN } from "./wp.mts";

// Turns the rendered HTML of a WordPress/Elementor page into a flat list of
// blocks. Text is converted to escaped Markdown (Markdoc-compatible) inline.

export type Block =
  | { type: "heading"; level: number; md: string; text: string }
  | { type: "paragraph"; md: string; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string }
  | { type: "button"; label: string; href: string }
  | { type: "divider" }
  | { type: "audio"; title: string; src: string }
  | { type: "video"; src: string };

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "section",
  "article",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "table",
  "blockquote",
  "hr",
  "img",
  "audio",
  "video",
  "form",
]);
const SKIP_TAGS = new Set(["script", "style", "svg", "form", "noscript", "iframe"]);

/** Collapses whitespace (including non-breaking spaces). */
export function cleanText(text: string): string {
  return text.replace(/[\s\u00a0\u200b]+/g, " ").trim();
}

/** Escapes Markdown/Markdoc syntax inside a run of text. */
export function escapeInline(text: string): string {
  return text.replace(/[\\`*_[\]~]/g, "\\$&").replace(/\{%/g, "\\{%");
}

/** Escapes characters that would start a block construct at the beginning of a line. */
export function escapeLineStart(md: string): string {
  return md
    .replace(/^(\d+)([.)])(\s)/, "$1\\$2$3")
    .replace(/^([#>+-])/, "\\$1")
    .replace(/^(=+|-+)$/, "\\$1");
}

/** Converts WordPress links to site-relative paths; keeps external links as they are. */
export function normaliseHref(href: string): string {
  const value = href.trim();
  if (value.startsWith(WP_ORIGIN) && !value.includes("/wp-content/")) {
    const path = value.slice(WP_ORIGIN.length).replace(/\/{2,}/g, "/") || "/";
    return path.endsWith("/") || path.includes("?") || path.includes("#") ? path : `${path}/`;
  }
  return value;
}

function encodeUrl(url: string): string {
  return url.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function isElement(node: AnyNode): node is Element {
  return node.type === "tag" || node.type === "script" || node.type === "style";
}

function hasBlockContent($: cheerio.CheerioAPI, el: Element): boolean {
  return BLOCK_TAGS.has(el.tagName) || $(el).find([...BLOCK_TAGS].join(",")).length > 0;
}

/** Wraps `inner` with a Markdown marker, keeping surrounding spaces outside it. */
function wrap(inner: string, marker: string): string {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner)!;
  return match[2] ? `${match[1]}${marker}${match[2]}${marker}${match[3]}` : inner;
}

/** Inline Markdown of a node. `<br>` becomes "\n" so callers can split paragraphs. */
function inline($: cheerio.CheerioAPI, node: AnyNode): string {
  if (node.type === "text") return escapeInline(node.data.replace(/[\s\u00a0\u200b]+/g, " "));
  if (!isElement(node) || SKIP_TAGS.has(node.tagName)) return "";
  const children = () => node.children.map((child) => inline($, child)).join("");
  switch (node.tagName) {
    case "br":
      return "\n";
    case "strong":
    case "b":
      return wrap(children(), "**");
    case "em":
    case "i":
      return wrap(children(), "*");
    case "a": {
      const text = children();
      const href = $(node).attr("href");
      if (!href || !text.trim()) return text;
      return wrap(text, "").replace(
        text.trim(),
        `[${text.trim()}](${encodeUrl(normaliseHref(href))})`,
      );
    }
    default:
      return children();
  }
}

function textOf(md: string): string {
  return cleanText(
    md
      .replace(/(?<!\\)\[((?:\\.|[^\]\\])*)\]\([^)]*\)/g, "$1")
      .replace(/(?<!\\)\*+/g, "")
      .replace(/\\(.)/g, "$1"),
  );
}

function pushParagraphs(blocks: Block[], md: string) {
  for (const part of md.split("\n")) {
    const value = part.replace(/ {2,}/g, " ").trim();
    // Markers left without text (e.g. "** **") are dropped.
    if (!value || !textOf(value)) continue;
    blocks.push({ type: "paragraph", md: escapeLineStart(value), text: textOf(value) });
  }
}

/** Converts a fragment of HTML (a list of sibling nodes) into blocks. */
export function nodesToBlocks($: cheerio.CheerioAPI, nodes: AnyNode[]): Block[] {
  const blocks: Block[] = [];
  let buffer = "";
  const flush = () => {
    pushParagraphs(blocks, buffer);
    buffer = "";
  };

  for (const node of nodes) {
    if (!isElement(node) || !hasBlockContent($, node)) {
      buffer += inline($, node);
      continue;
    }
    flush();
    const tag = node.tagName;
    if (/^h[1-6]$/.test(tag)) {
      const md = node.children
        .map((child) => inline($, child))
        .join("")
        .replace(/\s*\n\s*/g, " ")
        .replace(/ {2,}/g, " ")
        .trim()
        .replace(/^\*\*(.*)\*\*$/, "$1");
      const text = textOf(md);
      if (text) {
        blocks.push({ type: "heading", level: Number(tag[1]), md: escapeLineStart(md), text });
      }
      // Images inside headings are rare but must not be lost.
      $(node)
        .find("img")
        .each((_, img) => {
          blocks.push(imageBlock($, img));
        });
    } else if (tag === "ul" || tag === "ol") {
      const items = $(node)
        .children("li")
        .toArray()
        .map((li) =>
          li.children
            .map((child) => inline($, child))
            .join("")
            .replace(/\s*\n\s*/g, " ")
            .trim(),
        )
        .filter((item) => textOf(item));
      if (items.length) blocks.push({ type: "list", ordered: tag === "ol", items });
    } else if (tag === "table") {
      const rows = $(node)
        .find("tr")
        .toArray()
        .map((tr) =>
          $(tr)
            .children("td,th")
            .toArray()
            .map((cell) => {
              $(cell).find("br").replaceWith(" ");
              return cleanText($(cell).text());
            }),
        );
      const hasHead = $(node).find("thead").length > 0;
      blocks.push({
        type: "table",
        header: hasHead ? (rows[0] ?? []) : [],
        rows: hasHead ? rows.slice(1) : rows,
      });
    } else if (tag === "hr") {
      blocks.push({ type: "divider" });
    } else if (tag === "img") {
      blocks.push(imageBlock($, node));
    } else if (tag === "audio") {
      const src = $(node).find("source").first().attr("src") ?? $(node).attr("src");
      if (src) blocks.push({ type: "audio", title: "", src });
    } else if (tag === "video") {
      const src = $(node).attr("src") ?? $(node).find("source").first().attr("src");
      if (src) blocks.push({ type: "video", src });
    } else if (!SKIP_TAGS.has(tag)) {
      blocks.push(...nodesToBlocks($, node.children));
    }
  }
  flush();
  return blocks;
}

function imageBlock($: cheerio.CheerioAPI, img: Element): Block {
  return { type: "image", src: $(img).attr("src") ?? "", alt: cleanText($(img).attr("alt") ?? "") };
}

/** Parses a rendered page. Elementor pages are read widget by widget, in document order. */
export function parsePage(html: string): Block[] {
  const $ = cheerio.load(html, null, false);
  const widgets = $("[data-widget_type]").toArray();
  if (!widgets.length) return nodesToBlocks($, $.root().contents().toArray());

  const blocks: Block[] = [];
  for (const widget of widgets) {
    const kind = ($(widget).attr("data-widget_type") ?? "").split(".")[0];
    const container = $(widget).children(".elementor-widget-container");
    const root = container.length ? container : $(widget);
    switch (kind) {
      case "text-editor":
        blocks.push(...nodesToBlocks($, root.contents().toArray()));
        break;
      case "image":
        root.find("img").each((_, img) => {
          blocks.push(imageBlock($, img));
        });
        break;
      case "button": {
        const link = root.find("a").first();
        const label = cleanText(root.find(".elementor-button-text").text() || link.text());
        const href = link.attr("href");
        if (href && label) {
          blocks.push({
            type: "button",
            label: label.replace(/^>\s*/, ""),
            href: normaliseHref(href),
          });
        }
        break;
      }
      case "divider":
        blocks.push({ type: "divider" });
        break;
      case "wp-widget-media_audio": {
        const title = cleanText(root.find("h1,h2,h3,h4,h5,h6").first().text());
        const src =
          root.find("audio source").first().attr("src") ?? root.find("audio a").attr("href");
        if (src) blocks.push({ type: "audio", title, src: src.split("?")[0]! });
        break;
      }
      case "video": {
        const src = root.find("video").attr("src");
        if (src) blocks.push({ type: "video", src });
        break;
      }
      case "form":
        break;
      default:
        console.warn(`Unknown Elementor widget "${kind}": converted as text.`);
        blocks.push(...nodesToBlocks($, root.contents().toArray()));
    }
  }
  return blocks;
}
