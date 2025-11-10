import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./WinModal.module.css";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ShareButton from "@/components/ShareButton/ShareButton";
import ModalTitle from "../ModalTitle";
import { Song } from "@/interfaces/interfaces";
import ModalThanks from "../ModalThanks";
import SongLyrics from "../SongLyrics";
import ModalGif from "../ModalGif/ModalGif";

export default function TutorialModal({
  openState,
  modalHandler,
  guesses,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  guesses: Song[];
}) {
  const playButtonSound = useButtonSound();
  return (
    <Modal
      opened={openState}
      onClose={() => {
        modalHandler.close();
        playButtonSound();
      }}
      title={<ModalTitle>You Win!</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <ModalGif
        fileName="WarriorOfTheMind"
        alt="Warrior of the Mind Animatic"
      />
      <SongLyrics>
        <Text>
          You are a{" "}
          <Text fw={700} span>
            warrior of the mind
          </Text>
          !
        </Text>
      </SongLyrics>
      <Text mt="lg">You guessed today's song!</Text>
      <ModalThanks />
      <ShareButton guesses={guesses} win={true} />
      <Button
        onClick={() => {
          modalHandler.close();
          playButtonSound();
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
