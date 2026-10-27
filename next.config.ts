import type { NextConfig } from "next";
import { HERO_QUALITY } from "./src/lib/image-quality";
import { legacyRedirects } from "./src/lib/routes";

const nextConfig: NextConfig = {
  // Keystatic's GitHub mode redirects localhost to 127.0.0.1 (OAuth loopback),
  // so the dev server must accept that origin. Only affects `next dev`.
  allowedDevOrigins: ["127.0.0.1"],
  // Header images are the largest on screen, so they are re-encoded at a higher quality.
  images: { qualities: [75, HERO_QUALITY] },
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
