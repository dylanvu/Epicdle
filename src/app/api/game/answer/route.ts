import { NextRequest, NextResponse } from "next/server";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { ICheckAnswerResult } from "@/interfaces/interfaces";
import { getGameAnswer } from "@/app/api/common/answer/answerAPI";

export async function PATCH(
  req: NextRequest
): Promise<NextResponse<ICheckAnswerResult>> {
  return await getGameAnswer(req, FIREBASE_DATABASE_COLLECTION_NAME);
}
