import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LoseModal.module.css";
import { PRIMARY_COLOR } from "@/theme";

export default function TutorialModal({
  openState,
  modalHandler,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
}) {
  return (
    <Modal
      opened={openState}
      onClose={modalHandler.close}
      title="You Lost..."
      className={styles.game}
    >
      <Text>RIP</Text>
      <Button
        onClick={modalHandler.close}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
      >
        Let's Go!
      </Button>
    </Modal>
  );
}
