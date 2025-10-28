import { RESET_TIMEZONE } from "@/constants";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * this function returns the current date in the central time zone
 * @returns
 */
export function getCentralNow(): Date {
  const today = new Date(2025, 8, 9);
  return toZonedTime(today, RESET_TIMEZONE);
  return toZonedTime(new Date(), RESET_TIMEZONE);
}

// returns YYYY-MM-DD for the master Central date
export function getTodaysDate(now = new Date()): string {
  const zonedNow = toZonedTime(now, RESET_TIMEZONE);
  return format(zonedNow, "yyyy-MM-dd");
}

// returns a Date (UTC instant) corresponding to the next Central midnight
export function getNextCentralMidnight(now = new Date()): Date {
  const zonedNow = toZonedTime(now, RESET_TIMEZONE);
  const y = zonedNow.getFullYear();
  const m = zonedNow.getMonth();
  const d = zonedNow.getDate();

  // Build a wall-clock Date representing next day at 00:00 in the zone:
  const nextMidnightWallClock = new Date(y, m, d + 1, 0, 0, 0);
  // Convert that zoned wall-clock time to the UTC instant:
  return fromZonedTime(nextMidnightWallClock, RESET_TIMEZONE);
}
