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

  // DEBUG MODE: use a provided body for the date to override the date to create the snippet for that date
  // I expect this to be in the format of YYYY-MM-DD
  const debug_body = (await req.text()) ?? "";
  let debug_tomorrow: null | Date = null;
  if (debug_body && debug_body.length > 0) {
    console.log("[DEBUG] Debug Body:", debug_body);
    debug_tomorrow = new Date(debug_body);
    debug_tomorrow.setUTCHours(8, 0, 0, 0);
    console.log("[DEBUG] Overriding date to ", debug_tomorrow);
  }

  // perform the reset for both normal mode and instrumental mode
  const normalResetResult = await performReset(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME,
    FIREBASE_STORAGE_BUCKET_NAME,
    SONG_LIST,
    debug_tomorrow
  );

  const instrumentalResetResult = await performReset(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE,
    FIREBASE_STORAGE_BUCKET_NAME,
    SONG_LIST,
    debug_tomorrow,
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
