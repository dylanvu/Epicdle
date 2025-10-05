"use client";
import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./TutorialModal.module.css";
import { MAX_GUESSES } from "@/constants";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/audio/playButtonSound";
import { useState } from "react";

export default function TutorialModal({
  openState,
  modalHandler,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
}) {
  const playButtonSound = useButtonSound();
  const [showRealTutorial, setShowRealTutorial] = useState(false);
  return (
    <Modal
      opened={openState}
      onClose={() => {
        playButtonSound();
        modalHandler.close();
      }}
      title="How to Play"
      className={styles.game}
    >
      {showRealTutorial ? (
        <div>
          <Text>
            Try to guess the song in {MAX_GUESSES.toString()} or fewer tries.
          </Text>
          <Text>Each attempt will reveal more of the song.</Text>
          <Text>Good luck!</Text>
        </div>
      ) : (
        <div>
          <Text>You have a challenge, a test of skill</Text>
          <Text>A song to name that will contest your will</Text>
          <Text>
            There are {MAX_GUESSES.toString()} tries to reach win's thrill
          </Text>
          <Text>Each guess brings you close as the music spills</Text>
        </div>
      )}

      {!showRealTutorial ? (
        <Button
          onClick={() => {
            playButtonSound();
            setShowRealTutorial(true);
          }}
          mt="md"
          w="100%"
          variant="light"
          color={PRIMARY_COLOR}
        >
          ...What?
        </Button>
      ) : null}
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
