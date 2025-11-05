import {
  formatMsVerbose,
  formatGameDateForDisplay,
  getGameDate,
} from "@/util/time";

export default function CountdownTimer({
  time,
  remainingMs,
}: {
  time: Date;
  remainingMs: number;
}) {
  return (
    <div>
      <div>
        Today's song is for{" "}
        <strong>{formatGameDateForDisplay(getGameDate(time))}</strong>
      </div>
      <div>
        You have <strong>{formatMsVerbose(remainingMs)} left!</strong>
      </div>
    </div>
  );
}
