import { getDailyKey } from "@/util/time";
export function createSnippetKey(date: Date): string {
  console.log("Creating snippet key for ", date);
  const dateString = getDailyKey(date);
  const newSnippetFileKey = `${dateString}.mp3`;
  return newSnippetFileKey;
}

/**
 * Creates headers for caching a response, expiring at the UTC reset time
 * UNUSED atm but might be useful later
 * @returns
 */
export function createCacheControlHeaders(
  today: Date,
  nextMidnight: Date
): HeadersInit {
  let secondsUntilReset = Math.max(
    0,
    Math.floor((nextMidnight.getTime() - today.getTime()) / 1000)
  );

  const SAFETY_BUFFER_SECONDS = 90;
  secondsUntilReset = Math.max(5, secondsUntilReset - SAFETY_BUFFER_SECONDS);

  // Choose headers: s-maxage for CDN, max-age for browsers
  const cacheControl = [
    `public`,
    `max-age=${secondsUntilReset}`,
    `s-maxage=${secondsUntilReset}`,
    `must-revalidate`,
    `stale-while-revalidate=30`,
  ].join(", ");

  return {
    "Cache-Control": cacheControl,
    Expires: nextMidnight.toUTCString(),
    "X-Resolved-Date": today.toISOString(),
  };
}
