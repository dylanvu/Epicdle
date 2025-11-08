import { NextRequest } from "next/server";
import { getStaticGifAsset } from "@/app/api/assets/common";

export async function GET(req: NextRequest) {
  return await getStaticGifAsset("epic-the-musical-gifs", "Boar.gif");
}
