/** Hosts of the public site (old WordPress and new one share the domain). */
export const siteHosts = ["caemontserrat.cat", "www.caemontserrat.cat"] as const;

/**
 * Old WordPress paths (without trailing slash) whose content was merged or
 * renamed in the new site. Used for 301 redirects (next.config.ts) and to
 * rewrite links stored in content (menu, Markdoc bodies).
 */
export const legacyRedirects: Readonly<Record<string, string>> = {
  "/discografia-2": "/discografia",
  "/historial-de-concerts": "/concerts",
  "/feed": "/",
  "/concert-de-montserrat": "/concerts/concert-de-montserrat",
  "/programa-de-montserrat": "/concerts/concert-de-montserrat",
  "/fotografies-del-concert-de-montserrat": "/concerts/concert-de-montserrat",
  "/concert-de-la-bonanova": "/concerts/concert-de-la-bonanova",
  "/programa-de-la-bonanova": "/concerts/concert-de-la-bonanova",
  "/fotografies-del-concert-de-la-bonanova": "/concerts/concert-de-la-bonanova",
  "/enregistrament-del-concert-de-la-bonanova": "/concerts/concert-de-la-bonanova",
  "/concert-de-rubi": "/concerts/concert-de-rubi",
  "/programa-de-rubi": "/concerts/concert-de-rubi",
  "/fotografies-del-concert-de-rubi": "/concerts/concert-de-rubi",
  "/enregistrament-concert-rubi": "/concerts/concert-de-rubi",
  "/fotomuntatge-2": "/concerts/concert-de-rubi",
};

/** True for site-relative paths such as `/concerts` (not `//host` or `mailto:`). */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Normalises a link written by an editor: absolute links to our own domain
 * become relative, trailing slashes (WordPress style) are removed and old
 * WordPress URLs are mapped to their new route. Other links are returned as-is.
 */
export function normalizeHref(href: string): string {
  const value = href.trim();
  const isAbsolute = /^https?:\/\//i.test(value);
  if (!isInternalHref(value) && !isAbsolute) return value;

  let url: URL;
  try {
    url = new URL(value, `https://${siteHosts[0]}`);
  } catch {
    return value;
  }
  if (isAbsolute && !(siteHosts as readonly string[]).includes(url.hostname)) return value;
  // Uploads still live on the old WordPress until they are migrated.
  if (url.pathname.startsWith("/wp-content/")) return value;

  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") || "/" : "/";
  return (legacyRedirects[path] ?? path) + url.search + url.hash;
}

/** Whether `href` is the current page or one of its ancestors (for menu highlighting). */
export function isActivePath(href: string, pathname: string): boolean {
  if (!isInternalHref(href)) return false;
  const target = href.split(/[?#]/)[0] ?? "/";
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}
