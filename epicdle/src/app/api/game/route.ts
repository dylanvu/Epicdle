import { firestore } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";

/**
 * retrieve the daily song snippet from the storage
 * @param request
 * @returns
 */
export async function GET(request: Request) {
  const testMessage = {
    message: `Hello World! It is ${Date.now()}.`,
  };
  return new Response(JSON.stringify(testMessage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Check if the answer is correct
 * @param request
 */
export async function POST(request: Request) {
  //
}
