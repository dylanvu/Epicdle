import { FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE } from "@/constants";
import { getGame } from "@/app/api/common/getGame";

export async function GET() {
  return await getGame(FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE);
}
