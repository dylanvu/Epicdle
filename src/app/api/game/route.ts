import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { S3 } from "@/app/api/cloudflare";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createSnippetKey, getTodaysDate } from "./util";

/**
 * retrieve the daily song snippet from the storage
 * @param request
 * @returns
 */
export async function GET() {
  try {
    const today = getTodaysDate();
    const snippetFileKey = createSnippetKey(today);

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

    // Cloudflare R2 gives you a Web ReadableStream
    const stream = Body as ReadableStream;

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": ContentType || "audio/mpeg",
        ...(ContentLength
          ? { "Content-Length": ContentLength.toString() }
          : {}),
        "Cache-Control": "public, max-age=86400, immutable",
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
