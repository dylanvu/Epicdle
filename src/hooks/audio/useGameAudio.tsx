import { MAX_GUESSES, SECONDS_PER_GUESS } from "@/constants";
import { GameState, isWinState, Song } from "@/interfaces/interfaces";
import { useState, useRef, useEffect } from "react";

/**
 * This is a vibecoded hook that encapsulates the audio logic for the game, but at least I thought of putting the logic into its own hook.
 * @param guesses
 * @param gameState
 * @param volumeRef
 * @returns
 */
export function useGameAudio(
  guesses: Song[],
  gameState: GameState,
  volumeRef: React.RefObject<number>
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);

  // keep last applied volume so we only touch audio.volume when needed
  const lastAppliedVolumeRef = useRef<number | null>(null);
  // raf for volume polling / fades
  const volumeRafRef = useRef<number | null>(null);
  const fadeRafRef = useRef<number | null>(null);

  // I'm just a vibe coder...

  /**
   * Poll volumeRef.current on every frame and apply it to the audio element.
   * This lets us react instantly when the parent updates the ref, without
   * needing React state updates in the parent.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !volumeRef) return;

    const loop = () => {
      // I fixed a bug here so I'm not JUST a vibecoder!
      const desired = volumeRef.current / 100;
      if (
        lastAppliedVolumeRef.current === null ||
        Math.abs(desired - (lastAppliedVolumeRef.current ?? 0)) > 0.0005
      ) {
        audio.volume = desired;
        // okay everything after this is just me being a vibecoder
        lastAppliedVolumeRef.current = desired;
      }
      volumeRafRef.current = requestAnimationFrame(loop);
    };

    volumeRafRef.current = requestAnimationFrame(loop);

    return () => {
      if (volumeRafRef.current) {
        cancelAnimationFrame(volumeRafRef.current);
        volumeRafRef.current = null;
      }
      // also cancel any fade in progress
      if (fadeRafRef.current) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    };
    // run once on mount; poll loop reads volumeRef.current continuously
  }, [audioRef, volumeRef.current]);

  /**
   * This is my original contribution:
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
   * This is also my original contribution:
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
