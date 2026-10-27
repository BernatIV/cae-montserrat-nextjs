import { ConcertCard } from "@/components/concert-card";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { getAnniversaryPage } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export async function generateMetadata() {
  const page = await getAnniversaryPage();
  return pageMetadata({
    title: page?.title ?? "75è Aniversari",
    description: page?.description,
    path: "/75e-aniversari",
    image: page?.image,
    imageAlt: page?.imageAlt,
  });
}

export default async function AnniversaryPage() {
  const page = await getAnniversaryPage();
  if (!page) return null;

  return (
    <>
      <PageHeader title={page.title} image={page.image} imageAlt={page.imageAlt} />
      <div className="container-prose py-12 sm:py-16">
        <MarkdocContent node={page.body.node} />
      </div>
      {page.concerts.length > 0 && (
        <section aria-labelledby="concerts-75" className="bg-surface py-12 sm:py-16">
          <div className="container-site">
            <h2 id="concerts-75" className="mb-8 text-2xl font-bold text-ink">
              {ui.anniversary.concerts}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {page.concerts.map((concert) => (
                <li key={concert.slug} className="flex">
                  <ConcertCard concert={concert} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
