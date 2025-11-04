import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { S3 } from "@/app/api/cloudflare";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createSnippetKey } from "./util";
import { getNowInResetTimezone, getNextResetTime } from "@/util/time";

/**
 * retrieve the daily song snippet from the storage
 * @param request
 * @returns
 */
export async function GET() {
  try {
    const today = getNowInResetTimezone();
    const snippetFileKey = createSnippetKey(today);

    console.log("Getting snippet for", snippetFileKey);

    const { Body, ContentType, ContentLength, LastModified, ETag } =
      await S3.send(
        new GetObjectCommand({
          Bucket: FIREBASE_DATABASE_COLLECTION_NAME,
          Key: snippetFileKey,
        })
      );

    if (!Body) {
      return new Response("File not found", { status: 404 });
    }

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

    // Cloudflare R2 returns a ReadableStream
    const stream = Body as ReadableStream;

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": ContentType || "audio/mpeg",
        ...(ContentLength
          ? { "Content-Length": ContentLength.toString() }
          : {}),
        "Cache-Control": cacheControl,
        Expires: nextMidnight.toUTCString(),
        "X-Resolved-Date": today.toISOString(),
        ...(ETag ? { ETag } : {}),
        ...(LastModified
          ? { "Last-Modified": LastModified.toUTCString() }
          : {}),
      } as HeadersInit,
    });
  } catch (err) {
    console.error("Error retrieving audio snippet:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Check if the answer is correct
 * @param request
 */
export async function POST(request: Request) {
  //
}
