import { RESET_TIMEZONE } from "@/constants";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

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
 * this function returns the current date in the master time zone
 * @returns
 */
export function getNowInResetTimezone(): Date {
  return toZonedTime(new Date(), RESET_TIMEZONE);
}

export function getTodaysDate(now = new Date()): Date {
  return toZonedTime(now, RESET_TIMEZONE);
}

// returns a Date (UTC instant) corresponding to the next reset timezone midnight
export function getNextResetTime(now = new Date()): Date {
  const zonedNow = toZonedTime(now, RESET_TIMEZONE);
  const y = zonedNow.getFullYear();
  const m = zonedNow.getMonth();
  const d = zonedNow.getDate();

  // Build a wall-clock Date representing next day at 00:00 in the zone:
  const nextMidnightWallClock = new Date(y, m, d + 1, 0, 0, 0);
  // Convert that zoned wall-clock time to the UTC instant:
  return fromZonedTime(nextMidnightWallClock, RESET_TIMEZONE);
}
