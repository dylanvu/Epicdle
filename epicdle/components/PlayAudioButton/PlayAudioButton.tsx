"use client";
import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";
import { RefObject, useEffect } from "react";

export default function PlayAudioButton({
  audioRef,
  playing,
  setPlaying,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  function handlePlay() {
    const next = !playing;
    setPlaying(next);
    if (!audioRef.current) return;
    if (next) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }

  return (
    <>
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
    </>
  );
}
