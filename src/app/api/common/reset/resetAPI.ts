import { NextRequest, NextResponse } from "next/server";
import { createAudioSnippet } from "./util";
import { firestore } from "@/app/api/firebase";
import { S3 } from "@/app/api/cloudflare";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { createSnippetKey } from "../util";
import { getYearMonthDay } from "@/util/time";
import { Song } from "@/interfaces/interfaces";

interface StepResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

interface ExecutionLog {
  timestamp: Date;
  targetDate: string;
  mode: string;
  isDebug: boolean;
  triggeredBy: "cron" | "manual" | "recovery";
  status: "started" | "success" | "failed";
  steps: {
    snippetGeneration: StepResult;
    r2Upload: StepResult;
    firestoreWrite: StepResult;
  };
  songName: string;
  snippetKey: string;
  totalDurationMs: number;
  error?: string;
}

/**
 * Core reset logic function to be performed daily
 * @param req NextJS request, used to gatekeep the endpoint to be performed by the cron job onl
 * @param database_collection_name database name to write the answer to, and to also pull the audio file from the bucket
 * @param storage_bucket_name overall firebase bucket name to pull the audio file from, this should always be the same irregardless of the mode
 * @param song_list list of songs, mostly used as a count to pull the random index from
 * @param debug_tomorrow optional date to override for debug mode
 * @param seedSalt optional string to add to the seed to make it more random, used to distinguish normal mode vs other modes
 * @param triggeredBy indicates what triggered this reset (cron, manual, or recovery)
 * @returns
 */
