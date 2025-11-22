// create a custom hook for playing the button click sound
import useSound from "use-sound";

export function useButtonSound(onend?: () => void) {
  const [play] = useSound("/sfx/button_click.opus", {
    onend,
    playbackRate: 1.1,
    volume: 0.025,
  });

  // const play = () => {
  //   if (onend) {
  //     onend();
  //   }
  // };

  return play;
}
