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
  IconChartBarPopular,
} from "@tabler/icons-react";

import { Song } from "@/interfaces/interfaces";
import GuessProgress from "@/components/GuessProgress/GuessProgress";
import AudioSlider from "@/components/AudioSlider/AudioSlider";

import {
  MAX_GUESSES,
  SECONDS_PER_GUESS,
  ALBUM_NAME_TO_COVER_MAP,
} from "@/constants";
import GuessHistoryOverlay from "@/components/GuessHistoryOverlay/GuessHistoryOverlay";
import PlayAudioButton from "@/components/PlayAudioButton/PlayAudioButton";
import TutorialModal from "@/components/TutorialModal/TutorialModal";
import SongListModal from "@/components/SongListModal/SongListModal";
import { PRIMARY_COLOR } from "@/theme";
import WinModal from "@/components/WinModal/WinModal";
import LoseModal from "@/components/LoseModal/LoseModal";
import { useButtonSound } from "@/audio/playButtonSound";
import { useSubmitSound } from "@/audio/playSubmitSound";

export default function Game() {
  const [openedHelp, helpHandler] = useDisclosure(false);
  const [openedSearchModal, searchModalHandler] = useDisclosure(false);
  const [openedWinModal, winModalHandler] = useDisclosure(false);
  const [openedLoseModal, loseModalHandler] = useDisclosure(false);
  const [gameState, setGameState] = useState<
    "win" | "lose" | "submit" | "loading" | "play"
  >("play");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();

  // keep the song that was submitted (so callbacks that run later use this exact song)
  const lastSubmittedSongRef = useRef<Song | undefined>(undefined);

  const rafRef = useRef<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    // TODO: only show this if the user has not played ever
    helpHandler.open();
  }, []);

  // load the sounds
  const playButtonSound = useButtonSound();
  const playSubmitWinSound = useSubmitSound(handleWin);
  const playSubmitLossSound = useSubmitSound(handleLose);
  const playSubmitWrongSound = useSubmitSound(handleWrong);

  // the available audio will always be the number of guesses made + 1 second
  const targetSeconds = useMemo(() => {
    if (guesses.length >= MAX_GUESSES) {
      return MAX_GUESSES * SECONDS_PER_GUESS;
    } else {
      return (guesses.length + 1) * SECONDS_PER_GUESS;
    }
  }, [guesses]);

  // when playingAudio is toggled, start/stop the audio
  useEffect(() => {
    const audioElement = audioRef.current;

    if (playingAudio) {
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
            setPlayingAudio(false);
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
  }, [playingAudio, targetSeconds]);

  function handleSongSearch() {
    playButtonSound();
    // open up the guessing modal
    searchModalHandler.open();
  }

  /**
   * this function is called after the submit sound
   */
  function handleWin() {
    // play the win sound
    playAudioWithoutUseSound("/sfx/triumphant_orchestra.mp3");
    // progress the UI (record the guess)
    progressGuessUI();
    setGameState("win");
    winModalHandler.open();
    // TODO: trigger win visual effect
  }

  function handleLose() {
    // play the lose sound
    playAudioWithoutUseSound("/sfx/thunder_loss.mp3");
    // progress the UI
    progressGuessUI();
    // progress the UI state
    setGameState("lose");
    loseModalHandler.open();
    // TODO: trigger the lose visual effect
  }

  function handleWrong() {
    // play the wrong sound
    // TODO: this is not working
    playAudioWithoutUseSound("/sfx/thunder_wrong_guess.mp3");
    // progress the UI
    progressGuessUI();
    setGameState("play");
    // TODO: trigger the wrong guess visual effect
  }

  function handleSubmit() {
    // guard: make sure there is a selected song
    if (!selectedSong) {
      console.warn("Attempted to submit with no song selected.");
      return;
    }

    setGameState("submit");
    // TODO: trigger submit visual effect

    // store the submitted song in a ref so callbacks (which run after sound) use the exact submitted song
    lastSubmittedSongRef.current = selectedSong;

    // first, determine if the answer is right
    if (selectedSong.name === "Warrior of the Mind") {
      // correct
      playSubmitWinSound();
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      // player will have used up the allowed guesses => loss
      playSubmitLossSound();
    } else {
      // wrong guess (will trigger handleWrong after submit sound finishes)
      playSubmitWrongSound();
    }
  }

  function progressGuessUI() {
    const songToAdd = lastSubmittedSongRef.current;

    if (!songToAdd) {
      console.warn(
        "No submitted song found in lastSubmittedSongRef — ignoring progress."
      );
      return;
    }

    // use functional update to avoid stale closures
    setGuesses((prev) => [...prev, songToAdd]);

    // clear the selected song and reset audio
    lastSubmittedSongRef.current = undefined;
    setSelectedSong(undefined);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setAudioProgress(0);
    lastProgressRef.current = 0;
  }

  async function playAudioWithoutUseSound(audioPath: string) {
    // TODO: honestly can I just refactor the whole app to not use useSound?
    try {
      await new Audio(audioPath).play();
    } catch (e) {
      console.error("native Audio failed:", e);
    }
  }

  let progressColorOverride: string | undefined;
  if (gameState === "win") {
    progressColorOverride = "green";
  } else if (gameState === "lose") {
    progressColorOverride = "red";
  } else {
    progressColorOverride = undefined;
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
              color={
                progressColorOverride
                  ? progressColorOverride
                  : index === guesses.length
                  ? PRIMARY_COLOR
                  : "red"
              }
            />
          ))}
        </Group>
        <div className={styles.buttonArea}>
          <Button
            leftSection={<IconSearch />}
            variant="default"
            onClick={handleSongSearch}
            aria-label="Search for a Song"
            disabled={gameState !== "play"}
          >
            Select Song
          </Button>
          {/* TODO: load the mp3 from the backend, or download it and then put it as a blob and reference it here...? */}
          <audio ref={audioRef} src="/sample.mp3" preload="auto" />
          <PlayAudioButton
            playing={playingAudio}
            setPlaying={setPlayingAudio}
          />
          <Button
            rightSection={<IconArrowRight />}
            variant="default"
            onClick={handleSubmit}
            aria-label="Submit Song Guess"
            disabled={selectedSong === undefined || gameState !== "play"}
          >
            Submit Guess
          </Button>
        </div>
        {gameState !== "win" && gameState !== "lose" ? (
          <Button
            leftSection={<IconQuestionMark />}
            variant="default"
            onClick={() => {
              playButtonSound();
              helpHandler.open();
            }}
            aria-label="How to Play"
            w="100%"
            mt="md"
            disabled={gameState !== "play"}
          >
            How to Play
          </Button>
        ) : (
          <Button
            leftSection={<IconChartBarPopular />}
            variant="default"
            onClick={() => {
              playButtonSound();
              if (gameState === "win") {
                winModalHandler.open();
              } else if (gameState === "lose") {
                loseModalHandler.open();
              }
            }}
            aria-label="View Today's Results"
            w="100%"
            mt="md"
          >
            View Today's Results
          </Button>
        )}
      </div>
    </div>
  );
}
