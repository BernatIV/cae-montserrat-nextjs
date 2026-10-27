import { AudioPlayer } from "@/components/audio-player";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { SizedImage } from "@/components/sized-image";
import { getAudios, getDiscography } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export const metadata = pageMetadata({
  title: ui.recordings.discography,
  description: ui.recordings.discographyText,
  path: "/discografia",
});

export default async function DiscographyPage() {
  const [albums, audios] = await Promise.all([getDiscography(), getAudios()]);

  return (
    <>
      <PageHeader title={ui.recordings.discography} lead={ui.recordings.discographyText} />
      <div className="container-site py-12 sm:py-16">
        <ol className="space-y-16">
          {albums.map((album) => {
            const albumAudios = audios
              .filter((audio) => audio.album === album.slug)
              .sort((a, b) => (a.track ?? Infinity) - (b.track ?? Infinity));
            return (
              <li key={album.slug} id={album.slug} className="scroll-mt-28">
                <article
                  aria-labelledby={`album-${album.slug}`}
                  className="grid gap-8 border-b border-line pb-16 md:grid-cols-[18rem_minmax(0,1fr)]"
                >
                  <div>
                    {album.cover && (
                      <SizedImage
                        src={album.cover}
                        alt={album.coverAlt || album.title}
                        sizes="(min-width: 768px) 288px, 100vw"
                        className="h-auto w-full rounded-xl shadow-md"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 id={`album-${album.slug}`} className="text-2xl font-bold text-ink">
                      {album.title}
                    </h2>
                    {album.year && (
                      <p className="mt-1 font-semibold text-primary">
                        <span className="sr-only">{ui.recordings.year}: </span>
                        {album.year}
                      </p>
                    )}
                    <MarkdocContent node={album.body.node} className="mt-4" />
                    {album.tracks.length > 0 && (
                      <section aria-labelledby={`tracks-${album.slug}`} className="mt-8">
                        <h3
                          id={`tracks-${album.slug}`}
                          className="mb-3 text-lg font-semibold text-ink"
                        >
                          {ui.recordings.tracks}
                        </h3>
                        <ol className="list-decimal space-y-1 pl-6 text-fg">
                          {album.tracks.map((track, i) => (
                            <li key={i}>
                              {track.title}
                              {track.composer && (
                                <span className="text-fg-muted"> — {track.composer}</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </section>
                    )}
                    {albumAudios.length > 0 && (
                      <section aria-label={ui.recordings.audios} className="mt-8 grid gap-4">
                        {albumAudios.map((audio) => (
                          <AudioPlayer
                            key={audio.slug}
                            title={audio.title}
                            url={audio.url}
                            composer={audio.composer}
                            meta={audio.track ? ui.recordings.track(audio.track) : null}
                          />
                        ))}
                      </section>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
