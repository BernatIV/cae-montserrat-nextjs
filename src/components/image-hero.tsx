import Image from "next/image";
import type { ReactNode } from "react";
import { getLocalImageSize } from "@/lib/images";

type ImageHeroProps = {
  image: string;
  imageAlt?: string | null;
  /** Tallest the image may grow: the whole viewport below the header, or most of it. */
  fit: "screen" | "large";
  children: ReactNode;
};

const maxHeight = {
  screen: "max-h-[calc(100svh-5rem)]",
  large: "max-h-[70svh]",
} as const;

/**
 * Full-width image that is never cropped: it keeps its aspect ratio up to a maximum
 * height, and on wider screens a blurred copy fills the sides. The text sits below the
 * image on mobile and over its bottom edge from `sm` up.
 */
export function ImageHero({ image, imageAlt, fit, children }: ImageHeroProps) {
  const size = getLocalImageSize(image) ?? { width: 16, height: 9 };
  return (
    <div className="relative bg-chrome-deep text-on-chrome theme-dark">
      <div
        className={`relative isolate w-full overflow-hidden ${maxHeight[fit]}`}
        style={{ aspectRatio: `${size.width} / ${size.height}` }}
      >
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes="64px"
          className="-z-10 scale-110 object-cover opacity-60 blur-2xl"
        />
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="object-contain"
        />
        <div className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-chrome-deep/85 via-chrome-deep/40 to-transparent sm:block" />
      </div>
      <div className="container-site py-8 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pb-10 sm:[text-shadow:0_1px_12px_rgb(0_0_0/0.5)]">
        {children}
      </div>
    </div>
  );
}
