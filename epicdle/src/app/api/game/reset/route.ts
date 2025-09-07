import { firestore } from "../../firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "../../../../constants";

/**
 * Function that runs daily to reset the state of the game
 * ONLY ACCESSIBLE BY THE SERVER. DO NOT EXPOSE TO THE PUBLIC.
 *
 * 1. Access a random song from the bucket
 * 2. Slice it into a 6 second snippet
 * 3. Put the snippet into the storage
 * 4. Upload the daily song name to the database
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
