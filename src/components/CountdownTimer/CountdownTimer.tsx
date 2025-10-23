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
      <div>Today's is {time.toDateString()}</div>
      <div>
        The song resets in {formatMs(remainingMs)} (at Midnight U.S. Central
        Time)
      </div>
    </div>
  );
}
