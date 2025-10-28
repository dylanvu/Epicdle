import { HttpError, ICheckAnswerResult } from "@/interfaces/interfaces";

const GAME_API_BASE_ENDPOINT = "/api/game";

export async function checkAnswer(guess: string): Promise<boolean> {
  const response = await fetch(`${GAME_API_BASE_ENDPOINT}/answer`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: guess,
    }),
  });

  if (!response.ok) {
    throw new HttpError(response.statusText, response.status);
  }

  const data: ICheckAnswerResult = await response.json();

  return data.correct;
}
