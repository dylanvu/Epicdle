import { firestore } from "@/app/api/firebase";
import { getNextResetTime } from "@/util/time";

export async function getLifetimeGameDay(database_collection_name: string) {
  console.log(
    "Fetching lifetime game day from the database for",
    database_collection_name
  );
  // fetch the current number of days the game has been alive from the game-stats document
  const gameStatsDocRef = firestore
    .collection(database_collection_name)
    .doc("game-stats");

  let gameStatsDocData = (await gameStatsDocRef.get()).data();

  if (!gameStatsDocData) {
    gameStatsDocData = {
      lifetime_day_count: 0,
    };
  }

  const lifetimeDayCount = {
    days: gameStatsDocData.lifetime_day_count,
  };

  console.log("Lifetime game day count:", lifetimeDayCount);

  // attach cache control headers
  const today = new Date();

  // compute seconds until next master midnight
  const nextMidnight = getNextResetTime(today); // implement to return Date at next central midnight
  let secondsUntilReset = Math.max(
    0,
    Math.floor((nextMidnight.getTime() - today.getTime()) / 1000)
  );

  // safety buffer so we don't race exactly at midnight
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

  return new Response(JSON.stringify(lifetimeDayCount), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
      Expires: nextMidnight.toUTCString(),
      "X-Resolved-Date": today.toISOString(),
    },
  });
}
