"use client";
import { Button, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Game.module.css";
import Image from "next/image";
import {
  IconArrowRight,
  IconSearch,
  IconQuestionMark,
} from "@tabler/icons-react";
import { Song } from "../../interfaces/interfaces";
import GuessProgress from "../../components/GuessProgress/GuessProgress";
import AudioSlider from "../../components/AudioSlider/AudioSlider";

import { MAX_GUESSES, ALBUM_NAME_TO_COVER_MAP } from "../../constants";
import GuessHistoryOverlay from "../../components/GuessHistoryOverlay/GuessHistoryOverlay";
import PlayAudioButton from "../../components/PlayAudioButton/PlayAudioButton";
import TutorialModal from "../../components/TutorialModal/TutorialModal";
import SongListModal from "../../components/SongListModal/SongListModal";
import { PRIMARY_COLOR } from "../../theme";
import WinModal from "../../components/WinModal/WinModal";
import LoseModal from "../../components/LoseModal/LoseModal";

export default function Game() {
  const [openedHelp, helpHandler] = useDisclosure(false);
  const [openedSearchModal, searchModalHandler] = useDisclosure(false);
  const [openedWinModal, winModalHandler] = useDisclosure(false);
  const [openedLoseModal, loseModalHandler] = useDisclosure(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();

  const rafRef = useRef<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    // TODO: only show this if the user has not played ever
    helpHandler.open();
  }, []);

  // the available audio will always be the number of guesses made + 1 second

  const targetSeconds = useMemo(() => {
    return guesses.length + 1;
  }, [guesses]);

  // when playing is toggled, start/stop the audio
  useEffect(() => {
    const audioElement = audioRef.current;

    if (playing) {
      // if we hit the target seconds, go back to the start
      if (audioElement && audioElement?.currentTime >= targetSeconds) {
        audioElement.currentTime = 0;
        setAudioProgress(0);
        lastProgressRef.current = 0;
      }

      // start the audio
      audioElement?.play();

      // use RAF to monitor the audio time
      const loop = () => {
        // cancel the animation frame, let's process the current frame first
        cancelAnimationFrame(rafRef.current!);
        if (audioElement) {
          if (audioElement.currentTime >= targetSeconds) {
            // snap the audio back to the targetSeconds
            audioElement.currentTime = targetSeconds;
            // stop the audio
            setPlaying(false);
          } else {
            // perform a throttled update
            if (audioElement) {
              if (audioElement.currentTime - lastProgressRef.current >= 0.05) {
                setAudioProgress(audioElement.currentTime);
                lastProgressRef.current = audioElement.currentTime;
              }
            }
            rafRef.current = requestAnimationFrame(loop);
          }
        }
      };

      rafRef.current = requestAnimationFrame(loop);
    } else {
      // the user has pressed pause, so pause the audio
      audioElement?.pause();
      // stop any animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      // update the audio time to the current time
      if (audioElement) {
        setAudioProgress(audioElement.currentTime);
        lastProgressRef.current = audioElement.currentTime;
      }
    }

    return () => {
      // cleanup
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [playing]);

  function handleSongSearch() {
    // open up the guessing modal
    searchModalHandler.open();
  }

  function handleSubmit() {
    let newGuesses = [...guesses, selectedSong!];

    setGuesses(newGuesses);
    setSelectedSong(undefined);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setAudioProgress(0);
    lastProgressRef.current = 0;

    // TODO: make this a real function
    if (selectedSong?.name === "Warrior of the Mind") {
      winModalHandler.open();
      return;
    }
    if (newGuesses.length > MAX_GUESSES - 1) {
      loseModalHandler.open();
    }
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
      <WinModal
        openState={openedWinModal}
        modalHandler={winModalHandler}
        guessesUsed={guesses.length}
      />
      <LoseModal openState={openedLoseModal} modalHandler={loseModalHandler} />
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
        <AudioSlider
          availableGuesses={MAX_GUESSES}
          currentSongTime={audioProgress}
        />
        <Group grow wrap="nowrap" gap={5} w="100%" mt="md" mb="md">
          {/* // Generate a Progress Bar segment for each possible guess */}
          {[...Array(MAX_GUESSES)].map((_, index) => (
            // change the color to be red for past guesses and cyan for the current guess
            <GuessProgress
              key={`guess-progress-${index}`}
              guessIndex={index}
              guessesCount={guesses.length}
              color={index === guesses.length ? PRIMARY_COLOR : "red"}
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
          {/* TODO: load the mp3 from the backend, or download it and then put it as a blob and reference it here...? */}
          <audio ref={audioRef} src="/sample.mp3" preload="auto" />
          <PlayAudioButton playing={playing} setPlaying={setPlaying} />
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
