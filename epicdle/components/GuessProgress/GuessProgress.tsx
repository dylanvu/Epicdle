import { Progress } from "@mantine/core";
import { Song } from "../../interfaces/interfaces";

/**
 *
 * @param guessIndex the index the guess array must be greater than to render the progress bar
 * @param guesses the array of guesses the user has made
 * @returns
 */
export default function GuessProgress({
  guessIndex,
  guesses,
  color,
}: {
  guessIndex: number;
  guesses: Song[];
  color: "red" | "cyan";
}) {
  return (
    <Progress
      size="lg"
      color={color}
      value={guesses.length >= guessIndex ? 100 : 0}
      transitionDuration={200}
      flex={1}
    />
  );
}
