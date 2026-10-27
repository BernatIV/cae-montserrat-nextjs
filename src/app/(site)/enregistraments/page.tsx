import Link from "next/link";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { getPage } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export async function generateMetadata() {
  const page = await getPage("enregistraments");
  return pageMetadata({
    title: page?.title ?? "Enregistraments",
    description:
      page?.description || `${ui.recordings.discographyText} ${ui.recordings.audiosText}`,
    path: "/enregistraments",
    image: page?.image,
    imageAlt: page?.imageAlt,
  });
}

const sections = [
  { href: "/discografia", title: ui.recordings.discography, text: ui.recordings.discographyText },
  { href: "/audios", title: ui.recordings.audios, text: ui.recordings.audiosText },
];

export default async function RecordingsPage() {
  const page = await getPage("enregistraments");

  return (
    <>
      <PageHeader
        title={page?.title ?? "Enregistraments"}
        image={page?.image}
        imageAlt={page?.imageAlt}
      />
      <div className="container-site py-12 sm:py-16">
        {page && <MarkdocContent node={page.body.node} className="mb-10" />}
        <ul className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="group block h-full rounded-xl bg-white p-8 shadow-sm ring-1 ring-line transition hover:shadow-md hover:ring-primary"
              >
                <span className="block font-display text-2xl font-bold text-ink group-hover:text-primary">
                  {section.title}
                </span>
                <span className="mt-2 block text-fg-muted">{section.text}</span>
                <span
                  className="mt-6 inline-block font-semibold text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
