import { ICheckAnswerResult, IGetAnswerResult } from "@/interfaces/interfaces";
import { getDailyKey } from "@/util/time";
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/app/api/firebase";

async function getGameAnswerDataFromDatabase(database_collection_name: string, answerKey: string) {
  console.log("Getting answer for ", answerKey);
  const answerDocRef = firestore
    .collection(database_collection_name)
    .doc("answers")
    .collection("answers")
    .doc(answerKey);

  const answerDocData = (await answerDocRef.get()).data();

  console.log("Answer doc data:", answerDocData);
  return answerDocData
}

export async function getGameAnswer(
  req: NextRequest,
  database_collection_name: string
): Promise<NextResponse<IGetAnswerResult>> {
  // Support optional date query parameter for replay mode
  const dateParam = req.nextUrl.searchParams.get("date");
  const answerKey = dateParam || getDailyKey(new Date());
  console.log("Fetching answer from the database for date:", answerKey);
  const answerDocData = await getGameAnswerDataFromDatabase(database_collection_name, answerKey)

  // if the answer is not in the database, return an error
  // runbook: if this happens, the reset did NOT happen correctly
  if (!answerDocData || !answerDocData.song || !answerDocData.song.length) {
    console.error("Answer not found in the database for date", answerKey);
    return NextResponse.json(
      {
        message: `Answer not found in the database for date ${answerKey}`,
        song: "",
        correct: false,
        startTimeStamp: "",
        endTimeStamp: "",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
      {
        message: `Here is today's answer.`,
        correct: true,
        song: answerDocData.song,
        startTimeStamp: answerDocData.startTimeStamp,
        endTimeStamp: answerDocData.endTimeStamp,
      },
      { status: 200 }
    );
}

/**
 * Check if the answer is correct.
 * Checks the answer in the database in the "today" document.
 * @param req
 */
export async function checkGameAnswer(
  req: NextRequest,
  database_collection_name: string
): Promise<NextResponse<ICheckAnswerResult>> {
  const reqJSON = await req.json();
  console.log("Request body:", reqJSON);
  if (!reqJSON.answer || !reqJSON.answer.length) {
    return NextResponse.json(
      {
        message: `Missing answer in request body`,
        correct: false,
        startTimeStamp: "",
        endTimeStamp: "",
      },
      { status: 400 }
    );
  }

  // Support optional date in request body for replay mode
  const answerKey = reqJSON.date || getDailyKey(new Date());
  console.log("Fetching answer from the database for date:", answerKey);
  const answerDocData = await getGameAnswerDataFromDatabase(database_collection_name, answerKey)

  // if the answer is not in the database, return an error
  // runbook: if this happens, the reset did NOT happen correctly
  if (!answerDocData || !answerDocData.song || !answerDocData.song.length) {
    console.error("Answer not found in the database for date", answerKey);
    return NextResponse.json(
      {
        message: `Answer not found in the database for date ${answerKey}`,
        correct: false,
        startTimeStamp: "",
        endTimeStamp: "",
      },
      { status: 500 }
    );
  }

  // compare with the payload from the request
  console.log(
    "Comparing answer with the answer in the database",
    answerDocData.song,
    "vs user submitted answer",
    reqJSON.answer
  );
  if (answerDocData.song !== reqJSON.answer) {
    return NextResponse.json(
      {
        message: `Incorrect answer.`,
        correct: false,
        startTimeStamp: "",
        endTimeStamp: "",
      },
      { status: 200 }
    );
  } else {
    // winner!
    return NextResponse.json(
      {
        message: `Correct answer!`,
        correct: true,
        song: answerDocData.song,
        startTimeStamp: answerDocData.startTimeStamp,
        endTimeStamp: answerDocData.endTimeStamp,
      },
      { status: 200 }
    );
  }
}
