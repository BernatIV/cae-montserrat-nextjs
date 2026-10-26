import { notFound } from "next/navigation";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { getPage, type PageKey } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** Simple pages served by this route: URL slug → Keystatic singleton. */
const pages = {
  "qui-som": "quiSom",
  historia: "historia",
  projectes: "projectes",
  "avis-legal": "avisLegal",
  "politica-de-cookies": "politicaCookies",
  "politica-de-privacitat": "politicaPrivacitat",
} as const satisfies Record<string, PageKey>;

type Slug = keyof typeof pages;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

async function load(slug: string) {
  if (!Object.hasOwn(pages, slug)) return null;
  return getPage(pages[slug as Slug]);
}

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await load(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/${slug}`,
    image: page.image,
    imageAlt: page.imageAlt,
  });
}

export default async function SimplePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await load(slug);
  if (!page) notFound();

  return (
    <>
      <PageHeader title={page.title} image={page.image} imageAlt={page.imageAlt} />
      <div className="container-prose py-12 sm:py-16">
        <MarkdocContent node={page.body.node} />
      </div>
    </>
  );
}
