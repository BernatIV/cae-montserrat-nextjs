import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/content";
import { t } from "@/lib/i18n";
import { normalizeHref } from "@/lib/routes";
import { MainNav, type NavItem } from "./main-nav";

const ui = t();

export async function SiteHeader() {
  const { menu } = await getSettings();
  const items: NavItem[] = menu.map((item) => ({
    label: item.label,
    href: normalizeHref(item.href),
    children: item.children.map((child) => ({
      label: child.label,
      href: normalizeHref(child.href),
    })),
  }));

  return (
    <header className="sticky top-0 z-40 bg-brand-700 text-white shadow-md">
      <a
        href="#contingut"
        className="sr-only rounded-md bg-white px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        {ui.skipToContent}
      </a>
      <div className="relative container-site flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-md">
          <Image
            src="/images/logo-caem.webp"
            alt={ui.logoAlt}
            width={480}
            height={315}
            loading="eager"
            sizes="96px"
            className="h-14 w-auto"
          />
          <span className="hidden font-display text-base leading-tight font-semibold sm:block xl:hidden 2xl:block">
            Coral d&apos;Antics Escolans
            <br />
            de Montserrat
          </span>
        </Link>
        <MainNav items={items} />
      </div>
    </header>
  );
}
