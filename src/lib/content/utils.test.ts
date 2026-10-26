import { describe, expect, it } from "vitest";
import { parseYouTubeId, sortByDateDesc, splitByDate, todayIso } from "./utils";

describe("parseYouTubeId", () => {
  it.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["  dQw4w9WgXcQ  ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts the ID from %s", (input, expected) => {
    expect(parseYouTubeId(input)).toBe(expected);
  });

  it.each([null, undefined, "", "abc", "https://vimeo.com/123456789", "https://youtube.com/watch"])(
    "returns null for %s",
    (input) => {
      expect(parseYouTubeId(input)).toBeNull();
    },
  );
});

describe("todayIso", () => {
  it("uses the Europe/Madrid time zone", () => {
    // 23:30 UTC on 31 Dec is already 1 Jan in Madrid.
    expect(todayIso(new Date("2025-12-31T23:30:00Z"))).toBe("2026-01-01");
  });
});

describe("sortByDateDesc", () => {
  it("sorts newest first and puts undated entries last", () => {
    const items = [{ date: "2020-01-01" }, { date: null }, { date: "2024-05-11" }];
    expect(sortByDateDesc(items).map((i) => i.date)).toEqual(["2024-05-11", "2020-01-01", null]);
  });

  it("does not mutate the input", () => {
    const items = [{ date: "2020-01-01" }, { date: "2024-05-11" }];
    sortByDateDesc(items);
    expect(items[0]?.date).toBe("2020-01-01");
  });
});

describe("splitByDate", () => {
  it("returns upcoming soonest first (today included) and past newest first", () => {
    const items = [
      { date: "2026-12-01" },
      { date: "2026-01-01" },
      { date: "2026-06-15" },
      { date: "2026-11-01" },
      { date: null },
    ];
    const { upcoming, past } = splitByDate(items, "2026-06-15");
    expect(upcoming.map((i) => i.date)).toEqual(["2026-06-15", "2026-11-01", "2026-12-01"]);
    expect(past.map((i) => i.date)).toEqual(["2026-01-01", null]);
  });
});
