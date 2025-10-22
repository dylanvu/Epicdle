export interface Song {
  name: string;
  album: string;
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
  | "play";

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
