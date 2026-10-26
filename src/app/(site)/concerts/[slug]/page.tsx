import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/audio-player";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { LiteYouTube } from "@/components/lite-youtube";
import { MarkdocContent, hasContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { SizedImage } from "@/components/sized-image";
import { getConcert, getConcertSlugs } from "@/lib/content";
import { formatDate, joinParts } from "@/lib/format";
import { t } from "@/lib/i18n";
import { excerpt, musicEventJsonLd, pageMetadata } from "@/lib/seo";

const ui = t();

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getConcertSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/concerts/[slug]">) {
  const { slug } = await params;
  const concert = await getConcert(slug);
  if (!concert) return {};
  const place = joinParts([concert.location, concert.city]);
  return pageMetadata({
    title: concert.title,
    description:
      excerpt(concert.description) ||
      joinParts([formatDate(concert.date), place], " · ") ||
      undefined,
    path: `/concerts/${slug}`,
    image: concert.poster,
    imageAlt: concert.posterAlt,
    type: "article",
  });
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 first:mt-0">
      <h2 id={id} className="mb-4 text-2xl font-bold text-brand-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ConcertPage({ params }: PageProps<"/concerts/[slug]">) {
  const { slug } = await params;
  const concert = await getConcert(slug);
  if (!concert) notFound();

  const place = joinParts([concert.location, concert.city]);
  const gallery = concert.gallery.flatMap((item) =>
    item.image ? [{ image: item.image, alt: item.alt, caption: item.caption }] : [],
  );
  const program = concert.program.filter((item) => item.work);

  return (
    <>
      <JsonLd data={musicEventJsonLd(concert)} />
      <PageHeader
        title={concert.title}
        eyebrow={
          concert.date ? <time dateTime={concert.date}>{formatDate(concert.date)}</time> : null
        }
        lead={joinParts([place, concert.time ? `${concert.time} h` : null], " · ") || null}
      />

      <div className="container-site py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            {concert.description && !hasContent(concert.body.node) && (
              <p className="mb-8 text-xl text-slate-700">{concert.description}</p>
            )}

            <dl className="mb-10 grid gap-4 rounded-xl bg-surface p-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-brand-700">{ui.concerts.date}</dt>
                <dd>{concert.date ? formatDate(concert.date) : ui.concerts.noDate}</dd>
              </div>
              {concert.time && (
                <div>
                  <dt className="text-sm font-semibold text-brand-700">{ui.concerts.time}</dt>
                  <dd>{concert.time} h</dd>
                </div>
              )}
              {place && (
                <div>
                  <dt className="text-sm font-semibold text-brand-700">{ui.concerts.place}</dt>
                  <dd>{place}</dd>
                </div>
              )}
            </dl>

            {program.length > 0 && (
              <Section id="programa" title={ui.concerts.program}>
                <ol className="divide-y divide-slate-200 rounded-xl ring-1 ring-slate-200">
                  {program.map((item, i) => (
                    <li key={i} className="px-5 py-3">
                      <span className="font-semibold text-slate-900">{item.work}</span>
                      {item.composer && <span className="text-slate-600"> — {item.composer}</span>}
                      {item.notes && (
                        <span className="block text-sm text-slate-600">{item.notes}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {hasContent(concert.body.node) && (
              <div className="mt-12 first:mt-0">
                <MarkdocContent node={concert.body.node} />
              </div>
            )}

            {(concert.audios.length > 0 || concert.youtubeId) && (
              <Section id="enregistraments" title={ui.concerts.recordings}>
                <div className="space-y-4">
                  {concert.youtubeId && (
                    <LiteYouTube id={concert.youtubeId} title={concert.title} />
                  )}
                  {concert.audios.map((audio) => (
                    <AudioPlayer
                      key={audio.slug}
                      title={audio.title}
                      url={audio.url}
                      composer={audio.composer}
                      performers={audio.performers}
                    />
                  ))}
                </div>
              </Section>
            )}

            {gallery.length > 0 && (
              <Section id="fotografies" title={ui.concerts.gallery}>
                <Gallery images={gallery} />
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            {concert.poster && (
              <SizedImage
                src={concert.poster}
                alt={concert.posterAlt ?? ""}
                sizes="(min-width: 1024px) 320px, 100vw"
                className="h-auto w-full rounded-xl shadow-md"
              />
            )}
            <Link
              href="/concerts"
              className="inline-block font-semibold text-brand-700 underline underline-offset-4"
            >
              ← {ui.concerts.backToList}
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
