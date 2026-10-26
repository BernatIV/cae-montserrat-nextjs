import type { Metadata } from "next";
import { t } from "@/lib/i18n";

const ui = t();

/** Canonical origin of the site. Override with NEXT_PUBLIC_SITE_URL (e.g. for previews). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://caemontserrat.cat").replace(
  /\/+$/,
  "",
);

export const defaultOgImage = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Fotografia de la Coral d'Antics Escolans de Montserrat",
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

type PageMetadataInput = {
  title?: string;
  description?: string | null;
  path: string;
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article";
};

/** Title, description, canonical URL and Open Graph data for a page. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: PageMetadataInput): Metadata {
  const desc = description?.trim() || ui.siteDescription;
  const images = image ? [{ url: image, alt: imageAlt || title || ui.siteName }] : [defaultOgImage];
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "ca_ES",
      siteName: ui.siteName,
      title: title ?? ui.siteName,
      description: desc,
      url: path,
      images,
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Plain-text excerpt for meta descriptions. */
export function excerpt(text: string | null | undefined, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

type Settings = {
  social: readonly { url: string }[];
  contact: { email: string; phone: string; address: string };
};

export function musicGroupJsonLd(settings: Settings) {
  const [street, locality] = settings.contact.address.split("\n");
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${siteUrl}/#organization`,
    name: ui.siteName,
    alternateName: ["CAEM", ui.siteShortName],
    url: `${siteUrl}/`,
    logo: absoluteUrl("/icon.png"),
    image: absoluteUrl(defaultOgImage.url),
    foundingDate: "1948",
    genre: "Música coral",
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
    ...(street
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: street.trim(),
            ...(locality ? { addressLocality: locality.trim() } : {}),
            addressCountry: "ES",
          },
        }
      : {}),
    ...(settings.social.length ? { sameAs: settings.social.map((s) => s.url) } : {}),
  };
}

type ConcertForJsonLd = {
  slug: string;
  title: string;
  date: string | null;
  time?: string | null;
  location?: string | null;
  city?: string | null;
  description?: string | null;
  poster?: string | null;
};

export function musicEventJsonLd(concert: ConcertForJsonLd) {
  if (!concert.date) return null;
  const place = concert.location || concert.city;
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: concert.title,
    startDate: concert.time ? `${concert.date}T${concert.time}` : concert.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/concerts/${concert.slug}`),
    ...(concert.description ? { description: concert.description } : {}),
    ...(concert.poster ? { image: absoluteUrl(concert.poster) } : {}),
    ...(place
      ? {
          location: {
            "@type": "Place",
            name: place,
            address: concert.city || place,
          },
        }
      : {}),
    performer: { "@id": `${siteUrl}/#organization`, "@type": "MusicGroup", name: ui.siteName },
    organizer: { "@id": `${siteUrl}/#organization`, "@type": "MusicGroup", name: ui.siteName },
  };
}
