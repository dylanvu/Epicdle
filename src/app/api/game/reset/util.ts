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
import mp3Parser from "mp3-parser";
import { SECONDS_PER_GUESS, MAX_GUESSES } from "@/constants";

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

/**
 * Creates a random audio snippet seeded by the given date's day, month, and year for both the song selection and timestamp
 * @param dateSeed
 * @param audioFileExtension
 * @returns
 */
export async function createAudioSnippet(
  dateSeed: Date,
  audioFileExtension: "mp3"
): Promise<{
  result: boolean;
  message: string;
  songName: string;
  audioOutputPath: string | null;
}> {
  // dynamic import of fs so we don't need to change top-level imports
  const fs = await import("fs");

  // seed format
  const seed = `${dateSeed.getFullYear()}-${dateSeed.getMonth()}-${dateSeed.getDate()}`;

  // choose song
  const songCount = SONG_LIST.length;
  const randomIndex = Math.floor(seedrandom(seed)() * songCount);
  const audioFileName = SONG_LIST[randomIndex].name;
  console.log("Currently selected random song is", audioFileName);

  // fetch from GCS
  const fileName = audioFileName + "." + audioFileExtension;
  const filePath = `${FIREBASE_DATABASE_COLLECTION_NAME}/${fileName}`;
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

  // download to temp file (existing pattern)
  const tmpDir = os.tmpdir();
  const safeAudioFileName = audioFileName.replace(/\s+/g, "_");
  const tempAudioFilePath = path.join(
    tmpDir,
    `gcs-${Date.now()}-${safeAudioFileName}.${audioFileExtension}`
  );

  try {
    await audioFile.download({ destination: tempAudioFilePath });
  } catch (err) {
    return {
      result: false,
      message: `Failed to download audio file: ${
        err instanceof Error ? err.message : String(err)
      }`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  let songLength = 0;
  try {
    songLength = await getAudioDuration(tempAudioFilePath);
  } catch (err) {
    console.warn("getAudioDuration threw an error:", err);
    songLength = 0;
  }

  if (!songLength || songLength <= 0) {
    return {
      result: false,
      message: `Could not determine duration of ${filePath}`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  console.log("Got audio duration in seconds:", songLength);

  // choose snippet start
  const extraSnippetLengthBuffer = 2;
  const snippetLength =
    SECONDS_PER_GUESS * (MAX_GUESSES + extraSnippetLengthBuffer);
  const validSongLength = Math.max(0, songLength - snippetLength);
  const startSeconds =
    validSongLength > 0 ? Math.floor(seedrandom(seed)() * validSongLength) : 0;

  // read file buffer for parsing frames
  let buf: Buffer;
  try {
    buf = await fs.promises.readFile(tempAudioFilePath);
  } catch (err) {
    return {
      result: false,
      message: `Failed to read downloaded audio file: ${
        err instanceof Error ? err.message : String(err)
      }`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Detect ID3v2 tag and compute audioStartOffset (preserve tag in output)
  const id3v2 = mp3Parser.readId3v2Tag(view, 0) as any; // may be null
  const audioStartOffset = id3v2
    ? id3v2._section.offset + id3v2._section.byteLength
    : 0;
  console.log("audioStartOffset (ID3v2 end):", audioStartOffset);

  // Helper to compute frame duration (seconds)
  const computeFrameDuration = (frame: any): number => {
    try {
      const sampleLen = frame?._section?.sampleLength;
      const samplingRate = frame?.header?.samplingRate;
      if (sampleLen && samplingRate) {
        return sampleLen / samplingRate;
      }
      // fallback: infer samples per frame from MPEG version/layer
      const hdr = frame?.header || {};
      let samplesPerFrame = 1152;
      if (
        hdr.version === 2 ||
        hdr.version === "2" ||
        hdr.version === "MPEG Version 2"
      ) {
        samplesPerFrame = 576;
      }
      const sr = hdr.samplingRate || 44100;
      return samplesPerFrame / sr;
    } catch {
      return 0;
    }
  };

  // === Robustly locate the first valid MP3 frame after audioStartOffset ===
  let firstFrameOffset: number | null = null;

  // 1) strict attempt (validates next frame)
  try {
    const f1 = mp3Parser.readFrame(view, audioStartOffset, true) as any;
    if (f1 && f1._section && typeof f1._section.offset === "number") {
      firstFrameOffset = f1._section.offset;
      console.log("Found first frame (strict) at", firstFrameOffset);
    }
  } catch (e) {
    // ignore - we'll try more permissive methods
    console.debug("strict readFrame failed:", e);
  }

  // 2) permissive attempt at same offset
  if (firstFrameOffset === null) {
    try {
      const f2 = mp3Parser.readFrame(view, audioStartOffset, false) as any;
      if (f2 && f2._section && typeof f2._section.offset === "number") {
        firstFrameOffset = f2._section.offset;
        console.log("Found first frame (permissive) at", firstFrameOffset);
      }
    } catch (e) {
      console.debug("permissive readFrame at audioStartOffset failed:", e);
    }
  }

  // 3) scan forward for sync pattern and validate frames up to a MAX_SCAN window
  if (firstFrameOffset === null) {
    const MAX_SCAN = 8192; // bytes to scan forward; increase if you have weird files
    const scanLimit = Math.min(buf.length - 4, audioStartOffset + MAX_SCAN);
    console.log(
      `Scanning for frame sync from ${audioStartOffset} to ${scanLimit}`
    );
    for (let i = audioStartOffset; i < scanLimit; i++) {
      // check possible sync: 0xFF followed by 0xE0..0xFF (mask top 3 bits)
      if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
        try {
          const f = mp3Parser.readFrame(view, i, false) as any;
          if (f && f._section && typeof f._section.offset === "number") {
            firstFrameOffset = f._section.offset;
            console.log(
              "Found first frame (scanned) at",
              firstFrameOffset,
              "scan pos",
              i
            );
            break;
          }
        } catch {
          // continue scanning
        }
      }
    }
  }

  if (firstFrameOffset === null) {
    return {
      result: false,
      message: `Failed to locate any MP3 frames after ID3v2 tag for ${filePath}. Try increasing scan window or check file format.`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  // Now find sliceStartByte by accumulating frame durations until startSeconds is reached
  let sliceStartByte = firstFrameOffset;
  try {
    let offset = firstFrameOffset;
    let accumulated = 0;
    while (offset < buf.length) {
      const frame = mp3Parser.readFrame(view, offset, false) as any;
      if (!frame) break;
      const dur = computeFrameDuration(frame);
      if (accumulated + dur > startSeconds) {
        sliceStartByte = frame._section.offset;
        break;
      }
      accumulated += dur;
      offset = frame._section.offset + frame._section.byteLength;
    }
  } catch (err) {
    console.warn("Error while locating slice start:", err);
    sliceStartByte = firstFrameOffset;
  }

  // find slice end byte by accumulating frames until duration reached
  let sliceEndByte = buf.length;
  try {
    let offset = sliceStartByte;
    let accumulated = 0;
    while (offset < buf.length) {
      const frame = mp3Parser.readFrame(view, offset, false) as any;
      if (!frame) {
        sliceEndByte = Math.min(buf.length, offset);
        break;
      }
      const dur = computeFrameDuration(frame);
      accumulated += dur;
      offset = frame._section.offset + frame._section.byteLength;
      if (accumulated >= snippetLength) {
        sliceEndByte = frame._section.offset + frame._section.byteLength;
        break;
      }
    }
  } catch (err) {
    console.warn("Error while locating slice end:", err);
    sliceEndByte = Math.min(buf.length, sliceStartByte + 1024 * 1024); // fallback
  }

  console.log(
    "slice bytes:",
    sliceStartByte,
    sliceEndByte,
    "bufLen:",
    buf.length
  );

  // Validate slice bounds
  if (sliceStartByte >= sliceEndByte || sliceStartByte >= buf.length) {
    return {
      result: false,
      message: `Failed to compute a valid MP3 frame slice for ${filePath} (start=${sliceStartByte}, end=${sliceEndByte}, len=${buf.length})`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  // Create output buffer: preserve ID3v2 tag (if any) + selected frames
  const id3Buf = audioStartOffset
    ? buf.slice(0, audioStartOffset)
    : Buffer.alloc(0);
  const framesBuf = buf.slice(sliceStartByte, sliceEndByte);
  const outBuf = Buffer.concat([id3Buf, framesBuf]);

  // Write snippet to temp file (so existing code expecting a path keeps working)
  const snippetOutputPath = path.join(
    tmpDir,
    `snippet-${Date.now()}-${safeAudioFileName}.${audioFileExtension}`
  );

  try {
    await fs.promises.writeFile(snippetOutputPath, outBuf);
  } catch (err) {
    return {
      result: false,
      message: `Failed to write snippet to disk: ${
        err instanceof Error ? err.message : String(err)
      }`,
      songName: audioFileName,
      audioOutputPath: null,
    };
  }

  return {
    result: true,
    message: `Successfully created audio snippet at ${snippetOutputPath}`,
    songName: audioFileName,
    audioOutputPath: snippetOutputPath,
  };
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
