import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LoseModal.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/audio/playButtonSound";

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
        modalHandler.close();
        playButtonSound();
      }}
      title="You Lost..."
      className={styles.game}
    >
      <Text>RIP</Text>
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
