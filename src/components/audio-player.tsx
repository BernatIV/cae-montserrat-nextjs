import { t } from "@/lib/i18n";

const ui = t();

type AudioPlayerProps = {
  title: string;
  url: string;
  composer?: string | null;
  performers?: string | null;
  meta?: string | null;
};

/** Native audio player. `preload="none"` avoids downloading files until played. */
export function AudioPlayer({ title, url, composer, performers, meta }: AudioPlayerProps) {
  const details = [composer, performers].filter(Boolean).join(" · ");
  return (
    <figure className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <figcaption className="mb-3">
        <span className="block font-semibold text-ink">{title}</span>
        {details && <span className="block text-sm text-fg-muted">{details}</span>}
        {meta && <span className="block text-sm text-fg-muted">{meta}</span>}
      </figcaption>
      <audio controls preload="none" src={url} className="w-full">
        {ui.recordings.noAudioSupport} <a href={url}>{ui.recordings.download}</a>
      </audio>
    </figure>
  );
}
