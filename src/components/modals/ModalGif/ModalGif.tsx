"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ModalGif.module.css";
import { Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";

interface ModalGifProps {
  fileName:
    | "Boar"
    | "ThunderBringer"
    | "WarriorOfTheMind"
    | "Legend"
    | "LegendaryWin"
    | "LegendModeLoss";
  alt: string;
}

export default function ModalGif({ alt, fileName }: ModalGifProps) {
  if (fileName && (fileName.endsWith(".gif") || fileName.endsWith(".webm"))) {
    throw new Error("don't need the .gif or .webm extension for file " + fileName);
  }

  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Force muted state (critical for Safari iOS)
    video.muted = true;
    // 2. Set defaultMuted for good measure
    video.defaultMuted = true;
    
    // 3. Manually trigger play
    // We catch the error to prevent console errors if Low Power Mode blocks it
    video.play().catch((e) => {
      console.warn("Autoplay prevented:", e);
    });
  }, [fileName]); // Re-run if the fileName changes

  return (
    <>
      {isLoading && (
        <Stack justify="center" align="center">
          <Loader color={PRIMARY_COLOR} size="md" />
          <Title size={"md"}>Loading video...</Title>
        </Stack>
      )}
      <video
        ref={videoRef}
        src={`https://assets.epicdle.com/${fileName}.webm?v=2`}
        className={styles.gif}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsLoading(false)}
        aria-label={alt}
      />
    </>
  );
}