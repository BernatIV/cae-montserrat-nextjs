import { describe, expect, it } from "vitest";
import { isActivePath, isInternalHref, legacyRedirects, normalizeHref } from "./routes";

describe("normalizeHref", () => {
  it("removes WordPress trailing slashes", () => {
    expect(normalizeHref("/qui-som/")).toBe("/qui-som");
    expect(normalizeHref("/")).toBe("/");
  });

  it("maps old WordPress URLs to the new routes", () => {
    expect(normalizeHref("/discografia-2/")).toBe("/discografia");
    expect(normalizeHref("/concert-de-rubi/")).toBe("/concerts/concert-de-rubi");
    expect(normalizeHref("/programa-de-montserrat")).toBe("/concerts/concert-de-montserrat");
  });

  it("makes absolute links to our own domain relative, keeping query and hash", () => {
    expect(normalizeHref("https://caemontserrat.cat/historia/")).toBe("/historia");
    expect(normalizeHref("https://www.caemontserrat.cat/concerts/?a=1#x")).toBe("/concerts?a=1#x");
  });

  it("leaves external, mail, anchor and upload links untouched", () => {
    for (const href of [
      "https://example.com/a/",
      "mailto:info@caemontserrat.cat",
      "#programa",
      "https://caemontserrat.cat/wp-content/uploads/a.mp3",
    ]) {
      expect(normalizeHref(href)).toBe(href);
    }
  });

  it("only redirects to existing-looking internal paths", () => {
    for (const [source, destination] of Object.entries(legacyRedirects)) {
      expect(source).toMatch(/^\/[a-z0-9-]+$/);
      expect(isInternalHref(destination)).toBe(true);
    }
  });
});

describe("isActivePath", () => {
  it("matches the page and its descendants", () => {
    expect(isActivePath("/concerts", "/concerts/concert-de-rubi")).toBe(true);
    expect(isActivePath("/concerts", "/concerts")).toBe(true);
    expect(isActivePath("/", "/concerts")).toBe(false);
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/audio", "/audios")).toBe(false);
  });
});
