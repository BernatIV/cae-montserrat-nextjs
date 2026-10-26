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
          <p className="font-display text-7xl font-bold text-brand-200" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold text-brand-900 sm:text-4xl">
            {ui.notFound.title}
          </h1>
          <p className="mt-4 text-lg text-slate-700">{ui.notFound.text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-md bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
            >
              {ui.notFound.home}
            </Link>
            <Link
              href="/concerts"
              className="rounded-md px-5 py-3 font-semibold text-brand-700 ring-1 ring-brand-300 hover:bg-brand-50"
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
