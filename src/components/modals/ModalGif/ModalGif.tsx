"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ModalGif.module.css";
import { Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";

interface ModalGifProps {
  /**
   * name of the file, you do not need the .gif extension in the name
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
  if (fileName && fileName.endsWith(".gif")) {
    throw new Error("don't need the .gif extension for file" + fileName);
  }
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {isLoading && (
        <Stack justify="center" align="center">
          <Loader color={PRIMARY_COLOR} size="md" />
          <Title size={"md"}>Loading GIF...</Title>
        </Stack>
      )}
      <Image
        // src={endpoint}
        src={`https://assets.epicdle.com/${fileName}.gif`}
        alt={alt}
        width={0}
        height={0}
        className={styles.gif}
        priority
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}
