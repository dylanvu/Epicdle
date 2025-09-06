import { Progress } from "@mantine/core";
import { Song } from "../../interfaces/interfaces";
import React from "react";

/**
 *
 * @param guessIndex the index the guess array must be greater than to render the progress bar
 * @param guessesCount the array of guesses the user has made
 * @returns
 */
function GuessProgress({
  guessIndex,
  guessesCount,
  color,
}: {
  guessIndex: number;
  guessesCount: number;
  color: "red" | "cyan";
}) {
  return (
    <Progress
      size="lg"
      color={color}
      value={guessesCount >= guessIndex ? 100 : 0}
      transitionDuration={200}
      flex={1}
    />
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(GuessProgress);
