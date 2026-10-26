import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

// Without the GitHub App credentials (e.g. in CI), Keystatic throws at build
// time. Respond 503 instead so the rest of the site still builds and deploys.
const isConfigured =
  config.storage.kind !== "github" ||
  process.env.NODE_ENV === "development" ||
  Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET,
  );

function notConfigured() {
  return new Response("Keystatic GitHub App is not configured.", { status: 503 });
}

export const { GET, POST } = isConfigured
  ? makeRouteHandler({ config })
  : { GET: notConfigured, POST: notConfigured };
