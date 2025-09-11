import { NextApiRequest, NextApiResponse } from "next";
import { createAudioSnippet } from "./util";
import { firestore } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { DailyAnswerDoc, isDailyAnswerDoc } from "@/interfaces/interfaces";
import { UpdateData } from "firebase-admin/firestore";

/**
 * Function that runs daily to reset the state of the game
 * ONLY ACCESSIBLE BY THE SERVER. DO NOT EXPOSE TO THE PUBLIC.
 *
 * 1. Access a random song from the bucket
 * 2. Slice it into a small snippet
 * 3. Replace the new audio snippet to be accessed by players
 * 4. Replace the daily song name to the database
 * @param request
 * @returns
 */
export async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  // TODO: make this secure so that only the Vercel scheduled function can run it
  // Do this by probably giving a special object to stick onto the request?
  // vercel is so smart: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

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
    tomorrowDocData = await firestore
      .collection(FIREBASE_DATABASE_COLLECTION_NAME)
      .doc("fallback")
      .get();
  }

  const todaysData: UpdateData<DailyAnswerDoc> = {
    song: tomorrowDocData.song,
  };

  // overwrite the "today" song answer on firebase with the "tomorrow" song
  firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
    .doc("today")
    .update(todaysData);

  // overwite the "today" song answer on the CDN with the "tomorrow" song
  // TODO: FIXME

  // now we need to prepare tomorrow's song

  // 1. Access a random song from the bucket

  // generate a random number using the date as the seed, using the month, day, and year in a string format
  // honestly this makes it really easy to cheat since you can predict the future answers
  // but if someone made it this far for a fun little game... well I hope they had as much fun reaching this point as they did playing my game
  // in theory, you could also create an algorithm to generate past answers which is kind of neat

  const today = new Date();

  // now let's get the next day's song
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // step 2 is in the createAudioSnippet function
  const tomorrowSnippetResult = await createAudioSnippet(today);
  if (!tomorrowSnippetResult.result) {
    console.error(tomorrowSnippetResult.message);
    res.status(404).json({ message: tomorrowSnippetResult.message });
    return;
  }

  // 3. Put the audio snippets into a CDN
  // we will keep a small snippet of the song into a CDN to reduce audio streaming latency and cost, because this is out of my own pocket!
  // TODO: FIXME

  // 4. Replace the daily song name to the database
  // the database will be what is used to determine the right/wrong answer
  const newTomorrowDocData: DailyAnswerDoc = {
    song: tomorrowSnippetResult.songName,
  };

  await tomorrowDocRef.set(newTomorrowDocData);

  const testMessage = {
    message: `Update successful! Today's song is ${tomorrowDocData.song} while the new song for tomorrow is ${tomorrowSnippetResult.songName}`,
  };

  console.log(testMessage);
  return new Response(JSON.stringify(testMessage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
