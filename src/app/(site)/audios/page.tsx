import Link from "next/link";
import { AudioPlayer } from "@/components/audio-player";
import { PageHeader } from "@/components/page-header";
import { getAudios, getConcerts, getDiscography } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export const metadata = pageMetadata({
  title: ui.recordings.audios,
  description: ui.recordings.audiosText,
  path: "/audios",
});

export default async function AudiosPage() {
  const [audios, albums, concerts] = await Promise.all([
    getAudios(),
    getDiscography(),
    getConcerts(),
  ]);
  const albumTitle = new Map(albums.map((album) => [album.slug, `${album.title} (${album.year})`]));
  const concertTitle = new Map(concerts.map((concert) => [concert.slug, concert.title]));

  const groups = new Map<string, { title: string; href: string | null; items: typeof audios }>();
  for (const audio of audios) {
    const key = audio.album
      ? `album:${audio.album}`
      : audio.concert
        ? `concert:${audio.concert}`
        : "other";
    if (!groups.has(key)) {
      const title = audio.album
        ? (albumTitle.get(audio.album) ?? audio.album)
        : audio.concert
          ? (concertTitle.get(audio.concert) ?? audio.concert)
          : ui.recordings.audios;
      const href = audio.album
        ? `/discografia#${audio.album}`
        : audio.concert
          ? `/concerts/${audio.concert}`
          : null;
      groups.set(key, { title, href, items: [] });
    }
    groups.get(key)!.items.push(audio);
  }

  return (
    <>
      <PageHeader title={ui.recordings.audios} lead={ui.recordings.audiosText} />
      <div className="container-site space-y-14 py-12 sm:py-16">
        {[...groups.entries()].map(([key, group]) => (
          <section key={key} aria-labelledby={key}>
            <h2 id={key} className="mb-5 text-2xl font-bold text-ink">
              {group.href ? (
                <Link href={group.href} className="hover:underline">
                  {group.title}
                </Link>
              ) : (
                group.title
              )}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {group.items.map((audio) => (
                <li key={audio.slug}>
                  <AudioPlayer
                    title={audio.title}
                    url={audio.url}
                    composer={audio.composer}
                    performers={audio.album ? null : audio.performers}
                    meta={
                      audio.track
                        ? ui.recordings.track(audio.track)
                        : audio.date
                          ? formatDate(audio.date)
                          : null
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
