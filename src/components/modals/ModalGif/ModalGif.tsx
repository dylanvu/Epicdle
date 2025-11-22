"use client";

import { useState } from "react";
import styles from "./ModalGif.module.css";
import { Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";

interface ModalGifProps {
  /**
   * name of the file, you do not need the .webm extension in the name
   * example: "Boar"
   */
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
  // validate the fileName
  if (fileName && (fileName.endsWith(".gif") || fileName.endsWith(".webm"))) {
    throw new Error("don't need the .gif or .webm extension for file" + fileName);
  }
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <Stack justify="center" align="center">
          <Loader color={PRIMARY_COLOR} size="md" />
          <Title size={"md"}>Loading video...</Title>
        </Stack>
      )}
      <video
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
