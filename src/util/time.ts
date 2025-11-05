import { RESET_HOUR_UTC } from "@/constants";

export function formatMsVerbose(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");
  return parts.slice(0, -1).join(", ") + ", and " + parts.at(-1);
}

export function getNextResetTime(now: Date = new Date()): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  // Today’s reset in UTC
  const todayReset = new Date(Date.UTC(year, month, day, RESET_HOUR_UTC, 0, 0));

  // If now is before today’s reset, return today’s reset
  // Otherwise, return tomorrow’s reset
  if (now < todayReset) {
    return todayReset;
  } else {
    // Tomorrow’s reset
    return new Date(Date.UTC(year, month, day + 1, RESET_HOUR_UTC, 0, 0));
  }
}

/**
 * This function returns the year-month-day fixed date in the reset timezone for the given date
 * For example, if the UTC hour to reset is 7 AM, all times before 7 AM will be reset to the previous day, and it will always be midnight
 * So this function is only used to determine the year-month-day for the inputted date in relation to the reset timezone
 * This function should primarily be used in the backend to figure out the snippet date
 * @param date the date to get the game date for. If not provided, the current date will be used
 * @returns UTC date in the reset timezone, midnight always
 */
export function getGameDate(date: Date = new Date()): Date {
  const utcHour = date.getUTCHours();

  // Start with the UTC year, month, day
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth();
  let day = date.getUTCDate();

  // If current UTC hour is before reset, roll back one day
  if (utcHour < RESET_HOUR_UTC) {
    // Subtract one day
    const prevDay = new Date(Date.UTC(year, month, day - 1));
    year = prevDay.getUTCFullYear();
    month = prevDay.getUTCMonth();
    day = prevDay.getUTCDate();
  }

  // Return a Date at midnight UTC for that game day
  return new Date(Date.UTC(year, month, day));
}

export function getYearMonthDay(date: Date): string {
  return `${date.getUTCFullYear()}-${
    date.getUTCMonth() + 1
  }-${date.getUTCDate()}`;
}

export function formatGameDateForDisplay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
