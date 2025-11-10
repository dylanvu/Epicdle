import { MAX_GUESSES } from "@/constants";
import { Group } from "@mantine/core";
import GuessProgressSection from "@/components/GuessProgress/GuessProgressSection/GuessProgressSection";
import { Song } from "@/interfaces/interfaces";
import { PRIMARY_COLOR, WRONG_COLOR } from "@/config/theme";

interface GuessProgressProps {
  guesses: Song[];
  endGameProgressColorOverride: string | null;
}

export function GuessProgress({
  guesses,
  endGameProgressColorOverride,
}: GuessProgressProps) {
  return (
    <Group grow wrap="nowrap" gap={5} w="100%" mt="md" mb="md">
      {/* // Generate a Progress Bar segment for each possible guess */}
      {[...Array(MAX_GUESSES)].map((_, index) => (
        // change the color to be red for past guesses and cyan for the current guess
        <GuessProgressSection
          key={`guess-progress-${index}`}
          guessIndex={index}
          guessesCount={guesses.length}
          color={
            endGameProgressColorOverride
              ? endGameProgressColorOverride
              : index === guesses.length
              ? PRIMARY_COLOR
              : WRONG_COLOR
          }
        />
      ))}
    </Group>
  );
}
