import { NextRequest, NextResponse } from "next/server";
import {
  FIREBASE_DATABASE_COLLECTION_NAME,
  FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE,
  FIREBASE_STORAGE_BUCKET_NAME,
  SONG_LIST,
} from "@/constants";
import { performReset } from "@/app/api/common/reset/resetAPI";

export async function GET(req: NextRequest) {
  // vercel cron only makes GET requests
  // so just call the POST route as a workaround
  return POST(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // TODO: check for body for a debug mode to activate a specific reset

  // perform the reset for both normal mode and instrumental mode
  const normalResetResult = await performReset(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME,
    FIREBASE_STORAGE_BUCKET_NAME,
    SONG_LIST
  );

  const instrumentalResetResult = await performReset(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE,
    FIREBASE_STORAGE_BUCKET_NAME,
    SONG_LIST,
    "-instrumental"
  );

  // analyze the two results and return a combined response
  // check if both results are successful
  let status = 200;

  if (!normalResetResult.ok || !instrumentalResetResult.ok) {
    status = 500;
    console.error("One or more resets failed");
    console.error(normalResetResult);
    console.error(instrumentalResetResult);
  }

  const combinedResult = {
    normalMode: { ...normalResetResult },
    instrumentalMode: { ...instrumentalResetResult },
  };

  console.log("combined reset result:", combinedResult);

  return NextResponse.json(combinedResult, { status: status });
}
