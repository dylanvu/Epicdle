"use client";
import { Button, Group, Text, Loader, Center } from "@mantine/core";
import { useDisclosure, UseDisclosureHandlers } from "@mantine/hooks";
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
import { PRIMARY_COLOR, WIN_COLOR, WRONG_COLOR } from "@/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { useSubmitSound } from "@/hooks/audio/useSubmitSound";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion, useAnimate } from "motion/react";
import { useGameAudio } from "@/hooks/audio/useGameAudio";
import { useWaveAnimation } from "@/hooks/useWaveAnimation";

import GameModals from "@/components/modals/GameModals";
import EpicdleTitle from "@/components/Epicdle/EpicdleTitle";
import ConfettiOverlay from "@/components/Confetti/ConfettiOverlay";

const winStates = ["win", "perfect_win"] as const;

type WinState = (typeof winStates)[number];

type GameState =
  | "initial_loading"
  | WinState
  | "lose"
  | "submit"
  | "loading"
  | "play";

/**
 * isWinState typeguard
 * @param state state to check
 * @returns is a win state
 */
function isWinState(state: string): state is WinState {
  return winStates.includes(state as WinState);
}

export default function Game() {
  const [openedHelp, helpHandler] = useDisclosure(false);
  const [openedSearchModal, searchModalHandler] = useDisclosure(false);
  const [openedWinModal, winModalHandler] = useDisclosure(false);
  const [openedLoseModal, loseModalHandler] = useDisclosure(false);
  const [gameState, setGameState] = useState<GameState>("initial_loading");

  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();

  // keep the song that was submitted (so callbacks that run later use this exact song)
  const lastSubmittedSongRef = useRef<Song | undefined>(undefined);
  const screenFlashOverlayRef = useRef<HTMLDivElement | null>(null);
  const guessesCountRef = useRef<number>(0);

  useEffect(() => {
    guessesCountRef.current = guesses.length;
  }, [guesses]);

  useEffect(() => {
    // TODO: only show this if the user has not played ever
    helpHandler.open();
    setGameState("play");
  }, []);

  // load the sounds
  const playButtonSound = useButtonSound();
  const playSubmitWinSound = useSubmitSound(handleWin);
  const playSubmitLossSound = useSubmitSound(handleLose);
  const playSubmitWrongSound = useSubmitSound(handleWrong);
  const isMobile = useIsMobile();

  // main scope + animate for container-level animations (win, shake, etc)
  const [scope, animate] = useAnimate();

  // separate animate instance used to animate individual wave elements
  const [_, animateWave] = useAnimate();

  // hook that encapsulates the wave animation behavior
  const performWaveAnimation = useWaveAnimation({
    scope,
    animateWave,
    guesses,
    maxGuesses: MAX_GUESSES,
  });

  // the available audio will always be the number of guesses made + 1 additional audio segment
  const targetSeconds = useMemo(() => {
    // let the player hear the whole song if they win, and also prevent the game from showing too much audio if they have lost
    if (guesses.length >= MAX_GUESSES || isWinState(gameState)) {
      return MAX_GUESSES * SECONDS_PER_GUESS;
    } else {
      // let the player hear the next segment
      return (guesses.length + 1) * SECONDS_PER_GUESS;
    }
  }, [guesses, gameState]);

  const {
    audioRef,
    playing,
    setPlaying,
    progress,
    setProgress,
    lastProgressRef,
    playAudioWithoutUseSound,
  } = useGameAudio(targetSeconds);

  /**
   * Generic function for opening a modal with a sound effect attached
   * @param handler
   */
  function openModalHandler(handler: UseDisclosureHandlers) {
    playButtonSound();
    handler.open();
  }

  /**
   * this function is called after the submit sound
   */
  function handleWin() {
    // play the win sound
    playAudioWithoutUseSound("/sfx/triumphant_orchestra.mp3");
    // progress the UI (record the guess)
    if (guessesCountRef.current === 0) {
      // guessed in 1 try!
      setGameState("perfect_win");
    } else {
      setGameState("win");
    }
    progressGuessUI(false, false);
    winModalHandler.open();
    // play the rest of the song!
    setPlaying(true);

    // win animation
    animate(
      scope.current,
      {
        y: [0, -20, 0], // up, then back down
        scaleY: [1, 0.9, 1], // squash slightly on landing
        scaleX: [1, 1.05, 1], // stretch slightly on landing
      },
      {
        duration: 0.5,
        ease: "easeOut",
      }
    );

    animateScreenFlash(WIN_COLOR);
  }

  function handleLose() {
    // play the lose sound
    playAudioWithoutUseSound("/sfx/thunder_loss.mp3");
    // progress the UI
    progressGuessUI();
    // progress the UI state
    setGameState("lose");
    loseModalHandler.open();
    animateIncorrectGuess();
  }

  function animateScreenFlash(
    color: string,
    intensity = 0.25,
    duration = 0.45
  ) {
    if (!screenFlashOverlayRef.current) return;

    // set color dynamically before animating
    screenFlashOverlayRef.current.style.background = color;

    animate(
      screenFlashOverlayRef.current,
      { opacity: [0, intensity, 0] },
      { duration, ease: "easeInOut" }
    );
  }

  function animateIncorrectGuess() {
    const absXShakeMax = 0.8;

    animate(
      scope.current,
      {
        x: [0, -absXShakeMax, absXShakeMax, -absXShakeMax, absXShakeMax, 0],
        y: [absXShakeMax, 0, -absXShakeMax, absXShakeMax, 0, -absXShakeMax],
      },
      { duration: 0.4, ease: "easeInOut" }
    );
    animateScreenFlash(WRONG_COLOR);
  }

  function handleWrong() {
    // play the wrong sound
    playAudioWithoutUseSound("/sfx/thunder_wrong_guess.mp3");
    // progress the UI
    progressGuessUI();
    setGameState("play");
    animateIncorrectGuess();
  }

  function handleSubmit() {
    // guard: make sure there is a selected song
    if (!selectedSong) {
      console.warn("Attempted to submit with no song selected.");
      return;
    }

    setGameState("submit");

    performWaveAnimation({
      amplitude: 20,
      duration: 1,
      stagger: 0.05,
      onlyFilled: false,
    });

    // store the submitted song in a ref so callbacks (which run after sound) use the exact submitted song
    lastSubmittedSongRef.current = selectedSong;

    // first, determine if the answer is right
    if (selectedSong.name === "Warrior of the Mind") {
      // correct
      // Note: this does not add the correct guess to the guesses array
      playSubmitWinSound();
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      // player will have used up the allowed guesses => loss
      playSubmitLossSound();
    } else {
      // wrong guess (will trigger handleWrong after submit sound finishes)
      playSubmitWrongSound();
    }
  }

  /**
   * This function progresses the UI
   * The optional flags are mostly for making the win UI work better
   * @param clearSelectedSong
   * @param addToGuesses
   * @returns
   */
  function progressGuessUI(clearSelectedSong = true, addToGuesses = true) {
    const songToAdd = lastSubmittedSongRef.current;

    if (!songToAdd) {
      console.warn(
        "No submitted song found in lastSubmittedSongRef — ignoring progress."
      );
      return;
    }

    if (addToGuesses) {
      // use functional update to avoid stale closures
      setGuesses((prev) => [...prev, songToAdd]);
    }

    // clear the selected song and reset audio
    if (clearSelectedSong) {
      lastSubmittedSongRef.current = undefined;
      setSelectedSong(undefined);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setProgress(0);
      lastProgressRef.current = 0;
    }
  }

  let endGameProgressColorOverride: string | null;
  if (isWinState(gameState)) {
    endGameProgressColorOverride = WIN_COLOR;
  } else if (gameState === "lose") {
    endGameProgressColorOverride = WRONG_COLOR;
  } else {
    endGameProgressColorOverride = null;
  }

  const gamePageStateStyle = isWinState(gameState)
    ? styles.gamePageWin
    : gameState === "lose"
    ? styles.gamePageLose
    : "";

  return (
    <>
      <div
        ref={screenFlashOverlayRef}
        className={styles.flashOverlay}
        aria-hidden="true"
        style={{
          background: WRONG_COLOR,
        }}
      />
      <motion.div ref={scope} className={styles.gamePage}>
        {gameState === "win" ? <ConfettiOverlay /> : null}
        {gameState === "perfect_win" ? (
          <ConfettiOverlay perfect={true} />
        ) : null}

        <EpicdleTitle />
        <GameModals
          openedHelp={openedHelp}
          helpHandler={helpHandler}
          openedSearchModal={openedSearchModal}
          searchModalHandler={searchModalHandler}
          openedWinModal={openedWinModal}
          winModalHandler={winModalHandler}
          openedLoseModal={openedLoseModal}
          loseModalHandler={loseModalHandler}
          setSelectedSong={setSelectedSong}
          guesses={guesses}
        />
        {gameState === "initial_loading" ? (
          <Center h={"100vh"}>
            <Loader color={PRIMARY_COLOR} />
          </Center>
        ) : (
          <div
            className={`${styles.gameplayArea} ${
              !isMobile ? gamePageStateStyle : ""
            }`}
            style={{
              borderColor: endGameProgressColorOverride ?? "",
            }}
          >
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
                  style={{ opacity: gameState !== "win" ? 0.5 : 1 }}
                  fill={true}
                />
              </div>
              <GuessHistoryOverlay guesses={guesses} />
            </div>
            <Text className={styles.songTitle}>
              {selectedSong?.name ?? "Select a song below..."}
            </Text>
            <AudioSlider
              availableGuesses={MAX_GUESSES}
              currentSongTime={progress}
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
                    endGameProgressColorOverride
                      ? endGameProgressColorOverride
                      : index === guesses.length
                      ? PRIMARY_COLOR
                      : WRONG_COLOR
                  }
                />
              ))}
            </Group>
            <div className={styles.mainButtonArea}>
              <Button
                leftSection={<IconSearch />}
                variant={!selectedSong ? "default" : "light"}
                onClick={() => openModalHandler(searchModalHandler)}
                aria-label="Search for a Song"
                disabled={gameState !== "play"}
                classNames={{
                  label: styles.gameButtonLabelSmall,
                  root: isMobile ? styles.gameButtonOrder2 : "",
                }}
                w={isMobile ? "100%" : "auto"}
              >
                Choose Song
              </Button>
              {/* TODO: load the mp3 from the backend, or download it and then put it as a blob and reference it here...? */}
              <audio ref={audioRef} src="/sample.mp3" preload="auto" />
              <PlayAudioButton playing={playing} setPlaying={setPlaying} />
              <Button
                leftSection={isMobile ? <IconArrowRight /> : null}
                rightSection={isMobile ? null : <IconArrowRight />}
                variant={selectedSong ? "filled" : "default"}
                onClick={handleSubmit}
                aria-label="Submit Song Guess"
                disabled={selectedSong === undefined || gameState !== "play"}
                classNames={{
                  label: styles.gameButtonLabelSmall,
                  root: isMobile ? styles.gameButtonOrder3 : "",
                }}
                w={isMobile ? "100%" : "auto"}
              >
                Submit Guess
              </Button>
            </div>
            {!isWinState(gameState) && gameState !== "lose" ? (
              <Button
                leftSection={<IconQuestionMark />}
                variant="default"
                onClick={() => openModalHandler(helpHandler)}
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
                  if (isWinState(gameState)) {
                    openModalHandler(winModalHandler);
                  } else if (gameState === "lose") {
                    openModalHandler(loseModalHandler);
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
        )}
      </motion.div>
    </>
  );
}
