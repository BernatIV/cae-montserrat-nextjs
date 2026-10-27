import Link from "next/link";
import { getSettings } from "@/lib/content";
import { t } from "@/lib/i18n";

const ui = t();

export async function SiteFooter() {
  const { contact, social } = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-chrome-deep text-on-chrome-muted theme-dark">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="mb-3 text-lg font-semibold text-on-chrome">
            {ui.footer.contact}
          </h2>
          <address className="space-y-2 not-italic">
            {contact.address && <p className="whitespace-pre-line">{contact.address}</p>}
            {contact.email && (
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="underline underline-offset-2 hover:text-on-chrome"
                >
                  {contact.email}
                </a>
              </p>
            )}
            {contact.phone && (
              <p>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                  className="hover:text-on-chrome"
                >
                  {contact.phone}
                </a>
              </p>
            )}
          </address>
        </section>

        {social.length > 0 && (
          <section aria-labelledby="footer-social">
            <h2 id="footer-social" className="mb-3 text-lg font-semibold text-on-chrome">
              {ui.footer.follow}
            </h2>
            <ul className="space-y-2">
              {social.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    rel="me noopener"
                    className="underline underline-offset-2 hover:text-on-chrome"
                  >
                    {ui.social[item.network]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="footer-legal">
          <h2 id="footer-legal" className="mb-3 text-lg font-semibold text-on-chrome">
            {ui.footer.legal}
          </h2>
          <ul className="space-y-2">
            {ui.footer.legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline underline-offset-2 hover:text-on-chrome"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-on-chrome-muted">
          <p>{ui.footer.copyright(year)}</p>
          <Link href="/keystatic" prefetch={false} rel="nofollow" className="hover:text-on-chrome">
            {ui.footer.keystatic}
          </Link>
        </div>
      </div>
    </footer>
  );
}
