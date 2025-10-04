// create a custom hook for playing the button click sound
import useSound from "use-sound";

export function useButtonSound(onend?: () => void) {
  const [play] = useSound("/sfx/button_click.mp3", {
    onend,
    playbackRate: 1.1,
  });
  return play;
}
