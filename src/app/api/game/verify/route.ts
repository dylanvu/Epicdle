import { NextRequest, NextResponse } from "next/server";
import {
  FIREBASE_DATABASE_COLLECTION_NAME,
  FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE,
  FIREBASE_STORAGE_BUCKET_NAME,
  SONG_LIST,
} from "@/constants";
import {
  verifyTomorrowData,
  createVerificationLog,
  logVerification,
} from "@/app/api/common/reset/verifyAndRecover";
import { performReset } from "@/app/api/common/reset/resetAPI";
import { getYearMonthDay } from "@/util/time";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Security: only allow Vercel cron to access this endpoint
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log("[VERIFY] Starting verification check...");

  // Calculate tomorrow's date
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const targetDateKey = getYearMonthDay(tomorrow);

  console.log(`[VERIFY] Target date: ${targetDateKey}`);

  // Check if tomorrow's data exists for both modes
  const verificationResult = await verifyTomorrowData(
    FIREBASE_DATABASE_COLLECTION_NAME,
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE
  );

  // Create verification log (will add totalDurationMs at the end)
  const verificationLogPartial = createVerificationLog(
    targetDateKey,
    verificationResult
  );

  // If recovery is needed, attempt to regenerate missing data
  if (verificationResult.recoveryNeeded) {
    console.log("[VERIFY] Recovery needed! Attempting to regenerate...");

    verificationLogPartial.recoveryAttempted = true;
    verificationLogPartial.recoveryResults = {
      normalMode: { success: false },
      instrumentalMode: { success: false },
    };

    // Recover normal mode if needed
    if (!verificationResult.normalMode.allGood) {
      console.log("[VERIFY] Recovering normal mode...");
      try {
        const normalResetResult = await performReset(
          req,
          FIREBASE_DATABASE_COLLECTION_NAME,
          FIREBASE_STORAGE_BUCKET_NAME,
          SONG_LIST,
          tomorrow, // Use tomorrow's date
          "",
          "recovery" // Mark as recovery trigger
        );

        if (normalResetResult.ok) {
          const responseData = await normalResetResult.json();
          verificationLogPartial.recoveryResults!.normalMode.success = true;
          verificationLogPartial.recoveryResults!.normalMode.executionId =
            responseData.executionId;
          console.log(
            "[VERIFY] Normal mode recovery successful:",
            responseData.executionId
          );
        } else {
          verificationLogPartial.recoveryResults!.normalMode.success = false;
          verificationLogPartial.recoveryResults!.normalMode.error =
            "Reset returned non-OK status";
          console.error("[VERIFY] Normal mode recovery failed");
        }
      } catch (error) {
        verificationLogPartial.recoveryResults!.normalMode.success = false;
        verificationLogPartial.recoveryResults!.normalMode.error =
          error instanceof Error ? error.message : String(error);
        console.error("[VERIFY] Normal mode recovery error:", error);
      }
    } else {
      verificationLogPartial.recoveryResults!.normalMode.success = true;
      console.log("[VERIFY] Normal mode data already exists, no recovery needed");
    }

    // Recover instrumental mode if needed
    if (!verificationResult.instrumentalMode.allGood) {
      console.log("[VERIFY] Recovering instrumental mode...");
      try {
        const instrumentalResetResult = await performReset(
          req,
          FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE,
          FIREBASE_STORAGE_BUCKET_NAME,
          SONG_LIST,
          tomorrow, // Use tomorrow's date
          "-instrumental",
          "recovery" // Mark as recovery trigger
        );

        if (instrumentalResetResult.ok) {
          const responseData = await instrumentalResetResult.json();
          verificationLogPartial.recoveryResults!.instrumentalMode.success = true;
          verificationLogPartial.recoveryResults!.instrumentalMode.executionId =
            responseData.executionId;
          console.log(
            "[VERIFY] Instrumental mode recovery successful:",
            responseData.executionId
          );
        } else {
          verificationLogPartial.recoveryResults!.instrumentalMode.success = false;
          verificationLogPartial.recoveryResults!.instrumentalMode.error =
            "Reset returned non-OK status";
          console.error("[VERIFY] Instrumental mode recovery failed");
        }
      } catch (error) {
        verificationLogPartial.recoveryResults!.instrumentalMode.success = false;
        verificationLogPartial.recoveryResults!.instrumentalMode.error =
          error instanceof Error ? error.message : String(error);
        console.error("[VERIFY] Instrumental mode recovery error:", error);
      }
    } else {
      verificationLogPartial.recoveryResults!.instrumentalMode.success = true;
      console.log(
        "[VERIFY] Instrumental mode data already exists, no recovery needed"
      );
    }
  } else {
    console.log("[VERIFY] All data present, no recovery needed");
  }

  // Calculate total duration and create complete log
  const verificationLog = {
    ...verificationLogPartial,
    totalDurationMs: Date.now() - startTime,
  };
  await logVerification(verificationLog);

  // Return results
  return NextResponse.json(
    {
      targetDate: targetDateKey,
      checks: verificationLog.checks,
      recoveryNeeded: verificationLog.recoveryNeeded,
      recoveryAttempted: verificationLog.recoveryAttempted,
      recoveryResults: verificationLog.recoveryResults,
      totalDurationMs: verificationLog.totalDurationMs,
    },
    { status: 200 }
  );
}
