import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { S3 } from "@/app/api/cloudflare";
import { GetObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";
import { createSnippetKey } from "./util";
import { getNextResetTime } from "@/util/time";

/**
 * retrieve the daily song snippet from the storage
 * @param request
 * @returns
 */
export async function GET() {
  try {
    const today = new Date();
    console.log("Today is ", today);
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
      console.error("File not found");
      return new Response("File not found", { status: 404 });
    }

    // compute seconds until next master midnight
    const nextMidnight = getNextResetTime(today); // implement to return Date at next central midnight
    console.log("Next reset time is", nextMidnight);
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
      },
    });
  } catch (err) {
    if (err instanceof S3ServiceException) {
      switch (err.name) {
        case "NoSuchKey":
          return new Response("Today's snippet could not be found.", {
            status: 404,
          });
        case "AccessDenied":
          return new Response("Server was denied to today's snippet.", {
            status: 403,
          });
        case "InvalidObjectState":
          return new Response("Snippet cannot be retrieved (archived).", {
            status: 409,
          });
        case "SlowDown":
        case "ServiceUnavailable":
          return new Response("S3 service is busy, try again later.", {
            status: 503,
          });
        case "InternalError":
          return new Response("S3 internal error occurred.", { status: 500 });
        case "SignatureDoesNotMatch":
        case "InvalidAccessKeyId":
          return new Response("Server credentials misconfigured.", {
            status: 401,
          });
        default:
          return new Response(
            `S3 error occurred: ${err.name} - ${err.message}`,
            { status: 500 }
          );
      }
    }
    console.error("Error retrieving audio snippet:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
