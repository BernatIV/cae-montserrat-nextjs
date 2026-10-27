import type { ReactNode } from "react";
import { ImageHero } from "./image-hero";

type PageHeaderProps = {
  title: string;
  lead?: ReactNode;
  eyebrow?: ReactNode;
  image?: string | null;
  imageAlt?: string | null;
};

/** Title band shown at the top of every page; with an image, the whole image is shown. */
export function PageHeader({ title, lead, eyebrow, image, imageAlt }: PageHeaderProps) {
  const text = (
    <>
      {eyebrow && (
        <div className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase">
          {eyebrow}
        </div>
      )}
      <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {lead && <div className="mt-4 max-w-2xl text-lg text-on-chrome-muted">{lead}</div>}
    </>
  );

  if (image) {
    return (
      <ImageHero image={image} imageAlt={imageAlt} fit="large">
        {text}
      </ImageHero>
    );
  }

  return (
    <div className="bg-chrome text-on-chrome theme-dark">
      <div className="container-site py-12 sm:py-16">{text}</div>
    </div>
  );
}
