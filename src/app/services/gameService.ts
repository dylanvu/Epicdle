import { ValidAPIBaseEndpoint } from "@/constants";
import { HttpError, ICheckAnswerResult, IGetAnswerResult } from "@/interfaces/interfaces";
import { getNextResetTime } from "@/util/time";

export async function getAnswer(
  base_endpoint: ValidAPIBaseEndpoint
): Promise<IGetAnswerResult> {
    const response = await fetch(`${base_endpoint}/answer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = await response.text();
    if (response.status === 429) {
      errorMessage = "Try again in a minute.";
    }
    throw new HttpError(errorMessage, response.status);
  }

  const data: IGetAnswerResult = await response.json();

  return {
    message: data.message,
    song: data.song,
    startTimeStamp: data.startTimeStamp,
    endTimeStamp: data.endTimeStamp,
  };
}

export async function checkAnswer(
  guess: string,
  base_endpoint: ValidAPIBaseEndpoint
): Promise<ICheckAnswerResult> {
  const response = await fetch(`${base_endpoint}/answer`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer: guess,
    }),
  });

  if (!response.ok) {
    let errorMessage = await response.text();
    if (response.status === 429) {
      errorMessage = "Too many submissions, try again in a minute.";
    }
    throw new HttpError(errorMessage, response.status);
  }

  const data: ICheckAnswerResult = await response.json();

  return {
    message: data.message,
    correct: data.correct,
    startTimeStamp: data.startTimeStamp,
    endTimeStamp: data.endTimeStamp,
  };
}

export async function getDailySnippet(
  base_endpoint: ValidAPIBaseEndpoint
): Promise<Blob> {
  // calculate the number of seconds left until the next central time midnight for caching
  const now = new Date();
  const nextMidnight = getNextResetTime(now);
  const remainingMs = nextMidnight.getTime() - now.getTime();
  // something is nagging at me... like what if something happens, the seconds are too close, and then you fetch audio and then like, you are behind an ENTIRE DAY
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const response = await fetch(`${base_endpoint}`, {
    method: "GET",
    next: {
      revalidate: remainingSeconds,
    },
  });

  if (!response.ok || !response.body) {
    const errorMessage = await response.text();
    throw new HttpError(errorMessage, response.status);
  }

  const blob = await response.blob();

  return blob;
}

export async function getLifetimeGameDay(
  base_endpoint: ValidAPIBaseEndpoint
): Promise<number> {
  const response = await fetch(`${base_endpoint}/lifetime-game-day`, {
    method: "GET",
  });

  if (!response.ok) {
    let errorMessage = await response.text();
    if (response.status === 429) {
      errorMessage = "Too many attempts, try again in a minute.";
    }
    throw new HttpError(errorMessage, response.status);
  }

  const data = await response.json();

  return data.days;
}

export async function getGifAsset(endpoint: string): Promise<Blob> {
  const response = await fetch(endpoint, {
    method: "GET",
  });

  if (!response.ok) {
    let errorMessage = await response.text();
    if (response.status === 429) {
      errorMessage = "Too many attempts, try again in a minute.";
    }
    throw new HttpError(errorMessage, response.status);
  }

  const blob = await response.blob();

  return blob;
}
