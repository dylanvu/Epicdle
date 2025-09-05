import { Button, Modal } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./SongListModal.module.css";
import { SONG_LIST } from "../../constants";
import GuessOption from "../GuessOption/GuessOption";
import { Dispatch, SetStateAction } from "react";
import { Song } from "../../interfaces/interfaces";

export default function SongListModal({
  openState,
  modalHandler,
  setSelectedSong,
  guesses,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
  guesses: Song[];
}) {
  return (
    <Modal
      opened={openState}
      onClose={modalHandler.close}
      title="Select a song from the list:"
      className={styles.game}
    >
      <div className={styles.songList}>
        {SONG_LIST.map((song) => {
          // if song name is in the guess list, disable the option
          const isDisabled = guesses.some((guess) => guess.name === song.name);
          return (
            <GuessOption
              key={`song-list-${song.name}`}
              song={song}
              setSelectedSong={setSelectedSong}
              closeModal={modalHandler.close}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>
      <Button onClick={modalHandler.close} mt="md" w="100%">
        Close
      </Button>
    </Modal>
  );
}
