"use client";
import { useEffect, useState } from "react";
import { RESET_TIMEZONE } from "@/constants";

function getCentralNow() {
  // returns a Date object representing the current time in Central Time
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(now);

  const map: Record<string, number> = {};
  parts.forEach((p) => {
    if (p.type === "year") map.year = Number(p.value);
    if (p.type === "month") map.month = Number(p.value);
    if (p.type === "day") map.day = Number(p.value);
    if (p.type === "hour") map.hour = Number(p.value);
    if (p.type === "minute") map.minute = Number(p.value);
    if (p.type === "second") map.second = Number(p.value);
  });

  return new Date(
    map.year!,
    (map.month ?? 1) - 1,
    map.day ?? 1,
    map.hour ?? 0,
    map.minute ?? 0,
    map.second ?? 0
  );
}

function msUntilNextMidnightCentral() {
  const now = getCentralNow();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  return nextMidnight.getTime() - now.getTime();
}

function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function CountdownTimer() {
  const [remainingMs, setRemainingMs] = useState(msUntilNextMidnightCentral());

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(msUntilNextMidnightCentral());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    // TODO: add a question mark, hover over it, and it should say "midnight US central time"
    <div>
      Today's song resets in {formatMs(remainingMs)} (U.S. Central Time)
    </div>
  );
}
