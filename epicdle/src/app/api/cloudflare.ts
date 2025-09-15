import { S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.CLOUDFLARE_CDN_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_CDN_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_CDN_R2_SECRET_ACCESS_KEY;

if (!ACCOUNT_ID || ACCOUNT_ID.length === 0) {
  throw new Error("CLOUDFLARE_CDN_R2_ACCOUNT_ID environment variable not set");
}

if (!ACCESS_KEY_ID || ACCESS_KEY_ID.length === 0) {
  throw new Error(
    "CLOUDFLARE_CDN_R2_ACCESS_KEY_ID environment variable not set"
  );
}

if (!SECRET_ACCESS_KEY || SECRET_ACCESS_KEY.length === 0) {
  throw new Error(
    "CLOUDFLARE_CDN_R2_SECRET_ACCESS_KEY environment variable not set"
  );
}

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export { S3 };
