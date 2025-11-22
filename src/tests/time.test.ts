import { getGameDate, getDailyKey } from "@/util/time";
import { RESET_HOUR_UTC } from "@/constants";

/**
 * Helper to create a UTC date easily
 */
function utcDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  min = 0,
  sec = 0
) {
  return new Date(Date.UTC(year, month, day, hour, min, sec));
}

describe("getGameDate", () => {
  const resetHour = RESET_HOUR_UTC;

  test("returns same date at midnight when time is AFTER reset hour", () => {
    const input = utcDate(2024, 0, 10, resetHour + 1, 0, 0); // e.g., 8 AM UTC if reset = 7
    const result = getGameDate(input);

    expect(result.toISOString()).toBe(utcDate(2024, 0, 10).toISOString());
  });

  test("returns previous date at midnight when time is BEFORE reset hour", () => {
    const input = utcDate(2024, 0, 10, resetHour - 1, 0, 0); // e.g., 6 AM UTC if reset = 7
    const result = getGameDate(input);

    expect(result.toISOString()).toBe(utcDate(2024, 0, 9).toISOString());
  });

  test("handles exact reset hour correctly (should NOT roll back)", () => {
    const input = utcDate(2024, 0, 10, resetHour, 0, 0);
    const result = getGameDate(input);

    expect(result.toISOString()).toBe(utcDate(2024, 0, 10).toISOString());
  });

  test("rolls back correctly across month boundaries", () => {
    const input = utcDate(2024, 2, 1, resetHour - 1, 0, 0); // March 1 before reset
    const result = getGameDate(input);

    // Expect Feb 29 (leap year)
    expect(result.toISOString()).toBe(utcDate(2024, 1, 29).toISOString());
  });

  test("rolls back correctly across year boundaries", () => {
    const input = utcDate(2024, 0, 1, resetHour - 1, 0, 0); // Jan 1 before reset
    const result = getGameDate(input);

    // Expect Dec 31, 2023
    expect(result.toISOString()).toBe(utcDate(2023, 11, 31).toISOString());
  });

  test("uses current date if no argument is passed", () => {
    // Use fake timers / setSystemTime to avoid replacing the global Date constructor
    const fixedNow = utcDate(2024, 0, 10, resetHour + 2, 0, 0);

    jest.useFakeTimers().setSystemTime(fixedNow);

    try {
      const result = getGameDate();
      expect(result.toISOString()).toBe(utcDate(2024, 0, 10).toISOString());
    } finally {
      // Always restore real timers so other tests aren't affected
      jest.useRealTimers();
    }
  });

  test("always returns a UTC midnight date", () => {
    const input = utcDate(2024, 5, 15, 12, 34, 56);
    const result = getGameDate(input);

    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });
});

describe("getDailyKey", () => {
  const resetHour = RESET_HOUR_UTC;

  test("returns today's date when time is AFTER reset hour", () => {
    const input = utcDate(2024, 0, 10, resetHour + 1); // e.g. 8 AM if reset=7
    const key = getDailyKey(input);

    expect(key).toBe("2024-1-10");
  });

  test("returns previous date when time is BEFORE reset hour", () => {
    const input = utcDate(2024, 0, 10, resetHour - 1); // e.g. 6 AM if reset=7
    const key = getDailyKey(input);

    expect(key).toBe("2024-1-9");
  });

  test("returns the same date at EXACT reset hour", () => {
    const input = utcDate(2024, 0, 10, resetHour);
    const key = getDailyKey(input);

    expect(key).toBe("2024-1-10");
  });

  test("rolls back correctly across month boundary", () => {
    const input = utcDate(2024, 2, 1, resetHour - 1); // March 1 → before reset
    const key = getDailyKey(input);

    expect(key).toBe("2024-2-29"); // leap year
  });

  test("rolls back correctly across year boundary", () => {
    const input = utcDate(2024, 0, 1, resetHour - 1); // Jan 1 → before reset
    const key = getDailyKey(input);

    expect(key).toBe("2023-12-31");
  });

  test("uses current date if no argument is passed", () => {
    const fakeNow = utcDate(2024, 0, 10, resetHour + 3);

    jest.useFakeTimers().setSystemTime(fakeNow);

    try {
      const key = getDailyKey();
      expect(key).toBe("2024-1-10");
    } finally {
      jest.useRealTimers();
    }
  });
});
