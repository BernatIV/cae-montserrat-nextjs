// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parsePage } from "./html.mts";
import { baseName, decodeBmp, slugify } from "./images.mts";
import { toMarkdoc } from "./markdoc.mts";
import {
  capitalise,
  cleanCell,
  parseCatalanDate,
  sameHeading,
  summary,
  truncateSlug,
} from "./text.mts";

describe("text helpers", () => {
  it.each([
    ["7 octubre de 1948", "1948-10-07"],
    ["18 de juny del 2023", "2023-06-18"],
    ["14 d'abril del 2024", "2024-04-14"],
    ["3 d’agost del 1960", "1960-08-03"],
    ["2 de març de 1999", "1999-03-02"],
    ["2002.09.07", "2002-09-07"],
  ])("parses the date %s", (input, expected) => {
    expect(parseCatalanDate(input)).toBe(expected);
  });

  it("rejects unknown dates", () => {
    expect(() => parseCatalanDate("primavera de 1950")).toThrow();
  });

  it("cleans SQL escaping from table cells", () => {
    expect(cleanCell("'Sant Pere d''Abrera'")).toBe("Sant Pere d'Abrera");
    expect(cleanCell("  Basílica   de Montserrat ")).toBe("Basílica de Montserrat");
  });

  it("summarises to the first full sentence, ignoring abbreviations", () => {
    expect(summary("Assaig al carrer dels Arcs núm. 7 de Barcelona. Segona frase.")).toBe(
      "Assaig al carrer dels Arcs núm. 7 de Barcelona.",
    );
    expect(summary("Concert a la Parròquia de Ntra. Sra. de la Bonanova. Després.")).toBe(
      "Concert a la Parròquia de Ntra. Sra. de la Bonanova.",
    );
    expect(summary("Escena de «La Passió de Barcelona» de Josep M. Coll i Xavier Torra. Fi.")).toBe(
      "Escena de «La Passió de Barcelona» de Josep M. Coll i Xavier Torra.",
    );
    expect(summary("una paraula ".repeat(40), 30)).toBe("una paraula una paraula una…");
  });

  it("compares headings loosely", () => {
    expect(sameHeading("🔹 1. Avís legal", "avís legal")).toBe(true);
    expect(sameHeading("🔹 Avís  legal", "Avís legal")).toBe(true);
    expect(sameHeading("HISTÒRIA", "Història")).toBe(true);
  });

  it("capitalises and truncates", () => {
    expect(capitalise("àudio")).toBe("Àudio");
    expect(truncateSlug("a-".repeat(40) + "b", 10)).toBe("a-a-a-a-a");
  });
});

describe("parsePage", () => {
  const widget = (type: string, html: string) =>
    `<div data-widget_type="${type}.default"><div class="elementor-widget-container">${html}</div></div>`;

  it("reads Elementor widgets in order", () => {
    const html = [
      widget(
        "text-editor",
        "<h4><strong>1958 – VIATGE</strong></h4><p>Text *amb* <b>negreta</b><br>Línia 2</p>",
      ),
      widget(
        "image",
        '<img src="https://caemontserrat.cat/wp-content/uploads/2023/06/foto-300x200.jpg" alt="">',
      ),
      widget("divider", "<hr>"),
      widget(
        "button",
        '<a href="https://caemontserrat.cat/historia"><span class="elementor-button-text">&gt; Història</span></a>',
      ),
      widget(
        "wp-widget-media_audio",
        '<h5>Puer natus est (Gregorià)</h5><audio><source src="https://caemontserrat.cat/a.mp3?_=1"></audio>',
      ),
      widget("form", "<form><input></form>"),
    ].join("");
    expect(parsePage(html)).toEqual([
      { type: "heading", level: 4, md: "1958 – VIATGE", text: "1958 – VIATGE" },
      { type: "paragraph", md: "Text \\*amb\\* **negreta**", text: "Text *amb* negreta" },
      { type: "paragraph", md: "Línia 2", text: "Línia 2" },
      {
        type: "image",
        src: "https://caemontserrat.cat/wp-content/uploads/2023/06/foto-300x200.jpg",
        alt: "",
      },
      { type: "divider" },
      { type: "button", label: "Història", href: "/historia/" },
      { type: "audio", title: "Puer natus est (Gregorià)", src: "https://caemontserrat.cat/a.mp3" },
    ]);
  });

  it("reads plain HTML pages and tables", () => {
    const html =
      "<h3>Dades</h3><ul><li>NIF: <strong>G1</strong></li></ul>" +
      "<table><thead><tr><th>Data</th><th>Lloc</th></tr></thead>" +
      "<tbody><tr><td>1 de maig de 1950</td><td>Sant<br>Cugat</td></tr></tbody></table>";
    expect(parsePage(html)).toEqual([
      { type: "heading", level: 3, md: "Dades", text: "Dades" },
      { type: "list", ordered: false, items: ["NIF: **G1**"] },
      { type: "table", header: ["Data", "Lloc"], rows: [["1 de maig de 1950", "Sant Cugat"]] },
    ]);
  });

  it("escapes text that would start a Markdown block", () => {
    expect(parsePage("<p>1. Primer</p><p># no és títol</p>")).toEqual([
      { type: "paragraph", md: "1\\. Primer", text: "1. Primer" },
      { type: "paragraph", md: "\\# no és títol", text: "# no és títol" },
    ]);
  });
});

