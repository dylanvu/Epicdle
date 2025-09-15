import { NextRequest, NextResponse } from "next/server";
import { createAudioSnippet } from "./util";
import { firestore } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { DailyAnswerDoc, isDailyAnswerDoc } from "@/interfaces/interfaces";
import { UpdateData } from "firebase-admin/firestore";
import { S3 } from "@/app/api/cloudflare";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import fs from "fs";

/**
 * Function that runs daily to reset the state of the game
 * ONLY ACCESSIBLE BY THE SERVER. DO NOT EXPOSE TO THE PUBLIC.
 *
 * 1. Update the database from the "tomorrow" song to the "today" song
 * 2. Create a new snippet for "tomorrow"
 * 3. Upload the new snippet to the CDN
 * 4. Update the new answer to the database
 * 5. Delete the old snippet from the CDN
 * @param request
 * @returns
 */
export async function PATCH(req: NextRequest) {
  // TODO: make this secure so that only the Vercel scheduled function can run it
  // Do this by probably giving a special object to stick onto the request?
  // vercel is so smart: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

  // TODO: should I turn this into a transaction?

  // first, let's delete the "today" song with the "tomorrow" song information

  // find out what was tomorrow's answer
  const tomorrowDocRef = firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
    .doc("tomorrow");

  let tomorrowDocData = (await tomorrowDocRef.get()).data();

  if (
    !tomorrowDocData ||
    !isDailyAnswerDoc(tomorrowDocData) ||
    !tomorrowDocData.song
  ) {
    // TODO: make a fallback snippet and answer just in case
    console.error(
      "No tomorrow's song data found. Here is the data:",
      JSON.stringify(tomorrowDocData)
    );
    tomorrowDocData = (
      await firestore
        .collection(FIREBASE_DATABASE_COLLECTION_NAME)
        .doc("fallback")
        .get()
    ).data();

    console.log("Fallback song data:", JSON.stringify(tomorrowDocData));
  }

  // fallback in case something goes horribly wrong
  if (!tomorrowDocData || !tomorrowDocData.song) {
    return NextResponse.json(
      {
        message: `Failed to update the database because tomorrow's song could not be found`,
      },
      {
        status: 500,
      }
    );
  }

  const todaysData: UpdateData<DailyAnswerDoc> = {
    song: tomorrowDocData.song,
  };

  // overwrite the "today" song answer on firebase with the "tomorrow" song
  await firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
    .doc("today")
    .set(todaysData);

  // no need to worry about any race conditions; the snippet for "tomorrow" (now today) is already on the CDN
  console.log("Successfully updated the database with the new song");

  // now we need to prepare tomorrow's song ahead of time

  // 1. Access a random song from the bucket

  // generate a random number using the date as the seed, using the month, day, and year in a string format
  // honestly this makes it really easy to cheat since you can predict the future answers
  // but if someone made it this far for a fun little game... well I hope they had as much fun reaching this point as they did playing my game
  // in theory, you could also create an algorithm to generate past answers which is kind of neat

  // now let's get the next day's song

  // create a fixed date for testing
  const today = new Date(2025, 8, 8);
  // const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // step 2 is in the createAudioSnippet function
  const tomorrowSnippetResult = await createAudioSnippet(today, "mp3");
  if (!tomorrowSnippetResult.result) {
    console.error(tomorrowSnippetResult.message);
    return NextResponse.json(
      { message: tomorrowSnippetResult.message },
      { status: 500 }
    );
  }

  // 3. Put the audio snippets into a CDN
  // we will keep a small snippet of the song into a CDN to reduce audio streaming latency and cost, because this is out of my own pocket!
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

  const newSnippetFileKey = `${tomorrow.getFullYear()}-${tomorrow.getMonth()}-${tomorrow.getDate()}.mp3`;

  await S3.send(
    new PutObjectCommand({
      Bucket: FIREBASE_DATABASE_COLLECTION_NAME,
      Key: newSnippetFileKey,
      Body: fs.createReadStream(snippetFilePath),
      ContentType: "audio/mp3",
    })
  );

  // 4. Replace the daily song name to the database
  // the database will be what is used to determine the right/wrong answer
  const newTomorrowDocData: DailyAnswerDoc = {
    song: tomorrowSnippetResult.songName,
  };

  await tomorrowDocRef.set(newTomorrowDocData);

  const updateMessage = {
    message: `Update successful! Today's song is ${tomorrowDocData.song} while the new song for tomorrow is ${tomorrowSnippetResult.songName}`,
  };

  console.log(updateMessage);

  // now clean up the old snippet file from the CDN
  const oldSnippetFileKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}.mp3`;

  let deleteResult;
  try {
    deleteResult = await S3.send(
      new DeleteObjectCommand({
        Bucket: FIREBASE_DATABASE_COLLECTION_NAME,
        Key: oldSnippetFileKey,
      })
    );
  } catch (err) {
    if (err instanceof S3ServiceException) {
      console.error(
        "Error deleting the old snippet file from the CDN. Error:",
        err.name,
        err.message,
        "Cause:",
        err.cause
      );

      return NextResponse.json(
        {
          message: `Failed to delete the old snippet file due to AWS S3 Error: ${err.message}`,
        },
        { status: 500 }
      );
    } else {
      console.error("Something else went wrong", err);
    }

    return NextResponse.json(
      {
        message: `Failed to delete the old snippet file due to an unknown error: ${err}`,
      },
      { status: 500 }
    );
  }

  // I actually don't know what the httpStatusCode would mean if it's missingg
  if (!deleteResult.$metadata.httpStatusCode) {
    console.error(
      "Error deleting the old snippet file from the CDN. Request ID:",
      deleteResult.$metadata.requestId
    );
    return NextResponse.json(
      {
        message: `Failed to delete the old snippet file due to an unknown error. Request ID: ${deleteResult.$metadata.requestId}`,
      },
      { status: 500 }
    );
  }

  console.log(
    `Successfully deleted the old snippet file ${oldSnippetFileKey} from the CDN`
  );

  return NextResponse.json(
    {
      message: updateMessage,
    },
    { status: 200 }
  );
}
