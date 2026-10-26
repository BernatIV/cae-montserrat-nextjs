import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("renders the hero title, sections and structured data from real content", async () => {
    const { container } = render(await Home());
    expect(
      screen.getByRole("heading", { level: 1, name: "Coral Antics Escolans de Montserrat" }),
    ).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Pròxims concerts" })).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Tots els concerts" }).length).toBeGreaterThan(0);

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(jsonLd?.innerHTML ?? "{}")).toMatchObject({
      "@type": "MusicGroup",
      foundingDate: "1948",
    });
  });
});
