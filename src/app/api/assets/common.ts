import { S3 } from "@/app/api/cloudflare";
import { GetObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";

export async function getStaticGifAsset(bucket: string, key: string) {
  try {
    console.log("getting static gif asset", key, "from bucket", bucket);
    const { Body, ContentType, ContentLength, LastModified, ETag } =
      await S3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

    if (!Body) {
      console.error("File not found");
      return new Response("File not found", { status: 404 });
    }

    // Choose headers: s-maxage for CDN, max-age for browsers
    const cacheControl = [
      `public`,
      `max-age=${31536000}`,
      `s-maxage=${31536000}`,
      `must-revalidate`,
      `stale-while-revalidate=604800`,
    ].join(", ");

    // TODO: return the gif object with proper cache control headers

    const stream = Body as ReadableStream;

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": ContentType || "image/gif",
        ...(ContentLength
          ? { "Content-Length": ContentLength.toString() }
          : {}),
        "Cache-Control": cacheControl,
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
          return new Response("GIF could not be found.", {
            status: 404,
          });
        case "AccessDenied":
          return new Response("Server was denied to GIF.", {
            status: 403,
          });
        case "InvalidObjectState":
          return new Response("GIF cannot be retrieved (archived).", {
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
    console.error("Error retrieving gif:", key, "error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
