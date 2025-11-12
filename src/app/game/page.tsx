"use client";
import { Button, Text } from "@mantine/core";
import { useDisclosure, UseDisclosureHandlers } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import {
  IconQuestionMark,
  IconChartBarPopular,
  IconInfoCircle,
} from "@tabler/icons-react";

import {
  Song,
  isWinState,
  GameState,
  IVolumeObject,
  HttpError,
  ICheckAnswerResult,
  IYouTubeVideo,
} from "@/interfaces/interfaces";
import AudioSlider from "@/components/AudioSlider/AudioSlider";

import { MAX_GUESSES } from "@/constants";
import { WIN_COLOR, WRONG_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { useSubmitSound } from "@/hooks/audio/useSubmitSound";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import {
  useGameAudio,
  playAudioWithoutUseSound,
} from "@/hooks/audio/useGameAudio";
import { useWaveAnimation } from "@/hooks/animation/useWaveAnimation";

import GameModals from "@/components/modals/GameModals";
import EpicdleTitle from "@/components/Text/Epicdle/EpicdleTitle";
import ConfettiOverlay from "@/components/Confetti/ConfettiOverlay";
import VolumeSlider from "@/components/VolumeSlider/VolumeSlider";
import PerfectText from "@/components/Text/PerfectTextOverlay/PerfectTextOverlay";
import { checkAnswer } from "@/app/services/gameService";
import GameControls from "@/components/GameControls/GameControls";

import { useFirebaseAnalytics } from "@/contexts/firebaseContext";
import { usePathname } from "next/navigation";
import { GameLoading } from "@/components/GameLoading/GameLoading";
import GameAlbumArea from "@/components/GameAlbumArea/GameAlbumArea";
import { GuessProgress } from "@/components/GuessProgress/GuessProgress";
import useDailySnippet from "@/hooks/gameLogic/useDailySnippet";
import { createErrorNotification } from "@/components/Notifications/ErrorNotification";

const WIN_LOSS_TIMEOUT = 800;

export default function Game() {
  const [showGame, setShowGame] = useState(false);
  const [openedHelp, helpHandler] = useDisclosure(false);
  const [openedSearchModal, searchModalHandler] = useDisclosure(false);
  const [openedWinModal, winModalHandler] = useDisclosure(false);
  const [openedLoseModal, loseModalHandler] = useDisclosure(false);
  const [openedDisclaimerModal, disclaimerModalHandler] = useDisclosure(false);
  const [gameState, setGameState] = useState<GameState>("initial_loading");
  const [showPerfectText, setShowPerfectText] = useState(false);
  const [YouTubeVideo, setYouTubeVideo] = useState<IYouTubeVideo | null>(null);

  const [volumeObject, setVolumeObject] = useState<IVolumeObject>({
    volume: 100,
    muted: false,
  });

  const [guesses, setGuesses] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song>();

  // keep the song that was submitted (so callbacks that run later use this exact song)
  const lastSubmittedSongRef = useRef<Song | undefined>(undefined);
  const screenFlashOverlayRef = useRef<HTMLDivElement | null>(null);
  const guessesCountRef = useRef<number>(0);

  const { logEvent } = useFirebaseAnalytics();
  const pathname = usePathname();

  const { audioUrl } = useDailySnippet({ setGameState });

  useEffect(() => {
    guessesCountRef.current = guesses.length;
  }, [guesses]);

  useEffect(() => {
    logEvent("page_view", {
      page_path: pathname,
    });

    // load volume from localStorage
    const volume = localStorage.getItem("volume");
    if (volume) {
      setVolumeObject(JSON.parse(volume));
    }
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

  useEffect(() => {
    if (isWinState(gameState)) {
      let win_timeout = WIN_LOSS_TIMEOUT;
      if (gameState === "perfect_win") {
        win_timeout = win_timeout * 2;
        setTimeout(() => {
          setShowPerfectText(true);
        }, WIN_LOSS_TIMEOUT);
      }
      // small timeout to bask in the glory
      setTimeout(() => {
        winModalHandler.open();
      }, win_timeout);

      logEvent(gameState);
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

    if (gameState === "lose") {
      logEvent(gameState);
      // small timeout to bask in shame
      setTimeout(() => {
        loseModalHandler.open();
      }, WIN_LOSS_TIMEOUT);
      animateIncorrectGuess();
    }
  }, [gameState]);

  const {
    audioRef,
    playing,
    setPlaying,
    progress,
    setProgress,
    lastProgressRef,
  } = useGameAudio(guesses, gameState, volumeObject);

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
  }

  function handleLose() {
    // play the lose sound
    playAudioWithoutUseSound("/sfx/thunder_loss.mp3");
    // progress the UI
    progressGuessUI();
    // progress the UI state
    setGameState("lose");
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

  async function handleSubmit() {
    // guard: make sure there is a selected song
    if (!selectedSong) {
      // this shouldn't happen generally... since the button should be disabled if there is no song selected
      console.warn("Attempted to submit with no song selected.");
      return;
    }

    setGameState("submit");
    logEvent("submit_guess");

    performWaveAnimation({
      amplitude: 20,
      duration: 1,
      stagger: 0.05,
      onlyFilled: false,
    });

    let isCorrect: boolean = false;
    let checkAnswerResult: ICheckAnswerResult | null = null;
    try {
      checkAnswerResult = await checkAnswer(selectedSong.name);
      isCorrect = checkAnswerResult.correct;
    } catch (err) {
      console.error("Error checking answer:", err);
      if (err instanceof HttpError) {
        createErrorNotification(err);
      }
      return;
    }

    // store the submitted song in a ref so callbacks (which run after sound) use the exact submitted song
    lastSubmittedSongRef.current = selectedSong;

    // first, determine if the answer is right
    if (isCorrect) {
      // correct
      // Note: this does not add the correct guess to the guesses array
      playSubmitWinSound();
      setYouTubeVideo({
        url: selectedSong.url,
        startTimeStamp: checkAnswerResult.startTimeStamp,
        endTimeStamp: checkAnswerResult.endTimeStamp,
      });
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      // player will have used up the allowed guesses => loss
      playSubmitLossSound();
    } else {
      // wrong guess (will trigger handleWrong after submit sound finishes)
      logEvent("wrong_guess");
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
    <AnimatePresence
      onExitComplete={() => {
        setShowGame(true);
      }}
    >
      {gameState === "initial_loading" ? <GameLoading /> : null}

      {showGame ? (
        <motion.div
          key="game-page"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45 }}
          onAnimationComplete={() => {
            // TODO: only show this if the user has not played today
            helpHandler.open();
          }}
        >
          <div
            ref={screenFlashOverlayRef}
            className={styles.flashOverlay}
            aria-hidden="true"
            style={{
              background: WRONG_COLOR,
            }}
          />
          <PerfectText
            show={showPerfectText}
            text={selectedSong?.perfect_win_text ?? "Legendary"}
          />
          <div className={styles.gamePage}>
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
              openedDisclaimerModal={openedDisclaimerModal}
              disclaimerModalHandler={disclaimerModalHandler}
              setSelectedSong={setSelectedSong}
              guesses={guesses}
              YouTubeVideo={YouTubeVideo}
            />

            <motion.div
              ref={scope}
              className={`${styles.gameplayArea} ${
                !isMobile ? gamePageStateStyle : ""
              }`}
              style={{
                borderColor: endGameProgressColorOverride ?? "",
              }}
            >
              <GameAlbumArea
                gameState={gameState}
                selectedSong={selectedSong}
                guesses={guesses}
                gamePageStateStyle={gamePageStateStyle}
                endGameProgressColorOverride={endGameProgressColorOverride}
              />
              <Text className={styles.songTitle} mt="xs">
                {selectedSong?.name ?? "Choose a song to guess"}
              </Text>
              <AudioSlider
                availableGuesses={MAX_GUESSES}
                currentSongTime={progress}
              />
              <GuessProgress
                guesses={guesses}
                endGameProgressColorOverride={endGameProgressColorOverride}
              />
              <VolumeSlider
                volumeObject={volumeObject}
                setVolumeObject={setVolumeObject}
              />

              <GameControls
                openModalHandler={openModalHandler}
                searchModalHandler={searchModalHandler}
                audioRef={audioRef}
                audioUrl={audioUrl}
                playing={playing}
                setPlaying={setPlaying}
                selectedSong={selectedSong}
                gameState={gameState}
                handleSubmit={handleSubmit}
              />

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
              <Button
                leftSection={<IconInfoCircle />}
                variant="default"
                onClick={() => openModalHandler(disclaimerModalHandler)}
                aria-label="Credits & Disclaimer"
                w="100%"
                mt="md"
              >
                Credits & Disclaimer
              </Button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
