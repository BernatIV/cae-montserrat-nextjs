import Image from "next/image";
import Link from "next/link";
import { ConcertCard } from "@/components/concert-card";
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

  return (
    <>
      <JsonLd data={musicGroupJsonLd(settings)} />

      <section className="relative isolate overflow-hidden bg-brand-900 text-white">
        {home?.heroImage && (
          <>
            <Image
              src={home.heroImage}
              alt={home.heroImageAlt ?? ""}
              fill
              preload
              fetchPriority="high"
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/90 via-brand-950/50 to-brand-950/10" />
          </>
        )}
        <div className="container-site flex min-h-[28rem] flex-col justify-end py-16 sm:min-h-[36rem]">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            {home?.heroTitle || ui.siteName}
          </h1>
          {home?.heroText && (
            <p className="mt-4 max-w-2xl text-lg text-brand-100 sm:text-xl">{home.heroText}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/concerts"
              className="rounded-md bg-accent-400 px-5 py-3 font-semibold text-brand-950 shadow hover:bg-accent-300"
            >
              {ui.home.allConcerts}
            </Link>
            <Link
              href="/qui-som"
              className="rounded-md bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/20"
            >
              {ui.home.explore}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="upcoming" className="bg-surface py-16">
        <div className="container-site">
          <h2 id="upcoming" className="mb-8 text-3xl font-bold text-brand-900">
            {ui.home.upcoming}
          </h2>
          <UpcomingFilter
            items={upcoming.map((concert) => ({
              key: concert.slug,
              date: concert.date,
              node: <ConcertCard concert={concert} />,
            }))}
            empty={<p className="text-lg text-slate-700">{ui.home.noUpcoming}</p>}
          />
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent" className="py-16">
          <div className="container-site">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="recent" className="text-3xl font-bold text-brand-900">
                {ui.home.recent}
              </h2>
              <Link
                href="/concerts"
                className="font-semibold text-brand-700 underline underline-offset-4"
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

      <section aria-labelledby="explore" className="bg-brand-700 py-16 text-white">
        <div className="container-site">
          <h2 id="explore" className="mb-8 text-3xl font-bold">
            {ui.home.explore}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {ui.home.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block h-full rounded-xl bg-white/10 p-6 ring-1 ring-white/20 transition-colors hover:bg-white/20"
                >
                  <span className="block font-display text-xl font-semibold">{link.label}</span>
                  <span className="mt-2 block text-brand-100">{link.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