export async function performReset(
  req: NextRequest,
  database_collection_name: string,
  storage_bucket_name: string,
  song_list: Song[],
  debug_tomorrow: Date | null = null,
  seedSalt: string = "",
  triggeredBy: "cron" | "manual" | "recovery" = "cron"
) {
  const executionStartTime = Date.now();
  const executionTimestamp = new Date();
  
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

  if (debug_tomorrow) {
    tomorrow = debug_tomorrow;
  }

  console.log("Tomorrow is ", tomorrow);

  // Initialize execution log
  const executionLog: ExecutionLog = {
    timestamp: executionTimestamp,
    targetDate: getYearMonthDay(tomorrow),
    mode: database_collection_name,
    isDebug: debug_tomorrow !== null,
    triggeredBy,
    status: "started",
    steps: {
      snippetGeneration: { success: false, durationMs: 0 },
      r2Upload: { success: false, durationMs: 0 },
      firestoreWrite: { success: false, durationMs: 0 },
    },
    songName: "",
    snippetKey: "",
    totalDurationMs: 0,
  };

  // Step 1: Create the snippet
  const snippetStartTime = Date.now();
  let tomorrowSnippetResult;
  try {
    tomorrowSnippetResult = await createAudioSnippet(
      tomorrow,
      "mp3",
      database_collection_name,
      storage_bucket_name,
      song_list,
      seedSalt
    );
    executionLog.steps.snippetGeneration.durationMs = Date.now() - snippetStartTime;
    
    if (!tomorrowSnippetResult.result) {
      executionLog.steps.snippetGeneration.success = false;
      executionLog.steps.snippetGeneration.error = tomorrowSnippetResult.message;
      executionLog.status = "failed";
      executionLog.error = tomorrowSnippetResult.message;
      executionLog.totalDurationMs = Date.now() - executionStartTime;
      await logExecution(executionLog);
      
      console.error(tomorrowSnippetResult.message);
      return NextResponse.json(
        { message: tomorrowSnippetResult.message },
        { status: 500 }
      );
    }
    
    executionLog.steps.snippetGeneration.success = true;
    executionLog.songName = tomorrowSnippetResult.songName;
  } catch (error) {
    executionLog.steps.snippetGeneration.durationMs = Date.now() - snippetStartTime;
    executionLog.steps.snippetGeneration.success = false;
    executionLog.steps.snippetGeneration.error = error instanceof Error ? error.message : String(error);
    executionLog.status = "failed";
    executionLog.error = `Snippet generation failed: ${error instanceof Error ? error.message : String(error)}`;
    executionLog.totalDurationMs = Date.now() - executionStartTime;
    await logExecution(executionLog);
    
    console.error("Snippet generation error:", error);
    return NextResponse.json(
      { message: executionLog.error },
      { status: 500 }
    );
  }

  // create the snippet file path
  const snippetFilePath = tomorrowSnippetResult.audioOutputPath;

  if (!snippetFilePath) {
    executionLog.status = "failed";
    executionLog.error = "Snippet file path is null";
    executionLog.totalDurationMs = Date.now() - executionStartTime;
    await logExecution(executionLog);
    
    console.error(tomorrowSnippetResult.message);
    return NextResponse.json(
      {
        message: tomorrowSnippetResult.message,
      },
      { status: 404 }
    );
  }

  // Step 2: Upload the snippet to R2
  const newSnippetFileKey = createSnippetKey(tomorrow);
  executionLog.snippetKey = newSnippetFileKey;
  console.log("New snippet key is ", newSnippetFileKey);

  const r2StartTime = Date.now();
  try {
    // Use readFileSync instead of createReadStream for better reliability
    const fileBuffer = fs.readFileSync(snippetFilePath);
    
    await S3.send(
      new PutObjectCommand({
        Bucket: database_collection_name,
        Key: newSnippetFileKey,
        Body: fileBuffer,
        ContentType: "audio/mp3",
      })
    );
    
    executionLog.steps.r2Upload.durationMs = Date.now() - r2StartTime;
    executionLog.steps.r2Upload.success = true;
    console.log("Successfully uploaded to R2");
  } catch (error) {
    executionLog.steps.r2Upload.durationMs = Date.now() - r2StartTime;
    executionLog.steps.r2Upload.success = false;
    executionLog.steps.r2Upload.error = error instanceof Error ? error.message : String(error);
    executionLog.status = "failed";
    executionLog.error = `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`;
    executionLog.totalDurationMs = Date.now() - executionStartTime;
    await logExecution(executionLog);
    
    console.error("R2 upload error:", error);
    return NextResponse.json(
      { message: executionLog.error },
      { status: 500 }
    );
  }

  const updateMessage = {
    message: `Update successful! Tomorrow's song is ${tomorrowSnippetResult.songName}.`,
  };

  // Step 3: Publish the answer to Firestore
  const firestoreStartTime = Date.now();
  try {
    // retrieve the document with all the answers
    const answersDocRef = firestore
      .collection(database_collection_name)
      .doc("answers");

    // inside of the document, there is a collection of answers
    const answersCollectionRef = answersDocRef.collection("answers");

    // create a new answer document keyed by the date (tomorrow) and value of the song name
    const newAnswerDocKey = getYearMonthDay(tomorrow);
    const newAnswerDocRef = answersCollectionRef.doc(newAnswerDocKey);

    console.log("New answer doc key is", newAnswerDocKey);

    const newDocContents = {
      song: tomorrowSnippetResult.songName,
      startTimeStamp: tomorrowSnippetResult.timeStamp?.start ?? "",
      endTimeStamp: tomorrowSnippetResult.timeStamp?.end ?? "",
    };
    console.log("Writing this to the answer doc:", newDocContents);

    const newAnswerSetResult = await newAnswerDocRef.set(newDocContents, {
      merge: true,
    });

    console.log("Firestore .set() call completed successfully", {
      docPath: newAnswerDocRef.path,
      newAnswerSetResult,
    });

    // Verify the write
    try {
      const snap = await newAnswerDocRef.get();
      const savedData = snap.data();
      console.log("[VERIFY] Firestore doc after write:", {
        docPath: newAnswerDocRef.path,
        createTime: snap.createTime?.toDate?.() ?? snap.createTime,
        updateTime: snap.updateTime?.toDate?.() ?? snap.updateTime,
        savedData,
      });

      // Optional: sanity check if timestamps are missing
      if (!savedData?.startTimeStamp || !savedData?.endTimeStamp) {
        console.warn("[WARN] Missing timestamp fields after write!", {
          startTimeStamp: savedData?.startTimeStamp,
          endTimeStamp: savedData?.endTimeStamp,
        });
      }
    } catch (error) {
      console.error("[ERROR] Failed to verify Firestore write", {
        docPath: newAnswerDocRef.path,
        error,
      });
    }
    
    executionLog.steps.firestoreWrite.durationMs = Date.now() - firestoreStartTime;
    executionLog.steps.firestoreWrite.success = true;
  } catch (error) {
    executionLog.steps.firestoreWrite.durationMs = Date.now() - firestoreStartTime;
    executionLog.steps.firestoreWrite.success = false;
    executionLog.steps.firestoreWrite.error = error instanceof Error ? error.message : String(error);
    executionLog.status = "failed";
    executionLog.error = `Firestore write failed: ${error instanceof Error ? error.message : String(error)}`;
    executionLog.totalDurationMs = Date.now() - executionStartTime;
    await logExecution(executionLog);
    
    console.error("Firestore write error:", error);
    return NextResponse.json(
      { message: executionLog.error },
      { status: 500 }
    );
  }

  // Step 4: Increment game stats (only for non-debug resets)
  if (!debug_tomorrow) {
    try {
      const gameStatsDocRef = firestore
        .collection(database_collection_name)
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
    } catch (error) {
      console.error("Failed to increment game stats (non-critical):", error);
    }
  } else {
    console.log(
      "[DEBUG] Skipping incrementing the totalDaysAlive in the game-stats document"
    );
  }

  // Mark execution as successful
  executionLog.status = "success";
  executionLog.totalDurationMs = Date.now() - executionStartTime;
  await logExecution(executionLog);

  return NextResponse.json(
    {
      message: updateMessage,
      executionId: executionTimestamp.toISOString(),
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

/**
 * Log execution details to Firestore for monitoring and debugging
 */
async function logExecution(log: ExecutionLog): Promise<void> {
  try {
    const executionId = log.timestamp.toISOString();
    await firestore
      .collection("cron-executions")
      .doc(executionId)
      .set({
        ...log,
        timestamp: log.timestamp,
      });
    console.log(`Logged execution to cron-executions/${executionId}`);
  } catch (error) {
    console.error("Failed to log execution (non-critical):", error);
  }
}
