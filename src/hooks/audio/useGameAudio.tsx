import { MAX_GUESSES, SECONDS_PER_GUESS } from "@/constants";
import {
  GameState,
  isWinState,
  IVolumeObject,
  Song,
} from "@/interfaces/interfaces";
import { useState, useRef, useEffect } from "react";

/**
 * This is a vibecoded hook that encapsulates the audio logic for the game, but at least I thought of putting the logic into its own hook.
 * @param guesses
 * @param gameState
 * @param volumeObject
 * @returns
 */
export function useGameAudio(
  guesses: Song[],
  gameState: GameState,
  volumeObject: IVolumeObject
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

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // I'm just a vibe coder...

  /**
   * Poll volumeObject on every frame and apply it to the audio element.
   * This lets us react instantly when the parent updates the ref, without
   * needing React state updates in the parent.
   * Also fixes iOS Safari quirk by using GainNode safely.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !volumeObject) return;

    // remember the volume in localStorage
    try {
      localStorage.setItem("volume", JSON.stringify(volumeObject));
    } catch {}

    let usingGainNode = false;

    const setupWebAudio = async () => {
      // Ensure AudioContext exists and resume if suspended (iOS)
      if (!audioCtxRef.current) {
        const Ctor =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) {
          return;
        }
        audioCtxRef.current = new Ctor();
      }

      if (!audioCtxRef.current) {
        return;
      }

      if (audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch {
          // ignore if resume fails; may need user gesture
        }
      }

      // Only create MediaElementSource once per element (avoids InvalidStateError)
      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current =
            audioCtxRef.current.createMediaElementSource(audio);
          gainNodeRef.current = audioCtxRef.current.createGain();
          sourceNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioCtxRef.current.destination);
          usingGainNode = true;
        } catch (e) {
          console.warn("WebAudio setup failed:", e);
          usingGainNode = false;
        }
      } else {
        usingGainNode = !!gainNodeRef.current;
      }
    };

    setupWebAudio();

    const loop = () => {
      // Read current volume live on each frame (avoids frozen value bug)
      const desiredLinear = volumeObject.muted ? 0 : volumeObject.volume / 100;

      if (usingGainNode && gainNodeRef.current && audioCtxRef.current) {
        try {
          gainNodeRef.current.gain.setValueAtTime(
            desiredLinear,
            audioCtxRef.current.currentTime
          );
          lastAppliedVolumeRef.current = desiredLinear;
        } catch {
          try {
            (gainNodeRef.current.gain as any).value = desiredLinear;
            lastAppliedVolumeRef.current = desiredLinear;
          } catch {}
        }
      } else {
        // fallback: set audio.volume (may be ignored on iOS)
        if (
          lastAppliedVolumeRef.current === null ||
          Math.abs(desiredLinear - (lastAppliedVolumeRef.current ?? 0)) > 0.0005
        ) {
          try {
            audio.volume = desiredLinear;
            lastAppliedVolumeRef.current = desiredLinear;
          } catch {}
        }
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
    // run once on mount; poll loop reads volumeObject continuously
  }, [audioRef, volumeObject]);

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

    const startPlayback = async () => {
      if (isWinState(gameState) && !playSoundWhenWinRef.current) {
        playSoundWhenWinRef.current = true;
      }

      // Resume AudioContext on iOS if suspended
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch {}
      }

      // If we are starting playback, ensure we are not past the limit
      if (audio.currentTime >= targetSeconds) {
        audio.currentTime = 0;
        setProgress(0);
        lastProgressRef.current = 0;
      }

      // ensure loop false again before play (defensive)
      audio.loop = false;

      try {
        await audio.play();
        startRafLoop();
      } catch (e) {
        console.warn("Audio play() failed", e);
      }
    };

    if (playing || (isWinState(gameState) && !playSoundWhenWinRef.current)) {
      startPlayback();
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

  return {
    audioRef,
    playing,
    setPlaying,
    progress,
    setProgress,
    lastProgressRef,
  };
}

/**
 * This is also my original contribution:
 * This function is necessary since useSound does not let me chain together sound effects
 * @param audioPath
 */
export async function playAudioWithoutUseSound(audioPath: string) {
  try {
    const audio = new Audio(audioPath);
    await audio.play();
  } catch (e) {
    console.error("native Audio failed:", e);
  }
}
