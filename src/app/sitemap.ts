import type { MetadataRoute } from "next";
import { getConcerts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

const staticPaths = [
  "/",
  "/qui-som",
  "/historia",
  "/concerts",
  "/directors",
  "/75e-aniversari",
  "/enregistraments",
  "/discografia",
  "/audios",
  "/contacte",
  "/projectes",
  "/avis-legal",
  "/politica-de-privacitat",
  "/politica-de-cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const concerts = await getConcerts();
  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...concerts.map((concert) => ({
      url: absoluteUrl(`/concerts/${concert.slug}`),
      ...(concert.date ? { lastModified: concert.date } : {}),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
