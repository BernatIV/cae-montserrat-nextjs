// @vitest-environment node
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createContentReader,
  getAnniversaryPage,
  getAudios,
  getConcert,
  getConcerts,
  getDirectors,
  getDiscography,
  getHomePage,
  getPage,
  getSettings,
} from ".";

const reader = createContentReader(path.join(__dirname, "__fixtures__"));
const emptyReader = createContentReader(path.join(__dirname, "__fixtures__", "missing"));

describe("content helpers", () => {
  it("reads the global settings", async () => {
    const settings = await getSettings(reader);
    expect(settings.menu.map((item) => item.label)).toEqual(["Inici", "75è Aniversari"]);
    expect(settings.menu[1]?.children[0]?.href).toBe("/concert-de-rubi/");
    expect(settings.social[0]).toEqual({
      network: "youtube",
      url: "https://www.youtube.com/@caemontserrat",
    });
    expect(settings.contact.email).toBe("info@example.com");
  });

  it("falls back to empty settings when the file is missing", async () => {
    const settings = await getSettings(emptyReader);
    expect(settings.menu).toEqual([]);
    expect(settings.social).toEqual([]);
  });

  it("reads a simple page with its Markdoc body", async () => {
    const page = await getPage("quiSom", reader);
    expect(page?.title).toBe("Qui som");
    expect(page?.description).toBe("La coral dels antics escolans.");
    expect(page?.image).toBeNull();
    expect(page?.body.node.type).toBe("document");
  });

  it("returns null for pages that don't exist yet", async () => {
    expect(await getPage("historia", reader)).toBeNull();
    expect(await getHomePage(reader)).toBeNull();
  });

  it("lists concerts newest first", async () => {
    const concerts = await getConcerts(reader);
    expect(concerts.map((c) => c.slug)).toEqual([
      "concert-futur",
      "concert-de-rubi",
      "concert-de-montserrat",
    ]);
    expect(concerts[1]?.title).toBe("Concert de Rubí");
  });

  it("reads a concert with programme, audios and video", async () => {
    const concert = await getConcert("concert-de-montserrat", reader);
    expect(concert?.location).toBe("Basílica de Montserrat");
    expect(concert?.program).toEqual([
      { work: "Virolai", composer: "Anselm Viola", notes: "" },
    ]);
    expect(concert?.youtubeId).toBe("dQw4w9WgXcQ");
    expect(concert?.audios.map((a) => a.slug)).toEqual(["ave-maria"]);
    expect(concert?.audios[0]?.url).toMatch(/\.mp3$/);
    expect(concert?.body.node.type).toBe("document");
  });

  it("returns null for an unknown concert", async () => {
    expect(await getConcert("no-existeix", reader)).toBeNull();
  });

  it("resolves the anniversary concerts in order, skipping missing ones", async () => {
    const page = await getAnniversaryPage(reader);
    expect(page?.concerts.map((c) => c.slug)).toEqual([
      "concert-de-rubi",
      "concert-de-montserrat",
    ]);
  });

  it("lists directors chronologically", async () => {
    const directors = await getDirectors(reader);
    expect(directors.map((d) => d.name)).toEqual(["Anna", "Joan"]);
  });

  it("lists albums newest first", async () => {
    const albums = await getDiscography(reader);
    expect(albums.map((a) => a.slug)).toEqual(["segon-disc", "primer-disc"]);
    expect(albums[1]?.tracks).toEqual([{ title: "Virolai", composer: "" }]);
  });

  it("lists audios", async () => {
    const audios = await getAudios(reader);
    expect(audios).toHaveLength(1);
    expect(audios[0]).toMatchObject({ slug: "ave-maria", concert: "concert-de-montserrat" });
  });
});
