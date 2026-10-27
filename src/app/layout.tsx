import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { defaultLocale, t } from "@/lib/i18n";
import { defaultOgImage, siteUrl } from "@/lib/seo";
import "./globals.css";

const ui = t();

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: ui.siteName, template: `%s | ${ui.siteShortName}` },
  description: ui.siteDescription,
  applicationName: ui.siteShortName,
  openGraph: {
    type: "website",
    locale: "ca_ES",
    siteName: ui.siteName,
    images: [defaultOgImage],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#161a33",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={defaultLocale}
      className={`h-full antialiased ${inter.variable} ${jakarta.variable}`}
      // Smooth scrolling only for in-page links; Next.js disables it on route changes.
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
