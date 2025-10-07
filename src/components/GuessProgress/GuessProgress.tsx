import { Progress } from "@mantine/core";
import React from "react";
import { AnimationScope } from "motion";

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
  color: string;
}) {
  return (
    <div
      data-guess-index={guessIndex}
      style={{
        // pivot at the bottom so "jumping" animation looks natural
        transformOrigin: "center bottom",
        willChange: "transform",
        display: "flex",
        flex: 1,
      }}
    >
      <Progress
        size="lg"
        color={color}
        value={guessesCount >= guessIndex ? 100 : 0}
        transitionDuration={200}
        flex={1}
      />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(GuessProgress);
