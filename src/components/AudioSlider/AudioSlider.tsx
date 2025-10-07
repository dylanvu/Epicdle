"use client";
import { Progress } from "@mantine/core";
import { PRIMARY_COLOR } from "@/theme";
import { SECONDS_PER_GUESS } from "@/constants";

export default function AudioSlider({
  availableGuesses,
  currentSongTime,
}: {
  availableGuesses: number;
  currentSongTime: number;
}) {
  return (
    <Progress
      color={PRIMARY_COLOR}
      defaultValue={0}
      value={(currentSongTime / (availableGuesses * SECONDS_PER_GUESS)) * 100}
      w="100%"
      mt="md"
      size="md"
      transitionDuration={100}
    />
  );
}
