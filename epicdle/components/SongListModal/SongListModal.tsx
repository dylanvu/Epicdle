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
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
}) {
  return (
    <Modal
      opened={openState}
      onClose={modalHandler.close}
      title="Select a song from the list:"
      className={styles.game}
    >
      <div className={styles.songList}>
        {SONG_LIST.map((song) => (
          <GuessOption
            key={`song-list-${song.name}`}
            song={song}
            setSelectedSong={setSelectedSong}
            closeModal={modalHandler.close}
          />
        ))}
      </div>
      <Button onClick={modalHandler.close} mt="md" w="100%">
        Close
      </Button>
    </Modal>
  );
}
