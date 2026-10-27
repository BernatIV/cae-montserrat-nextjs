import Image from "next/image";
import type { ReactNode } from "react";
import { getLocalImageSize } from "@/lib/images";
import { HERO_QUALITY } from "@/lib/image-quality";

type ImageHeroProps = {
  image: string;
  imageAlt?: string | null;
  /** Tallest the image may grow: most of the viewport (leaving a peek of the next section), or 70 %. */
  fit: "screen" | "large";
  children: ReactNode;
};

const maxHeight = {
  screen: "max-h-[calc(100svh-11rem)]",
  large: "max-h-[70svh]",
} as const;

/**
 * Full-width image band that is never cropped: the image keeps its aspect ratio up to a
 * maximum height, is never enlarged beyond its real width (so it stays sharp), and a
 * blurred copy fills the sides. The text always sits below the image.
 */
export function ImageHero({ image, imageAlt, fit, children }: ImageHeroProps) {
  const realSize = getLocalImageSize(image);
  const size = realSize ?? { width: 16, height: 9 };
  return (
    <div className="bg-chrome-deep text-on-chrome theme-dark">
      <div className="relative isolate overflow-hidden">
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes="64px"
          className="-z-10 scale-110 object-cover opacity-60 blur-2xl"
        />
        <div
          className={`relative mx-auto w-full ${maxHeight[fit]}`}
          style={{
            aspectRatio: `${size.width} / ${size.height}`,
            maxWidth: realSize ? `${realSize.width}px` : undefined,
          }}
        >
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            preload
            fetchPriority="high"
            sizes={
              realSize ? `(min-width: ${realSize.width}px) ${realSize.width}px, 100vw` : "100vw"
            }
            quality={HERO_QUALITY}
            className="object-contain"
          />
        </div>
      </div>
      <div className="container-site py-8 sm:py-10">{children}</div>
    </div>
  );
}
