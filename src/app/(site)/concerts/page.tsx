import { ConcertCard, ConcertRow } from "@/components/concert-card";
import { PageHeader } from "@/components/page-header";
import { UpcomingFilter } from "@/components/upcoming-filter";
import { getConcerts, splitByDate } from "@/lib/content";
import { groupByDecade } from "@/lib/format";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export const metadata = pageMetadata({
  title: ui.concerts.title,
  description: ui.concerts.description,
  path: "/concerts",
});

const decadeId = (decade: number | null) => (decade === null ? "sense-data" : `decada-${decade}`);

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const { upcoming, past } = splitByDate(concerts);
  const decades = groupByDecade(past);

  return (
    <>
      <PageHeader title={ui.concerts.title} lead={ui.concerts.description} />

      <section aria-labelledby="proxims" className="bg-surface py-12">
        <div className="container-site">
          <h2 id="proxims" className="mb-6 text-2xl font-bold text-brand-900">
            {ui.concerts.upcoming}
          </h2>
          <UpcomingFilter
            items={upcoming.map((concert) => ({
              key: concert.slug,
              date: concert.date,
              node: <ConcertCard concert={concert} />,
            }))}
            empty={<p className="text-slate-700">{ui.home.noUpcoming}</p>}
          />
        </div>
      </section>

      <section aria-labelledby="historial" className="py-12">
        <div className="container-site">
          <h2 id="historial" className="mb-2 text-2xl font-bold text-brand-900">
            {ui.concerts.past}
          </h2>
          <p className="mb-6 text-slate-600">{ui.concerts.count(past.length)}</p>

          <nav aria-label={ui.concerts.decadeNav} className="mb-10">
            <ul className="flex flex-wrap gap-2">
              {decades.map(({ decade }) => (
                <li key={decadeId(decade)}>
                  <a
                    href={`#${decadeId(decade)}`}
                    className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
                  >
                    {decade === null ? ui.concerts.noDate : decade}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            {decades.map(({ decade, items }) => (
              <section key={decadeId(decade)} aria-labelledby={decadeId(decade)}>
                <h3
                  id={decadeId(decade)}
                  className="mb-2 border-b-2 border-brand-700 pb-2 text-xl font-bold text-brand-900"
                >
                  {decade === null ? ui.concerts.noDate : ui.concerts.decade(decade)}{" "}
                  <span className="text-base font-normal text-slate-600">
                    ({ui.concerts.count(items.length)})
                  </span>
                </h3>
                <ul className="divide-y divide-slate-200">
                  {items.map((concert) => (
                    <ConcertRow key={concert.slug} concert={concert} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
