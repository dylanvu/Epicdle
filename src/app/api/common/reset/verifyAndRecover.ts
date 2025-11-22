import { firestore } from "@/app/api/firebase";
import { S3 } from "@/app/api/cloudflare";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { getYearMonthDay } from "@/util/time";
import { createSnippetKey } from "../util";

interface ModeCheckResult {
  firestoreExists: boolean;
  r2Exists: boolean;
  allGood: boolean;
}

interface VerificationResult {
  normalMode: ModeCheckResult;
  instrumentalMode: ModeCheckResult;
  recoveryNeeded: boolean;
}

/**
 * Check if tomorrow's data exists in both Firestore and R2 for a given mode
 */
async function checkModeData(
  targetDate: Date,
  databaseCollectionName: string
): Promise<ModeCheckResult> {
  const result: ModeCheckResult = {
    firestoreExists: false,
    r2Exists: false,
    allGood: false,
  };

  const dateKey = getYearMonthDay(targetDate);

  // Check Firestore
  try {
    const answersDocRef = firestore
      .collection(databaseCollectionName)
      .doc("answers")
      .collection("answers")
      .doc(dateKey);

    const snapshot = await answersDocRef.get();
    result.firestoreExists = snapshot.exists;

    if (result.firestoreExists) {
      console.log(
        `[VERIFY] Firestore document exists for ${databaseCollectionName}/${dateKey}`
      );
    } else {
      console.warn(
        `[VERIFY] Firestore document MISSING for ${databaseCollectionName}/${dateKey}`
      );
    }
  } catch (error) {
    console.error(
      `[VERIFY] Error checking Firestore for ${databaseCollectionName}:`,
      error
    );
    result.firestoreExists = false;
  }

  // Check R2
  try {
    const snippetKey = createSnippetKey(targetDate);
    await S3.send(
      new HeadObjectCommand({
        Bucket: databaseCollectionName,
        Key: snippetKey,
      })
    );
    result.r2Exists = true;
    console.log(
      `[VERIFY] R2 object exists for ${databaseCollectionName}/${snippetKey}`
    );
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      console.warn(
        `[VERIFY] R2 object MISSING for ${databaseCollectionName}/${createSnippetKey(
          targetDate
        )}`
      );
      result.r2Exists = false;
    } else {
      console.error(
        `[VERIFY] Error checking R2 for ${databaseCollectionName}:`,
        error
      );
      result.r2Exists = false;
    }
  }

  result.allGood = result.firestoreExists && result.r2Exists;
  return result;
}

/**
 * Verify that tomorrow's data exists for both normal and instrumental modes
 */
export async function verifyTomorrowData(
  normalModeCollection: string,
  instrumentalModeCollection: string
): Promise<VerificationResult> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  console.log(`[VERIFY] Checking data for tomorrow: ${getYearMonthDay(tomorrow)}`);

  const normalMode = await checkModeData(tomorrow, normalModeCollection);
  const instrumentalMode = await checkModeData(tomorrow, instrumentalModeCollection);

  const recoveryNeeded = !normalMode.allGood || !instrumentalMode.allGood;

  return {
    normalMode,
    instrumentalMode,
    recoveryNeeded,
  };
}

interface VerificationLog {
  timestamp: Date;
  targetDate: string;
  checks: {
    normalMode: ModeCheckResult;
    instrumentalMode: ModeCheckResult;
  };
  recoveryNeeded: boolean;
  recoveryAttempted: boolean;
  recoveryResults?: {
    normalMode: { success: boolean; executionId?: string; error?: string };
    instrumentalMode: { success: boolean; executionId?: string; error?: string };
  };
  totalDurationMs: number;
}

/**
 * Log verification results to Firestore
 */
export async function logVerification(log: VerificationLog): Promise<void> {
  try {
    const verificationId = log.timestamp.toISOString();
    await firestore
      .collection("cron-verifications")
      .doc(verificationId)
      .set({
        ...log,
        timestamp: log.timestamp,
      });
    console.log(`[VERIFY] Logged verification to cron-verifications/${verificationId}`);
  } catch (error) {
    console.error("[VERIFY] Failed to log verification (non-critical):", error);
  }
}

/**
 * Create a verification log object
 */
export function createVerificationLog(
  targetDate: string,
  checks: VerificationResult
): Omit<VerificationLog, "totalDurationMs"> {
  return {
    timestamp: new Date(),
    targetDate,
    checks: {
      normalMode: checks.normalMode,
      instrumentalMode: checks.instrumentalMode,
    },
    recoveryNeeded: checks.recoveryNeeded,
    recoveryAttempted: false,
  };
}