describe("toMarkdoc", () => {
  it("serialises blocks to valid Markdoc", () => {
    const md = toMarkdoc([
      { type: "heading", level: 2, md: "Programa", text: "Programa" },
      { type: "paragraph", md: "Text", text: "Text" },
      { type: "image", src: "/images/a.webp", alt: "Una foto" },
      { type: "divider" },
      { type: "table", header: ["Data", "Lloc"], rows: [["1950", "Montserrat"]] },
    ]);
    expect(md).toContain(
      "## Programa\n\nText\n\n![Una foto](/images/a.webp)\n\n---\n\n{% table %}",
    );
    expect(md).toContain("- Data\n- Lloc\n---\n- 1950\n- Montserrat");
  });
});

describe("image helpers", () => {
  it("builds slugs and base names", () => {
    expect(slugify("Música mossàrab · Col·lecció")).toBe("musica-mossarab-colleccio");
    expect(
      baseName("https://caemontserrat.cat/wp-content/uploads/2023/06/DSC08362-scaled.jpg"),
    ).toBe("dsc08362");
    expect(
      baseName("https://caemontserrat.cat/wp-content/uploads/2023/06/Foto%201-1024x768.png"),
    ).toBe("foto-1");
  });

  it("decodes 24-bit and 8-bit BMPs", () => {
    const header = (bpp: number, dataOffset: number, size: number, colours = 0) => {
      const buffer = Buffer.alloc(size);
      buffer.write("BM", 0, "ascii");
      buffer.writeUInt32LE(dataOffset, 10);
      buffer.writeUInt32LE(40, 14);
      buffer.writeInt32LE(1, 18); // width
      buffer.writeInt32LE(2, 22); // height (bottom-up)
      buffer.writeUInt16LE(bpp, 28);
      buffer.writeUInt32LE(colours, 46);
      return buffer;
    };
    // 24-bit, rows padded to 4 bytes, bottom row first (BGR).
    const rgb = header(24, 54, 54 + 8);
    rgb.set([0, 0, 255], 54); // bottom: red
    rgb.set([255, 0, 0], 58); // top: blue
    expect(decodeBmp(rgb)).toEqual({
      data: Buffer.from([0, 0, 255, 255, 0, 0]),
      width: 1,
      height: 2,
    });

    const paletted = header(8, 54 + 8, 54 + 8 + 8, 2);
    paletted.set([0, 255, 0, 0], 54); // colour 0: green
    paletted.set([255, 255, 255, 0], 58); // colour 1: white
    paletted[62] = 0;
    paletted[66] = 1;
    expect(decodeBmp(paletted).data).toEqual(Buffer.from([255, 255, 255, 0, 255, 0]));
  });
});
