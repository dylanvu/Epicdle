"use client";
import { Button, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import styles from "./Game.module.css";
import Image from "next/image";
import {
  IconArrowRight,
  IconSearch,
  IconQuestionMark,
} from "@tabler/icons-react";
import { Song } from "../../../interfaces/interfaces";
import GuessProgress from "../../../components/GuessProgress/GuessProgress";
import AudioSlider from "../../../components/AudioSlider/AudioSlider";

import { MAX_GUESSES, ALBUM_NAME_TO_COVER_MAP } from "../../../constants";
import GuessHistoryOverlay from "../../../components/GuessHistoryOverlay/GuessHistoryOverlay";
import PlayAudioButton from "../../../components/PlayAudioButton/PlayAudioButton";
import TutorialModal from "../../../components/TutorialModal/TutorialModal";
import SongListModal from "../../../components/SongListModal/SongListModal";

export default function Game() {
  const [openedHelp, helpHandler] = useDisclosure(false);
  const [openedSearchModal, searchModalHandler] = useDisclosure(false);

  useEffect(() => {
    // TODO: only show this if the user has not played yet
    helpHandler.open();
  }, []);

  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();

  function handleSongSearch() {
    // open up the guessing modal
    searchModalHandler.open();
  }

  function handleSubmit() {
    let newGuesses = [...guesses, selectedSong!];
    console.log(newGuesses);
    if (newGuesses.length > MAX_GUESSES - 1) {
      newGuesses = [];
    }
    setGuesses(newGuesses);
    setSelectedSong(undefined);
  }

  return (
    <div className={styles.gamePage}>
      <TutorialModal openState={openedHelp} modalHandler={helpHandler} />
      <SongListModal
        openState={openedSearchModal}
        modalHandler={searchModalHandler}
        setSelectedSong={setSelectedSong}
        guesses={guesses}
      />
      <div className={styles.gameplayArea}>
        <div className={styles.albumCover}>
          <Image
            src={
              selectedSong?.album
                ? ALBUM_NAME_TO_COVER_MAP[selectedSong.album]
                : "/Epic_The_Musical_Album_Cover.webp"
            }
            alt="Epicdle"
            // TODO: fix the sizing of all images
            width={400}
            height={400}
          />
          <GuessHistoryOverlay guesses={guesses} />
        </div>
        <Text className={styles.songTitle}>
          {selectedSong?.name ?? "Select a song below..."}
        </Text>
        <AudioSlider availableGuesses={MAX_GUESSES} guesses={guesses} />
        <Group grow wrap="nowrap" gap={5} w="100%" mt="md" mb="md">
          {/* // Generate a Progress Bar segment for each possible guess */}
          {[...Array(MAX_GUESSES)].map((_, index) => (
            // change the color to be red for past guesses and cyan for the current guess
            <GuessProgress
              key={`guess-progress-${index}`}
              guessIndex={index}
              guesses={guesses}
              color={index === guesses.length ? "cyan" : "red"}
            />
          ))}
        </Group>
        <div className={styles.buttonArea}>
          <Button
            leftSection={<IconSearch />}
            variant="default"
            onClick={handleSongSearch}
            aria-label="Search for a Song"
          >
            Select Song
          </Button>
          <PlayAudioButton />
          <Button
            rightSection={<IconArrowRight />}
            variant="default"
            onClick={handleSubmit}
            aria-label="Submit Song Guess"
            disabled={selectedSong === undefined}
          >
            Submit Guess
          </Button>
        </div>
        <Button
          leftSection={<IconQuestionMark />}
          variant="default"
          onClick={helpHandler.open}
          aria-label="How to Play"
          w="100%"
          mt="md"
        >
          How to Play
        </Button>
      </div>
    </div>
  );
}
