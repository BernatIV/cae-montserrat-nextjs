"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";

const ui = t();

export type GalleryImage = { image: string; alt: string; caption?: string | null };

/** Thumbnail grid with an accessible lightbox built on the native <dialog>. */
export function Gallery({ images }: { images: readonly GalleryImage[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const total = images.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  if (total === 0) return null;
  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((item, i) => (
          <li key={`${item.image}-${i}`}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-md bg-slate-100"
              aria-label={ui.gallery.open(item.alt)}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current?.alt}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-white">
            <div className="flex w-full items-center justify-between gap-4">
              <p className="text-sm" aria-live="polite">
                {ui.gallery.position((index ?? 0) + 1, total)}
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-white/15"
                autoFocus
              >
                {ui.gallery.close} ✕
              </button>
            </div>
            <figure className="relative flex min-h-0 w-full flex-1 flex-col">
              <div className="relative min-h-0 flex-1">
                <Image
                  key={current.image}
                  src={current.image}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              {current.caption && (
                <figcaption className="mt-2 text-center text-sm text-slate-200">
                  {current.caption}
                </figcaption>
              )}
            </figure>
            {total > 1 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/20"
                >
                  <span aria-hidden="true">← </span>
                  {ui.gallery.previous}
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/20"
                >
                  {ui.gallery.next}
                  <span aria-hidden="true"> →</span>
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
