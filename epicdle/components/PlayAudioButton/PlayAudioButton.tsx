import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";
import { PRIMARY_COLOR } from "../../theme";

export default function PlayAudioButton({
  playing,
  setPlaying,
}: {
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  function handlePlay() {
    const next = !playing;
    setPlaying(next);
  }

  return (
    <>
      <ActionIcon
        variant="filled"
        aria-label="Play"
        size={56}
        radius="lg"
        onClick={handlePlay}
        color={PRIMARY_COLOR}
      >
        {playing ? (
          <IconPlayerPauseFilled
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
          />
        ) : (
          <IconPlayerPlayFilled
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
          />
        )}
      </ActionIcon>
    </>
  );
}
