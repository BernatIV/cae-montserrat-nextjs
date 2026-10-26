import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/routes";

const nextConfig: NextConfig = {
  // Keystatic's GitHub mode redirects localhost to 127.0.0.1 (OAuth loopback),
  // so the dev server must accept that origin. Only affects `next dev`.
  allowedDevOrigins: ["127.0.0.1"],
  // Old WordPress URLs that were merged or renamed (see docs/decisions/0011).
  // Trailing-slash variants are first normalised by Next.js.
  async redirects() {
    return Object.entries(legacyRedirects).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
