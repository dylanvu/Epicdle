"use client";
import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./TutorialModal.module.css";
import { MAX_GUESSES } from "@/constants";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ModalTitle from "../ModalTitle";
import SongLyrics from "../SongLyrics";
import ModalGif from "../ModalGif/ModalGif";

export default function TutorialModal({
  openState,
  modalHandler,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
}) {
  const playButtonSound = useButtonSound();
  return (
    <Modal
      opened={openState}
      onClose={() => {
        playButtonSound();
        modalHandler.close();
      }}
      title={<ModalTitle>How to Play</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <div>
        <ModalGif
          src={"/gif/Boar.gif"}
          alt="Warrior of the Mind Animatic - Boar Scene"
        />
        <SongLyrics>
          <Text>You have a challenge, a test of skill</Text>
          <Text>A song to name that will contest your will</Text>
          <Text>
            There are
            <Text fw={700} span>
              {" "}
              {MAX_GUESSES.toString()} tries{" "}
            </Text>
            to reach win's thrill
          </Text>
          <Text>Each guess brings you close as the music spills</Text>
        </SongLyrics>
        <Text mt="md">
          Try to guess the song in{" "}
          <Text fw={700} span>
            {MAX_GUESSES.toString()} or fewer tries
          </Text>
          .
        </Text>
        <Text>Each attempt will reveal more of the song.</Text>
        <Text>Good luck!</Text>
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
        Let's Go!
      </Button>
    </Modal>
  );
}
