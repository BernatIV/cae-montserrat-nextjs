import { describe, expect, it } from "vitest";
import { absoluteUrl, excerpt, musicEventJsonLd, musicGroupJsonLd, pageMetadata } from "./seo";

describe("pageMetadata", () => {
  it("sets canonical URL and Open Graph image", () => {
    const meta = pageMetadata({
      title: "Concerts",
      description: "Llista",
      path: "/concerts",
      image: "/images/a.webp",
      imageAlt: "A",
    });
    expect(meta.alternates?.canonical).toBe("/concerts");
    expect(meta.openGraph).toMatchObject({
      title: "Concerts",
      images: [{ url: "/images/a.webp", alt: "A" }],
    });
  });

  it("falls back to the default image and description", () => {
    const meta = pageMetadata({ path: "/" });
    expect(meta.title).toBeUndefined();
    expect(meta.description).toBeTruthy();
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/images/og-default.jpg" }),
    ]);
  });
});

describe("excerpt", () => {
  it("cuts long text on a word boundary", () => {
    const text = "paraula ".repeat(40);
    const result = excerpt(text, 50);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("JSON-LD", () => {
  it("describes the choir", () => {
    const data = musicGroupJsonLd({
      social: [{ url: "https://instagram.com/caem" }],
      contact: { email: "a@b.cat", phone: "", address: "Carrer 1\n08000 Barcelona" },
    });
    expect(data).toMatchObject({
      "@type": "MusicGroup",
      email: "a@b.cat",
      sameAs: ["https://instagram.com/caem"],
      address: { streetAddress: "Carrer 1", addressLocality: "08000 Barcelona" },
    });
    expect(data).not.toHaveProperty("telephone");
  });

  it("describes a concert, with time when available", () => {
    const data = musicEventJsonLd({
      slug: "x",
      title: "Concert",
      date: "2023-06-18",
      time: "20:00",
      location: "Basílica",
      city: "Montserrat",
      poster: "/images/p.webp",
    });
    expect(data).toMatchObject({
      "@type": "MusicEvent",
      startDate: "2023-06-18T20:00",
      url: absoluteUrl("/concerts/x"),
      location: { name: "Basílica", address: "Montserrat" },
    });
    expect(musicEventJsonLd({ slug: "y", title: "Sense data", date: null })).toBeNull();
  });
});
