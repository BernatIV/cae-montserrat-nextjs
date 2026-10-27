import { ContactForm } from "@/components/contact-form";
import { MarkdocContent } from "@/components/markdoc";
import { PageHeader } from "@/components/page-header";
import { getPage, getSettings } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const ui = t();

export async function generateMetadata() {
  const page = await getPage("contacte");
  return pageMetadata({
    title: page?.title ?? ui.footer.contact,
    description: page?.description,
    path: "/contacte",
    image: page?.image,
    imageAlt: page?.imageAlt,
  });
}

export default async function ContactPage() {
  const [page, { contact }] = await Promise.all([getPage("contacte"), getSettings()]);

  return (
    <>
      <PageHeader
        title={page?.title ?? ui.footer.contact}
        image={page?.image}
        imageAlt={page?.imageAlt}
      />
      <div className="container-site grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {page && <MarkdocContent node={page.body.node} className="mb-8" />}
          <h2 className="mb-6 text-2xl font-bold text-ink">{ui.contact.formTitle}</h2>
          <ContactForm email={contact.email} accessKey={process.env.NEXT_PUBLIC_FORM_ACCESS_KEY} />
        </div>
        <aside aria-labelledby="contact-details" className="h-fit rounded-xl bg-surface p-6">
          <h2 id="contact-details" className="mb-4 text-xl font-bold text-ink">
            {ui.contact.details}
          </h2>
          <dl className="space-y-4">
            {contact.email && (
              <div>
                <dt className="text-sm font-semibold text-primary">{ui.contact.email}</dt>
                <dd>
                  <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
                    {contact.email}
                  </a>
                </dd>
              </div>
            )}
            {contact.phone && (
              <div>
                <dt className="text-sm font-semibold text-primary">{ui.contact.phone}</dt>
                <dd>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                </dd>
              </div>
            )}
            {contact.address && (
              <div>
                <dt className="text-sm font-semibold text-primary">{ui.contact.address}</dt>
                <dd className="whitespace-pre-line">{contact.address}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </>
  );
}
