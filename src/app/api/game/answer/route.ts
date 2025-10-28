import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/app/api/firebase";
import { FIREBASE_DATABASE_COLLECTION_NAME } from "@/constants";
import { ICheckAnswerResult } from "@/interfaces/interfaces";

/**
 * Check if the answer is correct.
 * Checks the answer in the database in the "today" document.
 * @param req
 */
export async function PATCH(
  req: NextRequest
): Promise<NextResponse<ICheckAnswerResult>> {
  const reqJSON = await req.json();
  console.log("Request body:", reqJSON);
  console.log("answer:", !reqJSON.answer);
  console.log("answer.length:", !reqJSON.answer.length);
  if (!reqJSON.answer || !reqJSON.answer.length) {
    return NextResponse.json(
      {
        message: `Missing answer in request body`,
        correct: false,
      },
      { status: 400 }
    );
  }
  console.log("Fetching today's answer from the database");
  const answerDocRef = firestore
    .collection(FIREBASE_DATABASE_COLLECTION_NAME)
    .doc("today");

  const answerDocData = (await answerDocRef.get()).data();

  console.log("Answer doc data:", answerDocData);

  // if the answer is not in the database, return an error
  if (!answerDocData || !answerDocData.song) {
    return NextResponse.json(
      {
        message: `Answer not found in the database. Please contact the creator of this game.`,
        correct: false,
      },
      { status: 500 }
    );
  }

  // compare with the payload from the request
  console.log(
    "Comparing answer with the answer in the database",
    answerDocData.song,
    reqJSON.answer
  );
  if (answerDocData.song !== reqJSON.answer) {
    return NextResponse.json(
      {
        message: `Incorrect answer.`,
        correct: false,
      },
      { status: 200 }
    );
  } else {
    // winner!
    return NextResponse.json(
      {
        message: `Correct answer!`,
        correct: true,
      },
      { status: 200 }
    );
  }
}
