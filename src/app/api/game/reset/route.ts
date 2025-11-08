import { NextRequest } from "next/server";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { performReset } from "@/app/api/common/reset/resetAPI";

export async function GET(req: NextRequest) {
  // vercel cron only makes GET requests
  // so just call the POST route as a workaround
  return POST(req);
}

export async function POST(req: NextRequest) {
  return await performReset(req, FIREBASE_DATABASE_COLLECTION_NAME);
}
