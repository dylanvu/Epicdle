import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./WinModal.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { IconShare } from "@tabler/icons-react";
import { MAX_GUESSES } from "@/constants";

export default function TutorialModal({
  openState,
  modalHandler,
  guessesUsed,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  guessesUsed: number;
}) {
  function generateShareMessage() {
    // for each incorrect guess, create a black square
    let squares = "";
    for (let i = 0; i < guessesUsed - 1; i++) {
      squares += "⬛ ";
    }
    // make the last guess a GREEN square
    squares += "🟩";

    // TODO: update the link
    navigator.clipboard.writeText(
      `Epicdle XYZ ${guessesUsed}/${MAX_GUESSES}
${squares}
https://epicdle.vercel.app/
`
    );
  }
  return (
    <Modal
      opened={openState}
      onClose={modalHandler.close}
      title="You Won!"
      className={styles.game}
    >
      <Text>You are a warrior of the mind!</Text>
      <Button
        leftSection={<IconShare />}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
        variant="outline"
        onClick={generateShareMessage}
      >
        Share Results
      </Button>
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
