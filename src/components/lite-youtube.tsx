"use client";

import Image from "next/image";
import { useState } from "react";
import { t } from "@/lib/i18n";

const ui = t();

/**
 * Lightweight YouTube embed: shows the thumbnail and only loads the
 * (privacy-enhanced, cookie-free) player when the visitor clicks play.
 */
export function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-md">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={ui.youtube.iframeTitle(title)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 size-full"
          aria-label={ui.youtube.play(title)}
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            unoptimized
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute top-1/2 left-1/2 flex h-12 w-17 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-red-600 shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="white" aria-hidden="true" className="size-7">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
