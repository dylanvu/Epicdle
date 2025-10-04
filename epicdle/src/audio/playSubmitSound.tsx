// create a custom hook for playing the submit sound
import useSound from "use-sound";

export function useSubmitSound(onend?: () => void) {
  const [play] = useSound("/sfx/submit.mp3", {
    onend,
    playbackRate: 2.5,
  });
  return play;
}
