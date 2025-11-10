"use client";

import PlayAudioButton from "@/components/ActionButton/PlayAudioButton";
import { PRIMARY_COLOR } from "@/config/theme";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileSearchButton from "@/components/ActionButton/MobileSearchButton";
import MobileSubmitButton from "@/components/ActionButton/MobileSubmitButton";
import { GameState, Song } from "@/interfaces/interfaces";
import { UseDisclosureHandlers } from "@mantine/hooks";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import styles from "./GameControl.module.css";

interface GameControlsProps {
  openModalHandler: (handler: UseDisclosureHandlers) => void;
  searchModalHandler: UseDisclosureHandlers;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioUrl: string | null;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSong: Song | undefined;
  gameState: GameState;
  handleSubmit: () => void;
}

export default function GameControls({
  gameState,
  openModalHandler,
  searchModalHandler,
  audioRef,
  audioUrl,
  playing,
  setPlaying,
  selectedSong,
  handleSubmit,
}: GameControlsProps) {
  const isMobile = useIsMobile();
  return (
    <div className={styles.mainButtonArea}>
      {isMobile ? (
        <MobileSearchButton
          onClick={() => openModalHandler(searchModalHandler)}
          disabled={gameState !== "play"}
        />
      ) : (
        <Button
          leftSection={<IconSearch />}
          variant="default"
          onClick={() => openModalHandler(searchModalHandler)}
          aria-label="Search for a Song"
          disabled={gameState !== "play"}
          classNames={{
            label: styles.gameButtonLabelSmall,
          }}
          color={PRIMARY_COLOR}
          w={"auto"}
        >
          Choose Song
        </Button>
      )}

      <audio ref={audioRef} src={audioUrl ?? "/sample.mp3"} preload="auto" />
      <PlayAudioButton playing={playing} setPlaying={setPlaying} />
      {isMobile ? (
        <MobileSubmitButton
          onClick={handleSubmit}
          disabled={selectedSong === undefined || gameState !== "play"}
        />
      ) : (
        <Button
          leftSection={<IconArrowRight />}
          variant={selectedSong ? "filled" : "default"}
          onClick={handleSubmit}
          aria-label="Submit Song Guess"
          disabled={selectedSong === undefined || gameState !== "play"}
          classNames={{
            label: styles.gameButtonLabelSmall,
          }}
          color={PRIMARY_COLOR}
          w={"auto"}
        >
          Submit Guess
        </Button>
      )}
    </div>
  );
}
