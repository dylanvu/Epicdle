import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LoseModal.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ShareButton from "@/components/ShareButton.tsx/ShareButton";
import { MAX_GUESSES } from "@/constants";
import ModalTitle from "../ModalTitle";
import { Song } from "@/interfaces/interfaces";

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
      title={<ModalTitle>You Lost...</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <Text>RIP</Text>
      <ShareButton guesses={guesses} win={false} />
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
