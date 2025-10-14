// create a custom hook for playing the submit sound
import useSound from "use-sound";

export function useSubmitSound(onend?: () => void) {
  const [play] = useSound("/sfx/orchestral_reveal.mp3", {
    onend,
    playbackRate: 1.5,
  });
  return play;
}
