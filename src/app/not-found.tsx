import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/lib/i18n";

const ui = t();

export const metadata: Metadata = {
  title: ui.notFound.title,
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contingut" tabIndex={-1} className="flex flex-1 items-center focus:outline-none">
        <div className="container-prose py-20 text-center">
          <p className="font-display text-7xl font-bold text-primary-line" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">{ui.notFound.title}</h1>
          <p className="mt-4 text-lg text-fg">{ui.notFound.text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-md bg-primary px-5 py-3 font-semibold text-on-primary hover:bg-primary-hover"
            >
              {ui.notFound.home}
            </Link>
            <Link
              href="/concerts"
              className="rounded-md px-5 py-3 font-semibold text-primary ring-1 ring-primary-line hover:bg-primary-soft"
            >
              {ui.notFound.concerts}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
