"use client";
import { Button, Modal, TextInput, ActionIcon } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./SongListModal.module.css";
import { SONG_LIST } from "@/constants";
import GuessOption from "@/components/GuessOption/GuessOption";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Song } from "@/interfaces/interfaces";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import ModalTitle from "../ModalTitle";

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
  const playButtonSound = useButtonSound();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSongList = useMemo(() => {
    if (searchTerm === "") {
      return SONG_LIST;
    } else {
      return SONG_LIST.filter((song) => {
        return song.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  }, [searchTerm]);
  return (
    <Modal
      opened={openState}
      onClose={() => {
        setSearchTerm("");
        playButtonSound();
        modalHandler.close();
      }}
      title={<ModalTitle>Select a song from the list:</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <TextInput
        placeholder="Search for a song..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        rightSection={
          <ActionIcon
            onClick={() => {
              playButtonSound();
              setSearchTerm("");
            }}
            color={PRIMARY_COLOR}
            variant="subtle"
            size="lg"
          >
            <IconTrash />
          </ActionIcon>
        }
        mb="md"
      />
      <div className={styles.songList}>
        {filteredSongList.map((song) => {
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
      <Button
        onClick={() => {
          playButtonSound();
          modalHandler.close();
        }}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
      >
        Close
      </Button>
    </Modal>
  );
}
