"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { GameState, Song } from "@/interfaces/interfaces";
import { ALBUM_NAME_TO_COVER_MAP } from "@/constants";
import styles from "./GameAlbumArea.module.css";
import Image from "next/image";
import GuessHistoryOverlay from "@/components/GuessHistoryOverlay/GuessHistoryOverlay";

interface GameAlbumAreaProps {
  gameState: GameState;
  selectedSong: Song | undefined;
  guesses: Song[];
  gamePageStateStyle: string;
  endGameProgressColorOverride: string | null;
}
export default function GameAlbumArea({
  gameState,
  selectedSong,
  guesses,
  gamePageStateStyle,
  endGameProgressColorOverride,
}: GameAlbumAreaProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`${styles.albumCoverArea} ${
        isMobile ? gamePageStateStyle : ""
      }`}
      style={{
        borderColor: endGameProgressColorOverride ?? "",
      }}
    >
      <div className={styles.albumCover}>
        <Image
          src={
            selectedSong?.album
              ? ALBUM_NAME_TO_COVER_MAP[selectedSong.album]
              : "/Epic_The_Musical_Album_Cover.webp"
          }
          alt="Epicdle"
          style={{ opacity: gameState === "perfect_win" ? 1 : 0.5 }}
          fill={true}
          priority
          unoptimized
        />
      </div>
      <GuessHistoryOverlay guesses={guesses} />
    </div>
  );
}
