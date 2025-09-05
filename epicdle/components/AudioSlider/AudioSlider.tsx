"use client";
import { Progress } from "@mantine/core";
import { Song } from "../../interfaces/interfaces";

export default function AudioSlider({
  availableGuesses,
  guesses,
}: {
  availableGuesses: number;
  guesses: Song[];
}) {
  return (
    <Progress
      color="cyan"
      defaultValue={0}
      // FIXME: this should be tied to the audio snippet progress
      value={((guesses.length + 1) / availableGuesses) * 100}
      w="100%"
      mt="md"
      size="md"
      transitionDuration={100}
    />
  );
}
