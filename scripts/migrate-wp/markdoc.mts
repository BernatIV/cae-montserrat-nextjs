import Markdoc from "@markdoc/markdoc";
import { escapeInline, type Block } from "./html.mts";

// Serialises blocks to a Markdoc document (the body of a Keystatic entry).

export type BodyBlock = Exclude<Block, { type: "audio" } | { type: "video" }>;

function tableCell(text: string): string {
  return text ? escapeInline(text).replace(/^([-+*#>])/, "\\$1") : "";
}

function serialiseBlock(block: BodyBlock): string {
  switch (block.type) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.md}`;
    case "paragraph":
      return block.md;
    case "list":
      return block.items
        .map((item, i) => `${block.ordered ? `${i + 1}.` : "-"} ${item}`)
        .join("\n");
    case "image":
      return `![${escapeInline(block.alt)}](${block.src})`;
    case "button":
      return `[${escapeInline(block.label)}](${block.href})`;
    case "divider":
      return "---";
    case "table": {
      const lines = ["{% table %}"];
      const rows = block.header.length ? [block.header, ...block.rows] : block.rows;
      rows.forEach((row, i) => {
        if (i > 0) lines.push("---");
        for (const cell of row) lines.push(`- ${tableCell(cell)}`.trimEnd());
      });
      lines.push("{% /table %}");
      return lines.join("\n");
    }
  }
}

/** Builds the document and checks that Markdoc parses it without errors. */
export function toMarkdoc(blocks: readonly BodyBlock[]): string {
  if (!blocks.length) return "";
  const source = blocks.map(serialiseBlock).join("\n\n") + "\n";
  const errors = Markdoc.validate(Markdoc.parse(source), {}).filter(
    (error) => error.error.level === "error" || error.error.level === "critical",
  );
  if (errors.length) {
    throw new Error(`Invalid Markdoc: ${errors.map((e) => e.error.message).join("; ")}`);
  }
  return source;
}
