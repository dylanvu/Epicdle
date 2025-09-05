"use client";
import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";
import { useState } from "react";

export default function PlayAudioButton() {
  function handlePlay() {
    console.log("Playing the song");
    setPlaying(!playing);
  }

  const [playing, setPlaying] = useState(false);

  return (
    <ActionIcon
      variant="filled"
      aria-label="Play"
      size={56}
      radius="lg"
      onClick={handlePlay}
    >
      {playing ? (
        <IconPlayerPauseFilled
          style={{ width: "70%", height: "70%" }}
          stroke={1.5}
        />
      ) : (
        <IconPlayerPlayFilled
          style={{ width: "70%", height: "70%" }}
          stroke={1.5}
        />
      )}
    </ActionIcon>
  );
}
