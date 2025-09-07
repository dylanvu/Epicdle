import { firestore, firebaseStorage } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME, SONG_LIST } from "@/constants";
import seedrandom from "seedrandom";

/**
 * Function that runs daily to reset the state of the game
 * ONLY ACCESSIBLE BY THE SERVER. DO NOT EXPOSE TO THE PUBLIC.
 *
 * 1. Access a random song from the bucket
 * 2. Slice it into a smaller second snippet
 * 3. Replace the new audio snippet to be accessed by players
 * 4. Replace the daily song name to the database
 * @param request
 * @returns
 */
export async function PATCH(request: Request) {
  // TODO: make this secure so that only the Vercel scheduled function can run it
  // Do this by probably giving a special object to stick onto the request?
  // vercel is so smart: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

  // 1. Access a random song from the bucket

  // generate a random number using the date as the seed, using the month, day, and year in a string format
  // honestly this makes it really easy to cheat since you can predict the future answers
  // but if someone made it this far for a fun little game... well I hope they had as much fun reaching this point as they did playing my game
  // in theory, you could also create an algorithm to generate past answers which is kind of neat
  const today = new Date();
  // extract out the day in the year-month-day format, like 2025-9-7 or something
  const seed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // now we will choose one of the songs from the list of audio files in the storage

  // get the number of audio files
  // Firebase Storage does not allow you to count the number of files in a bucket, so let's use the SONG_LIST
  const songCount = SONG_LIST.length;

  // choose a random number between 0 and the number of songs and use the seed
  const randomIndex = Math.floor(seedrandom(seed)() * songCount);

  // now use this index to get the audio file name from the SONG_LIST
  const audioFileName = SONG_LIST[randomIndex].name;

  console.log("Today's random song is", audioFileName);

  // now retrieve the audio file from the storage
  const filePath = `${FIREBASE_DATABASE_COLLECTION_NAME}/${audioFileName}`;
  // https://cloud.google.com/storage/docs/downloading-objects#downloading-an-object
  const audioFile = await firebaseStorage.bucket().file(filePath).download();
  // this "DownloadResponse" method is a Buffer: https://cloud.google.com/nodejs/docs/reference/storage/latest/overview#_google_cloud_storage_DownloadResponse_type

  // 2. Slice it into a small snippet to serve to players with a random valid starting point

  // use the seed to pick the timestamp starting point of the whole song
  // figure out how many seconds are in the song
  // ensure that we do not pick the very end of the song on accident by subtracing the snippet length from the song length

  // now we should actually slice the audio file into a snippet

  // 3. Put the audio snippet into a CDN
  // we will keep a small snippet of the song into a CDN to reduce audio streaming latency and cost, because this is out of my own pocket!

  // TODO: I want to run this function well before the reset time so that when reset happens, it's as simple as accessing the "right time" now
  // I'm thinking that I will seed the game with 2 days of data
  // and then, when the reset happens, we will generate actually the next day's game
  // and then we will clean up "yesterday's" data

  // 4. Replace the daily song name to the database
  // the database will be what is used to determine the right/wrong answer

  // TODO: Figure out now if this architecture actually makes sense
  // should I just keep the "current day" and "tomorrow" data in the database?
  // and then here, we are just updating the current "tomorrow" to be "today", and writing a new "tomorrow"?

  const testMessage = {
    message: `Hello World! It is ${Date.now()}.`,
  };
  return new Response(JSON.stringify(testMessage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
