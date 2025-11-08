"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ModalGif.module.css";
import { Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";

interface ModalGifProps {
  alt: string;
  endpoint: string; // api endpoint to get the gif, e.g. "/api/assets/boar"
}

export default function ModalGif({ alt, endpoint }: ModalGifProps) {
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
        src={endpoint}
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
