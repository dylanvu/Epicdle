"use client";
import { Button, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();
  const [currentSongTime, setCurrentSongTime] = useState(0);

  useEffect(() => {
    // TODO: only show this if the user has not played ever
    helpHandler.open();
  }, []);

  function resetAudio() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setCurrentSongTime(0);
  }

  // the available audio will always be the number of guesses made + 1 second
  const targetSeconds = guesses.length + 1;

  // RAF loop effect: start/stop based on `playing` and keep an eye on targetSeconds
  useEffect(() => {
    const a = audioRef.current;
    if (!a) {
      return;
    }

    // If not playing, ensure RAF is cancelled
    if (!playing) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // If we are playing, start the RAF loop
    const loop = () => {
      const now = a.currentTime;

      // If we've reached or passed the target time, stop and snap
      if (now >= targetSeconds) {
        // cancel further RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        try {
          a.pause();
        } catch (e) {
          // ignore pause errors
        }
        setPlaying(false);

        try {
          a.currentTime = targetSeconds;
          setCurrentSongTime(a.currentTime);
        } catch (e) {
          // some browsers may throw if setting currentTime too quickly; ignore
        }

        return;
      } else {
        setCurrentSongTime(now);
      }

      // continue the loop
      rafRef.current = requestAnimationFrame(loop);
    };

    // Start the RAF loop
    // if the audio is already at the target, reset it
    if (a.currentTime >= targetSeconds) {
      resetAudio();
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing, targetSeconds]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    function onEnded() {
      setPlaying(false);
      setCurrentSongTime(a!.currentTime);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

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
    resetAudio();
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
        <AudioSlider
          availableGuesses={MAX_GUESSES}
          currentSongTime={currentSongTime}
        />
        <Group grow wrap="nowrap" gap={5} w="100%" mt="md" mb="md">
          {/* // Generate a Progress Bar segment for each possible guess */}
          {[...Array(MAX_GUESSES)].map((_, index) => (
            // change the color to be red for past guesses and cyan for the current guess
            <GuessProgress
              key={`guess-progress-${index}`}
              guessIndex={index}
              guessesCount={guesses.length}
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
          {/* TODO: load the mp3 from the backend, or download it and then put it as a blob and reference it here...? */}
          <audio ref={audioRef} src="/sample.mp3" preload="auto" />
          <PlayAudioButton
            audioRef={audioRef}
            playing={playing}
            setPlaying={setPlaying}
          />
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
