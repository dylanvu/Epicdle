"use client";
import { Progress } from "@mantine/core";

export default function AudioSlider({
  availableGuesses,
  currentSongTime,
}: {
  availableGuesses: number;
  currentSongTime: number;
}) {
  return (
    <Progress
      color="cyan"
      defaultValue={0}
      value={(currentSongTime / availableGuesses) * 100}
      w="100%"
      mt="md"
      size="md"
    />
  );
}
