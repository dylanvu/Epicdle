import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { MAX_GUESSES } from "@/constants";
import { PRIMARY_COLOR } from "@/theme";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShare } from "@tabler/icons-react";

export default function ShareButton({
  guessesUsed,
  win,
}: {
  guessesUsed: number;
  win: boolean;
}) {
  const playButtonSound = useButtonSound();

  function generateShareMessage() {
    const guessEmoji = "🎵";
    const winEmoji = "🏆";
    const loseEmoji = "🌩️";
    // for each incorrect guess, create a black square
    let guessesString = "";
    for (let i = 0; i < guessesUsed - 1; i++) {
      guessesString += `${guessEmoji} `;
    }

    if (win) {
      guessesString += winEmoji;
    } else {
      guessesString += loseEmoji;
    }

    // TODO: update the link
    navigator.clipboard.writeText(
      `Epicdle XYZ ${guessesUsed}/${MAX_GUESSES}
${guessesString}
https://epicdle.vercel.app/`
    );

    // show a toast
    notifications.show({
      title: "Copied results to clipboard!",
      message: "Share your results with your friends!",
      position: "bottom-right",
      color: PRIMARY_COLOR,
    });
  }

  return (
    <Button
      leftSection={<IconShare />}
      mt="md"
      w="100%"
      color={PRIMARY_COLOR}
      variant="outline"
      onClick={() => {
        playButtonSound();
        generateShareMessage();
      }}
    >
      Share Results
    </Button>
  );
}
