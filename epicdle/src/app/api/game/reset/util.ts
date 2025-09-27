/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

// due to an issue with ffmpeg and spawn child processes, need to use a dynamic import
import spawn from "cross-spawn";
import seedrandom from "seedrandom";
import path from "path";
import os from "os";
import { firebaseStorage } from "@/app/api/firebase";
import {
  FIREBASE_DATABASE_COLLECTION_NAME,
  SONG_LIST,
  FIREBASE_STORAGE_BUCKET_NAME,
} from "@/constants";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

/** Resolve ffmpeg-static at runtime and return path */
function resolveFfmpegStatic(): string {
  try {
    const ff: any = require("ffmpeg-static");
    const p = ff && (ff.path || ff); // ff is either string or object with .path
    if (typeof p === "string") return p;
    throw new Error("ffmpeg-static resolved but path not found");
  } catch (err) {
    throw new Error(
      "ffmpeg binary not found. Install ffmpeg-static as a dependency (npm i --save ffmpeg-static) or ensure ffmpeg is on PATH."
    );
  }
}

/** Resolve ffprobe-static at runtime and return path */
function resolveFfprobeStatic(): string {
  try {
    const probe: any = require("ffprobe-static");
    const p = probe && (probe.path || probe);
    if (typeof p === "string") return p;
    throw new Error("ffprobe-static resolved but path not found");
  } catch (err) {
    throw new Error(
      "ffprobe binary not found. Install ffprobe-static as a dependency (npm i --save ffprobe-static) or ensure ffprobe is on PATH."
    );
  }
}

export async function createAudioSnippet(
  dateSeed: Date,
  audioFileExtension: "mp3"
): Promise<{
  result: boolean;
  message: string;
  songName: string;
  audioOutputPath: string | null;
}> {
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
  const fileName = audioFileName + "." + audioFileExtension;
  const filePath = `${FIREBASE_DATABASE_COLLECTION_NAME}/${fileName}`;
  // https://cloud.google.com/storage/docs/downloading-objects#downloading-an-object
  const audioFileBucket = firebaseStorage.bucket(FIREBASE_STORAGE_BUCKET_NAME);

  const [audioFileBucketExists] = await audioFileBucket.exists();

  if (!audioFileBucketExists) {
    return {
      result: false,
      message: `Google Cloud Storage Bucket ${FIREBASE_STORAGE_BUCKET_NAME} does not exist in the storage`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  const audioFile = audioFileBucket.file(filePath);
  const [audioFileExists] = await audioFile.exists();
  if (!audioFileExists) {
    return {
      result: false,
      message: `Audio file ${filePath} does not exist in the storage`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  // build a temporary file path to download the file to
  const tmpDir = os.tmpdir();
  const safeAudioFileName = audioFileName.replace(/\s+/g, "_");
  const tempAudioFilePath = path.join(
    tmpDir,
    `gcs-${Date.now()}-${safeAudioFileName}.${audioFileExtension}`
  );

  await audioFile.download({
    destination: tempAudioFilePath,
  });

  // this "DownloadResponse" method is a Buffer: https://cloud.google.com/nodejs/docs/reference/storage/latest/overview#_google_cloud_storage_DownloadResponse_type

  // 2. Slice it into a small snippet to serve to players with a random valid starting point
  const snippetLength = "6";

  // figure out how many seconds are in the song
  const songLength = await getAudioDuration(tempAudioFilePath);

  console.log("Got audio duration in seconds:", songLength);

  // ensure that we do not pick the very end of the song on accident by subtracing the snippet length from the song length
  // subtract the snippet length from the song length
  const validSongLength = songLength - Number(snippetLength);

  // use the seed to pick the timestamp starting point of the whole song
  const startSeconds = Math.floor(seedrandom(seed)() * validSongLength);

  console.log("ffmpegPath:", ffmpegPath);
  console.log("exists:", ffmpegPath ? fs.existsSync(ffmpegPath) : false);
  if (ffmpegPath) {
    try {
      console.log("stat:", fs.statSync(ffmpegPath));
    } catch (e) {
      console.log("stat error", e);
    }
  }

  // Build ffmpeg args to slice the temp audio file
  const snippetOutputPath = path.join(
    tmpDir,
    `snippet-${Date.now()}-${safeAudioFileName}.${audioFileExtension}`
  );

  const ffmpegArgs = [
    "-ss",
    String(startSeconds),
    "-t",
    snippetLength,
    "-i",
    tempAudioFilePath,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    snippetOutputPath,
  ];

  // ! REMEMBER TO MANUALLY INSTALL FFMPEG ON WINDOWS
  const ffBinary = resolveFfmpegStatic();

  console.log("Using ffmpeg binary:", ffBinary);

  try {
    await new Promise<void>((resolve, reject) => {
      const ff = spawn(ffBinary, ffmpegArgs, { shell: true });

      ff.stdout!.on("data", (chunk) =>
        console.log("ffmpeg stdout:", chunk.toString())
      );
      ff.stderr!.on("data", (chunk) =>
        console.error("ffmpeg stderr:", chunk.toString())
      );

      ff.on("error", reject);
      ff.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`ffmpeg exited with code ${code}`))
      );
    });

    return {
      result: true,
      message: `Successfully created audio snippet at ${snippetOutputPath}`,
      songName: audioFileName,
      audioOutputPath: snippetOutputPath,
    };
  } catch (err) {
    return {
      result: false,
      message: `Error slicing audio file: ${
        err instanceof Error ? err.message : err
      }`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }
}

export async function getAudioDuration(filePath: string): Promise<number> {
  const ffprobeBinary = resolveFfprobeStatic(); // throws if missing
  console.log("Using ffprobe binary:", ffprobeBinary);

  return new Promise((resolve, reject) => {
    const ff = spawn(
      ffprobeBinary,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { shell: true }
    );

    let output = "";
    ff.stdout!.on("data", (chunk) => (output += chunk.toString()));
    ff.stderr!.on("data", (c) =>
      console.error("ffprobe stderr:", c.toString())
    );

    ff.on("error", (err) => reject(err));
    ff.on("close", (code) => {
      if (code === 0) {
        resolve(Math.floor(parseFloat(output.trim()) || 0));
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
  });
}
