import ffprobePath from "ffprobe-static";
import { spawn } from "child_process";
import seedrandom from "seedrandom";
import path from "path";
import os from "os";
import { firebaseStorage } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME, SONG_LIST } from "@/constants";
import ffmpegPath from "ffmpeg-static";

export async function createAudioSnippet(
  dateSeed: Date
): Promise<{ result: boolean; message: string; songName: string }> {
  // extract out the day in the year-month-day format, like 2025-9-7 or something
  const seed = `${dateSeed.getFullYear()}-${dateSeed.getMonth()}-${dateSeed.getDate()}`;

  // now we will choose one of the songs from the list of audio files in the storage

  // get the number of audio files
  // Firebase Storage does not allow you to count the number of files in a bucket, so let's use the SONG_LIST
  const songCount = SONG_LIST.length;

  // choose a random number between 0 and the number of songs and use the seed
  const randomIndex = Math.floor(seedrandom(seed)() * songCount);

  // now use this index to get the audio file name from the SONG_LIST
  const audioFileName = SONG_LIST[randomIndex].name;

  console.log("Currently selected random song is", audioFileName);

  // now retrieve the audio file from the storage
  const filePath = `${FIREBASE_DATABASE_COLLECTION_NAME}/${audioFileName}`;
  // https://cloud.google.com/storage/docs/downloading-objects#downloading-an-object
  const audioFile = firebaseStorage.bucket().file(filePath);
  const [audioFileExists] = await audioFile.exists();
  if (!audioFileExists) {
    return {
      result: false,
      message: `Audio file ${audioFileName} does not exist`,
      songName: audioFileName,
    };
  }

  // build a temporary file path to download the file to
  const tmpDir = os.tmpdir();
  const tempAudioFilePath = path.join(
    tmpDir,
    `gcs-${Date.now()}-${path.basename(filePath)}`
  );

  await audioFile.download({
    destination: tempAudioFilePath,
  });

  // this "DownloadResponse" method is a Buffer: https://cloud.google.com/nodejs/docs/reference/storage/latest/overview#_google_cloud_storage_DownloadResponse_type

  // 2. Slice it into a small snippet to serve to players with a random valid starting point
  const snippetLength = "6";

  // figure out how many seconds are in the song
  const songLength = await getAudioDuration(tempAudioFilePath);

  // ensure that we do not pick the very end of the song on accident by subtracing the snippet length from the song length
  // subtract the snippet length from the song length
  const validSongLength = songLength - Number(snippetLength);

  // use the seed to pick the timestamp starting point of the whole song
  const startSeconds = Math.floor(seedrandom(seed)() * validSongLength);

  // Build ffmpeg args to slice the temp mp3 file
  const snippetOutputPath = path.join(tmpDir, `snippet-${Date.now()}.mp3`);
  const ffmpegArgs = [
    "-ss",
    String(startSeconds),
    "-i",
    tempAudioFilePath,
    "-t",
    snippetLength,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k", // bitrate
    "-f",
    "mp3",
    snippetOutputPath,
  ];

  // now we should actually slice the audio file into a snippet
  // this ffmpeg command should be in its own promise because we will use the child process to end when it's done
  try {
    await new Promise<void>((resolve, reject) => {
      const ff = spawn(ffmpegPath || "ffmpeg", ffmpegArgs);

      ff.stderr.on("data", (chunk) => {
        console.log("ffmpeg:", chunk.toString());
      });

      ff.on("error", reject);
      ff.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
    return {
      result: true,
      message: `Successfully created audio snippet at ${snippetOutputPath}`,
      songName: audioFileName,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        result: false,
        message: `Error slicing audio file: ${err.toString()}`,
        songName: audioFileName,
      };
    } else {
      return {
        result: false,
        message: `Error slicing audio file: ${err}`,
        songName: audioFileName,
      };
    }
  }
}

export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffprobePath.path, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    ff.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    ff.stderr.on("data", (err) => {
      console.error("ffprobe error:", err.toString());
    });

    ff.on("close", (code) => {
      if (code === 0) {
        const seconds = parseFloat(output.trim());
        resolve(seconds);
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
  });
}
