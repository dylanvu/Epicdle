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
