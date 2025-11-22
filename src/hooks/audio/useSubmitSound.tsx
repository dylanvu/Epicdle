// create a custom hook for playing the submit sound
import useSound from "use-sound";

export function useSubmitSound(onend?: () => void) {
  const [play] = useSound("/sfx/orchestral_reveal.opus", {
    onend,
    playbackRate: 1.5,
  });
  return play;
}
