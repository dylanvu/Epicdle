import { FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE } from "@/constants";
import { getLifetimeGameDay } from "@/app/api/common/lifetime-game-day/lifetimeGameDayAPI";

export async function GET() {
  return await getLifetimeGameDay(
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE
  );
}
