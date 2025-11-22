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
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Safari requires 'defaultMuted' to be set via JS to allow autoplay
    // BEFORE the video attempts to load/play.
    video.defaultMuted = true;
    video.muted = true;
    
    // Note: We removed the manual video.play() from here. 
    // We will handle it in the onCanPlay event to prevent Promise race conditions.

  }, [fileName]);

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt to play only when the browser confirms the media is ready
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay started!
        })
        .catch((error) => {
          console.warn("Autoplay prevented:", error);
          // Auto-play was prevented. 
          // We don't force it here; the controls are enabled so the user can click.
        });
    }
  };

  return (
    <>
      {isLoading && (
        <Stack justify="center" align="center">
          <Loader color={PRIMARY_COLOR} size="md" />
          <Title size={"md"}>Loading video...</Title>
        </Stack>
      )}
      <video
        // IMPORTANT: The key forces React to destroy and recreate the DOM element 
        // when fileName changes. This prevents "stuck" video states.
        key={fileName} 
        ref={videoRef}
        src={`https://assets.epicdle.com/${fileName}.webm?v=2`}
        className={styles.gif}
        // Standard HTML attributes
        autoPlay
        loop
        muted
        playsInline
        controls={false} // Ensure controls don't conflict with your UI
        // Events
        onLoadedData={() => setIsLoading(false)}
        onCanPlay={handleCanPlay} // Trigger play here, not in useEffect
        aria-label={alt}
      />
    </>
  );
}