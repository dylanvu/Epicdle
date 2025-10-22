import { MAX_GUESSES, SECONDS_PER_GUESS } from "@/constants";
import { GameState, isWinState, Song } from "@/interfaces/interfaces";
import { useState, useRef, useEffect, useMemo } from "react";

export function useGameAudio(guesses: Song[], gameState: GameState) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);

  /**
   * I don't really like this, but basically we add a ref that acts like a flag here to continue playing the audio when the win state is reached
   */
  const playSoundWhenWinRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // make absolutely sure looping is off
    audio.loop = false;

    let targetSeconds = 0;
    if (guesses.length >= MAX_GUESSES || isWinState(gameState)) {
      targetSeconds = MAX_GUESSES * SECONDS_PER_GUESS;
    } else {
      targetSeconds = (guesses.length + 1) * SECONDS_PER_GUESS;
    }

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      if (t >= targetSeconds) {
        // Pause BEFORE setting currentTime to avoid 'ended' race on some browsers
        audio.pause();
        // Snap to target (keeps UI consistent)
        audio.currentTime = Math.min(
          targetSeconds,
          audio.duration || targetSeconds
        );
        setPlaying(false);
        setProgress(audio.currentTime);
        lastProgressRef.current = audio.currentTime;
      } else {
        setProgress(t);
        lastProgressRef.current = t;
      }
    };

    // Ensure ended doesn't restart playback
    const onEnded = () => {
      // If playback ends naturally, ensure we are at the target and mark stopped.
      audio.pause();
      const at = Math.min(targetSeconds, audio.duration || targetSeconds);
      audio.currentTime = at;
      setPlaying(false);
      setProgress(at);
      lastProgressRef.current = at;
      // Also cancel RAF loop if any (it will be cancelled in cleanup too)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startRafLoop = () => {
      const loop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (!audio) return;
        const t = audio.currentTime;
        if (t - lastProgressRef.current >= 0.05) {
          setProgress(t);
          lastProgressRef.current = t;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    if (playing || (isWinState(gameState) && !playSoundWhenWinRef.current)) {
      if (isWinState(gameState)) {
        playSoundWhenWinRef.current = true;
      }

      // If we are starting playback, ensure we are not past the limit
      if (audio.currentTime >= targetSeconds) {
        audio.currentTime = 0;
        setProgress(0);
        lastProgressRef.current = 0;
      }

      // ensure loop false again before play (defensive)
      audio.loop = false;

      audio.play().catch((e) => {
        console.warn("Audio play() failed", e);
      });

      startRafLoop();
    } else {
      audio.pause();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setProgress(audio.currentTime);
      lastProgressRef.current = audio.currentTime;
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing, guesses, gameState]);

  /**
   * This function is necessary since useSound does not let me chain together sound effects
   * @param audioPath
   */
  async function playAudioWithoutUseSound(audioPath: string) {
    try {
      const audio = new Audio(audioPath);
      await audio.play();
    } catch (e) {
      console.error("native Audio failed:", e);
    }
  }

  return {
    audioRef,
    playing,
    setPlaying,
    progress,
    setProgress,
    lastProgressRef,
    playAudioWithoutUseSound,
  };
}
