import { Song } from "../../interfaces/interfaces";
import Image from "next/image";
import { ALBUM_NAME_TO_COVER_MAP } from "../../constants";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./GuessOption.module.css";
import { Dispatch, SetStateAction } from "react";
import { Text } from "@mantine/core";

export default function GuessOption({
  song,
  setSelectedSong,
  closeModal,
}: {
  song: Song;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
  closeModal: () => void;
}) {
  function handleGuessOptionClick() {
    setSelectedSong(song);
    closeModal();
  }
  return (
    <div className={styles.guessOption} onClick={handleGuessOptionClick}>
      <Text className={styles.songTitle}>{song.name}</Text>
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
