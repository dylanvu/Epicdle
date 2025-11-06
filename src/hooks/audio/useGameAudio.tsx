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
 * @param volumeRef
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

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // I'm just a vibe coder...

  // Helper: ensure AudioContext exists and is resumed
  const ensureAudioContext = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      if (audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (e) {
          // resume may fail if not in user gesture; caller should call on user gesture if needed
          console.warn("AudioContext resume failed:", e);
        }
      }
      return audioCtxRef.current;
    }

    try {
      const Ctor =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      audioCtxRef.current = ctx;
      return ctx;
    } catch (e) {
      console.warn("No WebAudio available:", e);
      return null;
    }
  };

  /**
   * Poll volumeRef.current on every frame and apply it to the audio element.
   * This lets us react instantly when the parent updates the ref, without
   * needing React state updates in the parent.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !volumeObject) return;

    // store in localStorage (keeps your existing behavior)
    try {
      localStorage.setItem("volume", JSON.stringify(volumeObject));
    } catch (e) {
      // ignore storage errors
    }

    let usingGainNode = false;

    const setupWebAudio = async () => {
      const ctx = await ensureAudioContext();
      if (!ctx) {
        usingGainNode = false;
        return;
      }

      // If source not set up for this audio element, create and connect
      if (
        !sourceNodeRef.current ||
        sourceNodeRef.current.mediaElement !== audio
      ) {
        // If there is an old source for a different element, disconnect it
        try {
          sourceNodeRef.current?.disconnect();
        } catch {
          /* ignore */
        }

        try {
          // create MediaElement source and GainNode
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);

          sourceNodeRef.current = source;
          gainNodeRef.current = gain;
          usingGainNode = true;

          // initialize gain to match volumeObject
          const desired = volumeObject.muted ? 0 : volumeObject.volume / 100;
          gain.gain.setValueAtTime(desired, ctx.currentTime);
          lastAppliedVolumeRef.current = desired;
        } catch (e) {
          console.warn("WebAudio setup failed:", e);
          usingGainNode = false;
        }
      } else {
        usingGainNode = !!gainNodeRef.current;
      }
    };

    // attempt web audio setup; we don't await here to keep effect sync,
    // but we will use whatever gets configured.
    setupWebAudio();

    const loop = () => {
      const desiredLinear = volumeObject.muted ? 0 : volumeObject.volume / 100;

      if (usingGainNode && gainNodeRef.current && audioCtxRef.current) {
        const gainNode = gainNodeRef.current;
        // only update if there's a meaningful change
        if (
          lastAppliedVolumeRef.current === null ||
          Math.abs(desiredLinear - (lastAppliedVolumeRef.current ?? 0)) > 0.0005
        ) {
          // set the gain (works reliably on iOS Safari)
          try {
            // use setValueAtTime for smoothness / compatibility
            gainNode.gain.setValueAtTime(
              desiredLinear,
              audioCtxRef.current.currentTime
            );
            lastAppliedVolumeRef.current = desiredLinear;
          } catch (e) {
            // If gain.setValueAtTime throws, fall back to direct assignment
            try {
              (gainNode.gain as any).value = desiredLinear;
              lastAppliedVolumeRef.current = desiredLinear;
            } catch {}
          }
        }
      } else {
        // fallback: set the element volume (may be ignored on iOS)
        const desired = desiredLinear;
        if (
          lastAppliedVolumeRef.current === null ||
          Math.abs(desired - (lastAppliedVolumeRef.current ?? 0)) > 0.0005
        ) {
          try {
            audio.volume = desired;
            lastAppliedVolumeRef.current = desired;
          } catch (e) {
            // setting audio.volume can throw in some browsers in weird states
            // swallow but keep loop running.
          }
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
      // do not close audio context here — keep it for app lifetime; if you want to close, do it elsewhere
      // but we will NOT leave dangling gain nodes pointing at an element that may be removed:
      // (disconnect source if it was created for this element)
      try {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
      } catch {}
    };
    // NOTE: we intentionally depend on volumeObject (object identity) here like you passed it in.
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
