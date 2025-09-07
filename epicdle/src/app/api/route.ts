import { firestore } from "./firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "../../../constants";

export async function GET(request: Request) {
  const testDoc = (
    await firestore
      .collection(FIREBASE_DATABASE_COLLECTION_NAME)
      .doc("test")
      .get()
  ).data();
  const testMessage = {
    message: `Hello World! It is ${Date.now()}. ${testDoc?.test}`,
  };
  return new Response(JSON.stringify(testMessage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
