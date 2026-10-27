import Image from "next/image";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  lead?: ReactNode;
  eyebrow?: ReactNode;
  image?: string | null;
  imageAlt?: string | null;
};

/** Title band shown at the top of every page. */
export function PageHeader({ title, lead, eyebrow, image, imageAlt }: PageHeaderProps) {
  return (
    <div className="relative isolate overflow-hidden bg-chrome text-on-chrome theme-dark">
      {image && (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-chrome-deep/90 via-chrome/75 to-chrome/40" />
        </>
      )}
      <div className={`container-site ${image ? "py-20 sm:py-28" : "py-12 sm:py-16"}`}>
        {eyebrow && (
          <div className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {lead && <div className="mt-4 max-w-2xl text-lg text-on-chrome-muted">{lead}</div>}
      </div>
    </div>
  );
}
