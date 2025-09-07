import { Song } from "../../src/interfaces/interfaces";
import Image from "next/image";
import { ALBUM_NAME_TO_COVER_MAP } from "../../src/constants";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./GuessOption.module.css";
import { Dispatch, SetStateAction } from "react";
import { Text } from "@mantine/core";

export default function GuessOption({
  song,
  setSelectedSong,
  closeModal,
  isDisabled,
}: {
  song: Song;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
  closeModal: () => void;
  isDisabled?: boolean;
}) {
  function handleGuessOptionClick() {
    setSelectedSong(song);
    closeModal();
  }
  return (
    <div
      className={`${styles.guessOption} ${isDisabled ? styles.disabled : null}`}
      onClick={isDisabled ? undefined : handleGuessOptionClick}
    >
      <Text
        className={`${styles.songTitle} ${
          isDisabled ? styles.titleDisabled : null
        }`}
      >
        {song.name}
      </Text>
      <Image
        src={ALBUM_NAME_TO_COVER_MAP[song.album]}
        alt={song.album}
        width={100}
        height={100}
      />
      <IconChevronRight className={styles.chevron} />
    </div>
  );
}
