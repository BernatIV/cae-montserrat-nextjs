import { describe, expect, it } from "vitest";
import { dateParts, formatDate, groupByDecade, joinParts } from "./format";

describe("formatDate", () => {
  it("formats ISO dates in Catalan", () => {
    expect(formatDate("2023-06-18")).toMatch(/^18 de juny de(l)? 2023$/);
    expect(formatDate("1949-04-12")).toMatch(/^12 d’abril de(l)? 1949$|^12 d'abril de(l)? 1949$/);
  });

  it("returns an empty string for missing or invalid dates", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("2023")).toBe("");
  });
});

describe("dateParts", () => {
  it("splits a date for badges", () => {
    expect(dateParts("2023-11-19")).toMatchObject({ day: "19", year: "2023" });
    expect(dateParts(null)).toBeNull();
  });
});

describe("groupByDecade", () => {
  it("groups by decade, newest first, undated last", () => {
    const groups = groupByDecade([
      { date: "2023-01-01" },
      { date: null },
      { date: "1949-04-12" },
      { date: "2020-05-05" },
      { date: "1955-01-01" },
    ]);
    expect(groups.map((g) => [g.decade, g.items.length])).toEqual([
      [2020, 2],
      [1950, 1],
      [1940, 1],
      [null, 1],
    ]);
  });
});

describe("joinParts", () => {
  it("skips empty parts", () => {
    expect(joinParts(["Basílica", " ", null, "Montserrat"])).toBe("Basílica, Montserrat");
  });
});
