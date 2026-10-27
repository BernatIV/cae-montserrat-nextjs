import Link from "next/link";
import { ConcertCard } from "@/components/concert-card";
import { ImageHero } from "@/components/image-hero";
import { JsonLd } from "@/components/json-ld";
import { MarkdocContent } from "@/components/markdoc";
import { UpcomingFilter } from "@/components/upcoming-filter";
import { getConcerts, getHomePage, getSettings, splitByDate } from "@/lib/content";
import { t } from "@/lib/i18n";
import { musicGroupJsonLd, pageMetadata } from "@/lib/seo";

const ui = t();

export async function generateMetadata() {
  const home = await getHomePage();
  return pageMetadata({
    path: "/",
    description: home?.description,
    image: home?.heroImage,
    imageAlt: home?.heroImageAlt,
  });
}

export default async function Home() {
  const [home, concerts, settings] = await Promise.all([
    getHomePage(),
    getConcerts(),
    getSettings(),
  ]);
  const { upcoming, past } = splitByDate(concerts);
  const recent = past.slice(0, 3);
  const heroText = (
    <>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        {home?.heroTitle || ui.siteName}
      </h1>
      {home?.heroText && (
        <p className="mt-4 max-w-2xl text-lg text-on-chrome-muted sm:text-xl">{home.heroText}</p>
      )}
    </>
  );

  return (
    <>
      <JsonLd data={musicGroupJsonLd(settings)} />

      {home?.heroImage ? (
        <ImageHero
          image={home.heroImage}
          imageAlt={home.heroImageAlt}
          fit="screen"
          next={{ href: "#proxims-concerts", label: ui.home.scrollDown }}
        >
          {heroText}
        </ImageHero>
      ) : (
        <div className="bg-chrome text-on-chrome theme-dark">
          <div className="container-site py-16 sm:py-24">{heroText}</div>
        </div>
      )}

      <section
        id="proxims-concerts"
        aria-labelledby="upcoming"
        className="-scroll-mt-4 bg-surface py-16"
      >
        <div className="container-site">
          <h2 id="upcoming" className="mb-8 text-3xl font-bold text-ink">
            {ui.home.upcoming}
          </h2>
          <UpcomingFilter
            items={upcoming.map((concert) => ({
              key: concert.slug,
              date: concert.date,
              node: <ConcertCard concert={concert} />,
            }))}
            empty={<p className="text-lg text-fg">{ui.home.noUpcoming}</p>}
          />
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent" className="py-16">
          <div className="container-site">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="recent" className="text-3xl font-bold text-ink">
                {ui.home.recent}
              </h2>
              <Link
                href="/concerts"
                className="font-semibold text-primary underline underline-offset-4"
              >
                {ui.home.allConcerts}
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((concert) => (
                <li key={concert.slug} className="flex">
                  <ConcertCard concert={concert} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {home?.body && (
        <section className="container-prose pb-8">
          <MarkdocContent node={home.body.node} />
        </section>
      )}

      <section aria-labelledby="explore" className="border-t border-line bg-surface py-16">
        <div className="container-site">
          <h2 id="explore" className="mb-8 text-3xl font-bold text-ink">
            {ui.home.explore}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {ui.home.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group block h-full rounded-xl bg-white p-6 shadow-sm ring-1 ring-line transition hover:shadow-md hover:ring-primary"
                >
                  <span className="block font-display text-xl font-semibold text-ink group-hover:text-primary">
                    {link.label}
                  </span>
                  <span className="mt-2 block text-fg-muted">{link.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
