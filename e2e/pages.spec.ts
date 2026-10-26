import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const keyPages = [
  "/",
  "/qui-som",
  "/historia",
  "/directors",
  "/concerts",
  "/concerts/concert-de-montserrat",
  "/discografia",
  "/audios",
  "/enregistraments",
  "/75e-aniversari",
  "/contacte",
  "/politica-de-privacitat",
];

for (const path of keyPages) {
  test(`${path} renders and has no WCAG A/AA violations`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /principal/i })).toBeAttached();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test("unknown pages return a Catalan 404", async ({ page }) => {
  const response = await page.goto("/aquesta-pagina-no-existeix");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /inici/i }).first()).toBeVisible();
});

test("old WordPress URLs redirect to the new routes", async ({ page }) => {
  await page.goto("/discografia-2/");
  await expect(page).toHaveURL(/\/discografia$/);
  await page.goto("/concert-de-rubi/");
  await expect(page).toHaveURL(/\/concerts\/concert-de-rubi$/);
  await page.goto("/qui-som/");
  await expect(page).toHaveURL(/\/qui-som$/);
});

test("sitemap and robots are published", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/concerts/concert-de-rubi");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /keystatic");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /^(Obre|Tanca) el men/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("link", { name: "Concerts", exact: true }).first().click();
    await expect(page).toHaveURL(/\/concerts$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test("gallery lightbox opens, navigates and closes", async ({ page }) => {
  await page.goto("/concerts/concert-de-montserrat");
  const thumbs = page.getByRole("button", { name: /^Amplia la imatge/ });
  test.skip((await thumbs.count()) < 2, "No gallery on this concert");
  await thumbs.first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText(/^.*2 de \d+/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
