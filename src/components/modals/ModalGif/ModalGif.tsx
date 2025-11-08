"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ModalGif.module.css";
import { Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";
import { getGifAsset } from "@/app/services/gameService";

interface ModalGifProps {
  alt: string;
  endpoint: string; // api endpoint to get the gif, e.g. "/api/assets/boar"
}

export default function ModalGif({ alt, endpoint }: ModalGifProps) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    getGifAsset(endpoint).then((blob) => {
      if (blob) {
        const gifUrl = URL.createObjectURL(blob);
        setGifUrl(gifUrl);
      }
    });
  }, [endpoint]);

  if (!gifUrl)
    return (
      <Stack justify="center" align="center">
        <Loader color={PRIMARY_COLOR} size="md" />
        <Title size={"md"}>Loading GIF...</Title>
      </Stack>
    );

  return (
    <Image
      src={gifUrl}
      alt={alt}
      width={0}
      height={0}
      className={styles.gif}
      priority
    />
  );
}
