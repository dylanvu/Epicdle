/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

// due to an issue with ffmpeg and spawn child processes, need to use a dynamic import
import spawn from "cross-spawn";
import seedrandom from "seedrandom";
import path from "path";
import os from "os";
import { firebaseStorage } from "@/app/api/firebase";
import { Song } from "@/interfaces/interfaces";
import mp3Parser, { Mp3Frame } from "mp3-parser";
import { SECONDS_PER_GUESS, MAX_GUESSES } from "@/constants";

function formatSecondsToMMSS(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const total = Math.floor(s);
  const mm = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
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

interface TimestampObject {
  start: string;
  end: string;
}

/** Method used to determine audio duration */
export type AudioDurationMethod = "ffprobe" | "mp3-parser";

/** Result from getAudioDuration including which method was used */
export interface AudioDurationResult {
  duration: number;
  method: AudioDurationMethod;
}

/**
 * Creates a random audio snippet seeded by the given date's day, month, and year for both the song selection and timestamp
 * @param dateSeed the date to use for the seed
 * @param audioFileExtension the file extension to use for the snippet in cloud storage
 * @param seedSalt an optional string to add to the seed to make it more random
 * @param database_collection_name this is the google cloud storage folder name that contains the complete audio file
 * @param storage_bucket_name the name of the firebase storage bucket to use for the file path
 * @param song_list the list of songs to choose from, used to just choose a random song so only the count is needed
 * @returns
 */
export async function createAudioSnippet(
  dateSeed: Date,
  audioFileExtension: "mp3",
  database_collection_name: string,
  storage_bucket_name: string,
  song_list: Song[],
  seedSalt: string = ""
): Promise<{
  result: boolean;
  message: string;
  songName: string;
  timeStamp: TimestampObject | null;
  audioOutputPath: string | null;
  /** Which method was used to determine audio duration (ffprobe or mp3-parser fallback) */
  durationMethod: AudioDurationMethod | null;
}> {
  // dynamic import of fs so we don't need to change top-level imports
  const fs = await import("fs");

  // seed format
  const seed = `${dateSeed.getFullYear()}-${dateSeed.getMonth()}-${dateSeed.getDate()}${seedSalt}`;

  // choose song
  const songCount = song_list.length;
  const randomIndex = Math.floor(seedrandom(seed)() * songCount);
  const selectedSong = song_list[randomIndex];
  // songName is used for display and answer checking (keeps apostrophes)
  const songName = selectedSong.name;
  // Auto-replace apostrophes with underscores for storage retrieval
  // This avoids shell escaping issues when ffprobe runs
  const audioFileNameForStorage = songName.replace(/'/g, "_");
  console.log("Currently selected random song is", songName);
  console.log("File name for storage retrieval:", audioFileNameForStorage);

  // fetch from GCS
  const fileName = audioFileNameForStorage + "." + audioFileExtension;
  const filePath = `${database_collection_name}/${fileName}`;
  const audioFileBucket = firebaseStorage.bucket(storage_bucket_name);

  const [audioFileBucketExists] = await audioFileBucket.exists();
  if (!audioFileBucketExists) {
    return {
      result: false,
      message: `Google Cloud Storage Bucket ${storage_bucket_name} does not exist in the storage`,
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: null,
    };
  }

  const audioFile = audioFileBucket.file(filePath);
  const [audioFileExists] = await audioFile.exists();
  if (!audioFileExists) {
    return {
      result: false,
      message: `Audio file ${filePath} does not exist in the storage`,
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: null,
    };
  }

  // download to temp file (existing pattern)
  const tmpDir = os.tmpdir();
  const safeAudioFileName = audioFileNameForStorage.replace(/\s+/g, "_");
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
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: null,
    };
  }

  let songLength = 0;
  let durationMethod: AudioDurationMethod | null = null;
  try {
    const durationResult = await getAudioDuration(tempAudioFilePath);
    songLength = durationResult.duration;
    durationMethod = durationResult.method;
  } catch (err) {
    console.warn("getAudioDuration threw an error:", err);
    songLength = 0;
  }

  if (!songLength || songLength <= 0) {
    return {
      result: false,
      message: `Could not determine duration of ${filePath}`,
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: durationMethod,
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
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: durationMethod,
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
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: durationMethod,
    };
  }

  // Now find sliceStartByte by accumulating frame durations until startSeconds is reached
  let sliceStartByte = firstFrameOffset;
  let actualStartSeconds = 0;
  try {
    let offset = firstFrameOffset;
    let accumulated = 0;
    while (offset < buf.length) {
      const frame = mp3Parser.readFrame(view, offset, false) as any;
      if (!frame) break;
      const dur = computeFrameDuration(frame);
      if (accumulated + dur > startSeconds) {
        sliceStartByte = frame._section.offset;
        actualStartSeconds = accumulated;
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
  let actualSnippetDuration = 0;
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
        actualSnippetDuration = accumulated;
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

  let actualEndSeconds = actualStartSeconds + actualSnippetDuration;

  const timeStampFormatted = {
    start: formatSecondsToMMSS(actualStartSeconds),
    end: formatSecondsToMMSS(actualEndSeconds),
  };

  console.log("timeStampFormatted:", timeStampFormatted);

  // Validate slice bounds
  if (sliceStartByte >= sliceEndByte || sliceStartByte >= buf.length) {
    return {
      result: false,
      message: `Failed to compute a valid MP3 frame slice for ${filePath} (start=${sliceStartByte}, end=${sliceEndByte}, len=${buf.length})`,
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: durationMethod,
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
      songName: songName,
      audioOutputPath: null,
      timeStamp: null,
      durationMethod: durationMethod,
    };
  }

  return {
    result: true,
    message: `Successfully created audio snippet at ${snippetOutputPath}`,
    songName: songName,
    audioOutputPath: snippetOutputPath,
    timeStamp: timeStampFormatted,
    durationMethod: durationMethod,
  };
}

/**
 * Get audio duration using ffprobe binary (fast but can fail in serverless environments)
 */
async function getAudioDurationWithFfprobe(filePath: string): Promise<number> {
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
        const duration = parseFloat(output.trim()) || 0;
        if (duration > 0) {
          resolve(Math.floor(duration));
        } else {
          reject(new Error("ffprobe returned zero or invalid duration"));
        }
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
  });
}

/**
 * Helper to compute frame duration (seconds) from an MP3 frame
 */
function computeFrameDurationFromMp3Frame(frame: Mp3Frame): number {
  const sampleLen = frame._section.sampleLength;
  const samplingRate = frame.header.samplingRate;

  // samplingRate can be a number or "reserved"
  if (typeof samplingRate === "number" && samplingRate > 0) {
    return sampleLen / samplingRate;
  }

  // fallback: infer samples per frame from MPEG version
  let samplesPerFrame = 1152;
  const mpegVersion = frame.header.mpegAudioVersionBits;
  // "10" = MPEG Version 2, "00" = MPEG Version 2.5
  if (mpegVersion === "10" || mpegVersion === "00") {
    samplesPerFrame = 576;
  }
  const fallbackSamplingRate = 44100;
  return samplesPerFrame / fallbackSamplingRate;
}

/**
 * Get audio duration by parsing MP3 frames directly (pure JavaScript fallback)
 */
async function getAudioDurationFromFrames(filePath: string): Promise<number> {
  const fs = await import("fs");
  const buf = await fs.promises.readFile(filePath);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Detect ID3v2 tag and compute audioStartOffset
  const id3v2 = mp3Parser.readId3v2Tag(view, 0);
  const audioStartOffset = id3v2
    ? id3v2._section.offset + id3v2._section.byteLength
    : 0;

  // Find first valid frame
  let firstFrameOffset: number | null = null;

  // Try strict approach first
  const f1 = mp3Parser.readFrame(view, audioStartOffset, true);
  if (f1) {
    firstFrameOffset = f1._section.offset;
  }

  // Try permissive approach
  if (firstFrameOffset === null) {
    const f2 = mp3Parser.readFrame(view, audioStartOffset, false);
    if (f2) {
      firstFrameOffset = f2._section.offset;
    }
  }

  // Scan forward for sync pattern if needed
  if (firstFrameOffset === null) {
    const MAX_SCAN = 8192;
    const scanLimit = Math.min(buf.length - 4, audioStartOffset + MAX_SCAN);
    for (let i = audioStartOffset; i < scanLimit; i++) {
      if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
        const f = mp3Parser.readFrame(view, i, false);
        if (f) {
          firstFrameOffset = f._section.offset;
          break;
        }
      }
    }
  }

  if (firstFrameOffset === null) {
    throw new Error("Could not locate any valid MP3 frames in file");
  }

  // Accumulate duration from all frames
  let totalDuration = 0;
  let offset = firstFrameOffset;

  while (offset < buf.length) {
    const frame = mp3Parser.readFrame(view, offset, false);
    if (!frame) break;

    const dur = computeFrameDurationFromMp3Frame(frame);
    totalDuration += dur;
    offset = frame._section.offset + frame._section.byteLength;
  }

  if (totalDuration <= 0) {
    throw new Error("mp3-parser calculated zero duration");
  }

  console.log("mp3-parser calculated duration:", totalDuration);
  return Math.floor(totalDuration);
}

/**
 * Get audio duration - tries ffprobe first, falls back to mp3-parser
 * Returns both the duration and which method was used
 */
export async function getAudioDuration(filePath: string): Promise<AudioDurationResult> {
  // Try ffprobe first (fast, works most of the time)
  try {
    const duration = await getAudioDurationWithFfprobe(filePath);
    console.log("ffprobe duration:", duration);
    return { duration, method: "ffprobe" };
  } catch (err) {
    console.warn("ffprobe failed, falling back to mp3-parser:", err);
  }

  // Fallback: parse MP3 frames directly (100% reliable, no binary dependency)
  try {
    const duration = await getAudioDurationFromFrames(filePath);
    console.log("mp3-parser fallback duration:", duration);
    return { duration, method: "mp3-parser" };
  } catch (err) {
    console.error("mp3-parser fallback also failed:", err);
    throw new Error(
      `Failed to get audio duration: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
