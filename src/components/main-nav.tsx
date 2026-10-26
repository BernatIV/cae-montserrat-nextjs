"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { isActivePath } from "@/lib/routes";

export type NavItem = {
  label: string;
  href: string;
  children: readonly { label: string; href: string }[];
};

const ui = t();

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`size-4 ${className}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DesktopItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const submenuId = useId();
  const ref = useRef<HTMLLIElement>(null);
  const active =
    isActivePath(item.href, pathname) || item.children.some((c) => isActivePath(c.href, pathname));

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const linkClass = `block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/10 hover:text-white ${
    active
      ? "text-white underline decoration-accent-400 decoration-2 underline-offset-8"
      : "text-brand-100"
  }`;

  if (item.children.length === 0) {
    return (
      <li>
        <Link
          href={item.href}
          className={linkClass}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className="group relative flex items-center"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}
      onBlur={(event) => {
        if (!ref.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Link
        href={item.href}
        className={`${linkClass} pr-1`}
        aria-current={pathname === item.href ? "page" : undefined}
      >
        {item.label}
      </Link>
      <button
        type="button"
        className="rounded-md p-1 text-brand-100 hover:bg-white/10 hover:text-white"
        aria-expanded={open}
        aria-controls={submenuId}
        aria-label={ui.nav.submenu(item.label)}
        onClick={() => setOpen((value) => !value)}
      >
        <Chevron className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <ul
        id={submenuId}
        className={`absolute top-full left-0 z-50 min-w-60 rounded-lg bg-white p-2 shadow-xl ring-1 ring-black/5 group-hover:block ${
          open ? "block" : "hidden"
        }`}
      >
        {item.children.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className={`block rounded-md px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-800 ${
                isActivePath(child.href, pathname)
                  ? "font-semibold text-brand-700"
                  : "text-slate-700"
              }`}
              aria-current={pathname === child.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function MainNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  return (
    <nav aria-label={ui.nav.label}>
      <ul className="hidden items-center gap-1 xl:flex">
        {items.map((item) => (
          <DesktopItem key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 xl:hidden"
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={() => setMobileOpen((value) => !value)}
      >
        <span className="sr-only">{mobileOpen ? ui.nav.closeMenu : ui.nav.openMenu}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="size-6"
        >
          {mobileOpen ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <div
        id={panelId}
        className={`absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/10 bg-brand-800 shadow-xl xl:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
      >
        <ul className="container-site space-y-1 py-4">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 font-medium hover:bg-white/10 ${
                  isActivePath(item.href, pathname) ? "text-accent-400" : "text-white"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
              {item.children.length > 0 && (
                <ul className="ml-4 border-l border-white/20 pl-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={`block rounded-md px-3 py-2 text-sm hover:bg-white/10 ${
                          isActivePath(child.href, pathname) ? "text-accent-400" : "text-brand-100"
                        }`}
                        aria-current={pathname === child.href ? "page" : undefined}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
