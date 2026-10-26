import Image from "next/image";
import Link from "next/link";
import { dateParts, formatDate, joinParts } from "@/lib/format";
import { t } from "@/lib/i18n";

const ui = t();

export type ConcertSummary = {
  slug: string;
  title: string;
  date: string | null;
  time?: string | null;
  location?: string | null;
  city?: string | null;
  description?: string | null;
  poster?: string | null;
  posterAlt?: string | null;
};

function DateBadge({ date }: { date: string | null }) {
  const parts = dateParts(date);
  if (!parts) return null;
  return (
    <span className="flex w-16 shrink-0 flex-col items-center rounded-md bg-brand-700 px-2 py-1.5 text-center leading-none text-white">
      <span className="text-2xl font-bold">{parts.day}</span>
      <span className="mt-1 text-xs uppercase">{parts.month}</span>
      <span className="mt-1 text-xs text-brand-200">{parts.year}</span>
    </span>
  );
}

/** Card with poster, used for upcoming and featured concerts. */
export function ConcertCard({
  concert,
  headingLevel = 3,
}: {
  concert: ConcertSummary;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  const place = joinParts([concert.location, concert.city]);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-brand-100">
        {concert.poster ? (
          <Image
            src={concert.poster}
            alt={concert.posterAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900">
            <Image
              src="/images/logo-caem.webp"
              alt=""
              width={120}
              height={79}
              className="opacity-60"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 gap-4 p-5">
        <DateBadge date={concert.date} />
        <div className="min-w-0">
          <Heading className="text-lg font-semibold text-brand-900">
            <Link
              href={`/concerts/${concert.slug}`}
              className="after:absolute after:inset-0 hover:underline"
            >
              {concert.title}
            </Link>
          </Heading>
          {place && <p className="mt-1 text-sm text-slate-600">{place}</p>}
          {concert.time && <p className="text-sm text-slate-600">{concert.time} h</p>}
        </div>
      </div>
    </article>
  );
}

/** Compact row for the concert history. */
export function ConcertRow({ concert }: { concert: ConcertSummary }) {
  const place = joinParts([concert.location, concert.city]);
  return (
    <li className="relative flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
      <span className="w-44 shrink-0 text-sm font-medium text-brand-700 tabular-nums">
        {concert.date ? (
          <time dateTime={concert.date}>{formatDate(concert.date)}</time>
        ) : (
          ui.concerts.noDate
        )}
      </span>
      <span className="min-w-0">
        <Link
          href={`/concerts/${concert.slug}`}
          className="font-semibold text-slate-900 after:absolute after:inset-0 hover:text-brand-700 hover:underline"
        >
          {concert.title}
        </Link>
        {place && <span className="block text-sm text-slate-600">{place}</span>}
      </span>
    </li>
  );
}
