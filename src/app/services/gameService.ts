import { HttpError, ICheckAnswerResult } from "@/interfaces/interfaces";
import { getNextResetTime, getNowInResetTimezone } from "@/util/time";

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

export async function getDailySnippet(): Promise<Blob> {
  // calculate the number of seconds left until the next central time midnight for caching
  const now = getNowInResetTimezone();
  const nextMidnight = getNextResetTime(now);
  const remainingMs = nextMidnight.getTime() - now.getTime();
  // something is nagging at me... like what if something happens, the seconds are too close, and then you fetch audio and then like, you are behind an ENTIRE DAY
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const response = await fetch(`${GAME_API_BASE_ENDPOINT}`, {
    method: "GET",
    next: {
      revalidate: remainingSeconds,
    },
  });

  if (!response.ok || !response.body) {
    throw new HttpError(response.statusText, response.status);
  }

  const blob = await response.blob();

  return blob;
}
