import { useState, useRef, useEffect } from "react";

export function useGameAudio(targetSeconds: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      if (audio.currentTime >= targetSeconds) {
        audio.currentTime = 0;
        setProgress(0);
        lastProgressRef.current = 0;
      }

      audio.play();

      const loop = () => {
        cancelAnimationFrame(rafRef.current!);
        if (!audio) return;
        // only stop the music if the player has not won AND we are over the time limit given
        if (audio.currentTime >= targetSeconds) {
          // snap the audio back to the targetSeconds
          audio.currentTime = targetSeconds;
          // stop the audio
          setPlaying(false);

          // perform a throttled update otherwise
        } else if (audio.currentTime - lastProgressRef.current >= 0.05) {
          setProgress(audio.currentTime);
          lastProgressRef.current = audio.currentTime;
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } else {
      audio.pause();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setProgress(audio.currentTime);
      lastProgressRef.current = audio.currentTime;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, targetSeconds]);

  /**
   * This function is necessary since useSound does not let me chain together sound effects
   * @param audioPath
   */
  async function playAudioWithoutUseSound(audioPath: string) {
    // TODO: honestly can I just refactor the whole app to not use useSound?
    try {
      await new Audio(audioPath).play();
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
