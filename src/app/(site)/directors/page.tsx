import Image from "next/image";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";

import { getDirectors } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export const metadata = pageMetadata({
  title: ui.directors.title,
  description: ui.directors.description,
  path: "/directors",
});

export default async function DirectorsPage() {
  const directors = await getDirectors();

  return (
    <>
      <PageHeader title={ui.directors.title} lead={ui.directors.description} />
      <div className="container-site py-12 sm:py-16">
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {directors.map((director) => (
            <li key={director.slug} className="flex">
              <article
                aria-labelledby={`director-${director.slug}`}
                className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
              >
                <div className="relative aspect-[4/3] bg-brand-100">
                  {director.photo && (
                    <Image
                      src={director.photo}
                      alt={director.photoAlt || director.name}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 id={`director-${director.slug}`} className="text-xl font-bold text-brand-900">
                    {director.name}
                  </h2>
                  {director.period && (
                    <p className="mt-1 font-semibold text-brand-700">{director.period}</p>
                  )}
                  <MarkdocContent node={director.body.node} className="prose-sm mt-4" />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
