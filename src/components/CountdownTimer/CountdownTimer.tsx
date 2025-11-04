import { formatMs } from "@/util/time";

export default function CountdownTimer({
  time,
  remainingMs,
}: {
  time: Date;
  remainingMs: number;
}) {
  return (
    <div>
      <div>Today is {time.toDateString()}</div>
      <div>The song resets in {formatMs(remainingMs)}</div>
    </div>
  );
}
