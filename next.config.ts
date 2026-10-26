import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keystatic's GitHub mode redirects localhost to 127.0.0.1 (OAuth loopback),
  // so the dev server must accept that origin. Only affects `next dev`.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
