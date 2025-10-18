import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./WinModal.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ShareButton from "@/components/ShareButton.tsx/ShareButton";
import ModalTitle from "../ModalTitle";

export default function TutorialModal({
  openState,
  modalHandler,
  guessesUsed,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  guessesUsed: number;
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
      <Text>You are a warrior of the mind!</Text>
      <ShareButton guessesUsed={guessesUsed} win={true} />
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
