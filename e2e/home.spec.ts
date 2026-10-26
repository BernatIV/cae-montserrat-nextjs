import { expect, test } from "@playwright/test";

test("home page loads in Catalan", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Coral Antics Escolans de Montserrat/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ca");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
