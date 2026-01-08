import { NextRequest, NextResponse } from "next/server";
import { FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE } from "@/constants";
import { ICheckAnswerResult, IGetAnswerResult } from "@/interfaces/interfaces";
import { checkGameAnswer, getGameAnswer} from "@/app/api/common/answer/answerAPI";

export async function PATCH(
  req: NextRequest
): Promise<NextResponse<ICheckAnswerResult>> {
  return await checkGameAnswer(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE
  );
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<IGetAnswerResult>> {
  return await getGameAnswer(
    req,
    FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE
  );
}