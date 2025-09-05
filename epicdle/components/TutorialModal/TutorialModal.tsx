import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./TutorialModal.module.css";
import { MAX_GUESSES } from "../../constants";

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
      title="How to Play"
      className={styles.game}
    >
      <Text>You have a challenge, a test of skill</Text>
      <Text>A song to name that will contest your will</Text>
      <Text>You have {MAX_GUESSES.toString()} tries to reach win's thrill</Text>
      <Text>Each guess brings you close as the music spills</Text>
      <Button onClick={modalHandler.close} mt="md" w="100%">
        Let's Go!
      </Button>
    </Modal>
  );
}
