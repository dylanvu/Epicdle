import { NextRequest, NextResponse } from "next/server";
import { createAudioSnippet } from "./util";
import { firestore } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { S3 } from "@/app/api/cloudflare";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { createSnippetKey } from "../util";
import { getYearMonthDay } from "@/util/time";

export async function GET(req: NextRequest) {
  // vercel cron only makes GET requests
  // so just call the POST route as a workaround
  return POST(req);
}

export async function POST(req: NextRequest) {
  // this function is not guaranteed to run at the exact time of the cron job
  // there is a delay of up to 1 hour
  // how we will handle song submission and scoring is that we will rely on the universal UTC reset time, 7 AM UTC (11 PM PST)
  // when someone submits a song, we will check if it is within the 7 AM UTC time window and grab the corresponding date
  // but that is for the answer route
  // in the reset route, we will generate tomorrow's song
  // I have set up an automatic lifecycle rule to delete the old snippet file from the CDN after 7 days
  // https://developers.cloudflare.com/r2/buckets/object-lifecycles/#dashboard
  // so we don't need to worry about deleting the old snippet file
  //
  //
  //
  // so here's the plan:
  // security ofc
  // make this secure so that only the Vercel scheduled function can run it
  // vercel is so smart: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // when this API is called
  // get the date in the UTC
  const now = new Date();
  console.log("Today is ", now);

  // the clients have already shifted to the premade snippet, so we need to generate tomorrow's snippet

  let tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  console.log("Tomorrow is ", tomorrow);

  // DEBUG MODE: use a provided body for the date to override the date to create the snippet
  // I expect this to be in the format of YYYY-MM-DD
  const debug_body = await req.text();
  if (debug_body) {
    console.log("[DEBUG] Debug Body:", debug_body);
    tomorrow = new Date(debug_body);
    console.log("[DEBUG] Overriding date to ", tomorrow);
  }

  // create the snippet
  const tomorrowSnippetResult = await createAudioSnippet(tomorrow, "mp3");
  if (!tomorrowSnippetResult.result) {
    console.error(tomorrowSnippetResult.message);
    return NextResponse.json(
      { message: tomorrowSnippetResult.message },
      { status: 500 }
    );
  }

  // create the snippet file path
  const snippetFilePath = tomorrowSnippetResult.audioOutputPath;

  if (!snippetFilePath) {
    console.error(tomorrowSnippetResult.message);
    return NextResponse.json(
      {
        message: tomorrowSnippetResult.message,
      },
      { status: 404 }
    );
  }

  // upload the snippet to CDN

  const newSnippetFileKey = createSnippetKey(tomorrow);
  console.log("New snippet key is ", newSnippetFileKey);

  await S3.send(
    new PutObjectCommand({
      Bucket: FIREBASE_DATABASE_COLLECTION_NAME,
      Key: newSnippetFileKey,
      Body: fs.createReadStream(snippetFilePath),
      ContentType: "audio/mp3",
    })
  );

  const updateMessage = {
    message: `Update successful! Tomorrow's song is ${tomorrowSnippetResult.songName}.`,
  };

  // publish the answer as a new document in the database

  // retrieve the document with all the answers
  const answersDocRef = firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
    .doc("answers");

  // inside of the document, there is a collection of answers
  const answersCollectionRef = answersDocRef.collection("answers");

  // create a new answer document keyed by the date (tomorrow) and value of the song name
  const newAnswerDocKey = getYearMonthDay(tomorrow);
  const newAnswerDocRef = answersCollectionRef.doc(newAnswerDocKey);

  await newAnswerDocRef.set({
    song: tomorrowSnippetResult.songName,
  });

  // now increment the days the game has been alive
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

  gameStatsDocData["lifetime_day_count"]++;

  await gameStatsDocRef.set(gameStatsDocData);

  console.log(
    "Successfully incremented the totalDaysAlive in the game-stats document to be",
    gameStatsDocData.lifetime_day_count
  );

  return NextResponse.json(
    {
      message: updateMessage,
    },
    { status: 200 }
  );
  // no deletions needed
  // no race conditions
  // it's gucci
  // a TTL in firebase for the answers collection is not free, but would make things cleaner
  // https://cloud.google.com/firestore/pricing
  // https://firebase.google.com/docs/firestore/ttl
}
