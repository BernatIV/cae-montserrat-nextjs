import { describe, expect, it } from "vitest";
import { defaultLocale, t } from ".";

describe("i18n", () => {
  it("defaults to Catalan", () => {
    expect(defaultLocale).toBe("ca");
    expect(t().siteShortName).toBe("CAE Montserrat");
  });
});
