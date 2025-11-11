export interface Song {
  name: string;
  album: string;
  perfect_win_text: string;
  url: string;
}

export interface Player {
  name: string;
  streak: number;
  lastWinDate: Date;
}

export interface DailyAnswerDoc {
  song: string;
}

export function isDailyAnswerDoc(v: unknown): v is DailyAnswerDoc {
  return (
    typeof v === "object" && v !== null && typeof (v as any).song === "string"
  );
}

const winStates = ["win", "perfect_win"] as const;

export type WinState = (typeof winStates)[number];

export type GameState =
  | "initial_loading"
  | WinState
  | "lose"
  | "submit"
  | "loading"
  | "play"
  | "error";

/**
 * isWinState typeguard
 * @param state state to check
 * @returns is a win state
 */
export function isWinState(state: string): state is WinState {
  return winStates.includes(state as WinState);
}

export interface IVolumeObject {
  volume: number;
  muted: boolean;
}

export interface ICheckAnswerResult {
  message: string;
  correct: boolean;
  startTimeStamp: string;
  endTimeStamp: string;
}

export interface IYouTubeVideo {
  url: string;
  startTimeStamp: string;
  endTimeStamp: string;
}

export function isICheckAnswerResult(v: unknown): v is ICheckAnswerResult {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).message === "string" &&
    typeof (v as any).correct === "boolean"
  );
}

export class HttpError extends Error {
  statusCode: number;
  name: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}
