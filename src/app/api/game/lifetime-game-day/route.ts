import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { firestore } from "../../firebase";
import { getGameDate, getNextResetTime } from "@/util/time";

export async function GET() {
  // fetch the current number of days the game has been alive from the game-stats document
  const gameStatsDocRef = firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
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

  // attach cache control headers
  const today = getGameDate();

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
