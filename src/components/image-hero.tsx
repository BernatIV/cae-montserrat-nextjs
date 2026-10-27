import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { getLocalImageSize } from "@/lib/images";
import { HERO_QUALITY } from "@/lib/image-quality";

type ImageHeroProps = {
  image: string;
  imageAlt?: string | null;
  /**
   * `screen`: on large screens the image and the text fill exactly the viewport below the
   * header. `large`: the image grows up to 70 % of the viewport.
   */
  fit: "screen" | "large";
  /** Optional "scroll down" link shown next to the text when the hero fills the screen. */
  next?: { href: string; label: string };
  children: ReactNode;
};

/** How much a `screen` hero may enlarge its image to fill the viewport (more looks blurry). */
const MAX_UPSCALE = 1.25;

const styles = {
  screen: {
    root: "lg:flex lg:h-[calc(100svh-5rem-1px)] lg:min-h-[32rem] lg:flex-col",
    band: "lg:min-h-0 lg:flex-1",
    box: "max-h-[calc(100svh-11rem)] lg:absolute lg:inset-0 lg:m-auto lg:aspect-auto lg:max-h-(--hero-max-h-lg) lg:max-w-(--hero-max-w-lg)",
  },
  large: { root: "", band: "", box: "max-h-[70svh]" },
} as const;

/**
 * Full-width image band that is never cropped: the image keeps its aspect ratio, is not
 * enlarged beyond its real width (or slightly, to fill the screen), and a blurred copy
 * fills the sides. The text always sits below the image.
 */
export function ImageHero({ image, imageAlt, fit, next, children }: ImageHeroProps) {
  const realSize = getLocalImageSize(image);
  const size = realSize ?? { width: 16, height: 9 };
  const style = styles[fit];
  const vars = {
    "--hero-ratio": `${size.width} / ${size.height}`,
    "--hero-max-w": realSize ? `${realSize.width}px` : "100%",
    "--hero-max-w-lg": realSize ? `${Math.round(realSize.width * MAX_UPSCALE)}px` : "100%",
    "--hero-max-h-lg": realSize ? `${Math.round(realSize.height * MAX_UPSCALE)}px` : "100%",
  } as CSSProperties;
  const maxRenderWidth = realSize
    ? Math.round(realSize.width * (fit === "screen" ? MAX_UPSCALE : 1))
    : null;
  return (
    <div className={`bg-chrome-deep text-on-chrome theme-dark ${style.root}`} style={vars}>
      <div className={`relative isolate overflow-hidden ${style.band}`}>
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes="64px"
          className="-z-10 scale-110 object-cover opacity-60 blur-2xl"
        />
        <div
          className={`relative mx-auto aspect-(--hero-ratio) w-full max-w-(--hero-max-w) ${style.box}`}
        >
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            preload
            fetchPriority="high"
            sizes={
              maxRenderWidth
                ? `(min-width: ${maxRenderWidth}px) ${maxRenderWidth}px, 100vw`
                : "100vw"
            }
            quality={HERO_QUALITY}
            className="object-contain"
          />
        </div>
      </div>
      <div className="container-site flex items-end justify-between gap-6 py-8 sm:py-10">
        <div>{children}</div>
        {next && fit === "screen" && (
          <a
            href={next.href}
            aria-label={next.label}
            title={next.label}
            className="hidden shrink-0 rounded-full p-2 text-accent transition hover:text-on-chrome motion-safe:animate-bounce lg:block"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
