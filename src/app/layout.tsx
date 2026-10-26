import type { Metadata } from "next";
import { defaultLocale, t } from "@/lib/i18n";
import "./globals.css";

const ui = t();

export const metadata: Metadata = {
  title: { default: ui.siteName, template: `%s | ${ui.siteShortName}` },
  description: ui.siteDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={defaultLocale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
