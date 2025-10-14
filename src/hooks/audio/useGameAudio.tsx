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
        if (audio.currentTime >= targetSeconds) {
          audio.currentTime = targetSeconds;
          setPlaying(false);
        } else if (audio.currentTime - lastProgressRef.current >= 0.05) {
          setProgress(audio.currentTime);
          lastProgressRef.current = audio.currentTime;
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } else {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setProgress(audio.currentTime);
      lastProgressRef.current = audio.currentTime;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, targetSeconds]);

  return { audioRef, playing, setPlaying, progress, setProgress };
}
