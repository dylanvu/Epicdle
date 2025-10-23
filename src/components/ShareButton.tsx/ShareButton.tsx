import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { MAX_GUESSES } from "@/constants";
import { PRIMARY_COLOR } from "@/theme";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShare, IconCopy } from "@tabler/icons-react";
import { ReactNode } from "react";
import { Song } from "@/interfaces/interfaces";

function CommonShareButton({
  text,
  onClick,
  icon,
}: {
  text: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Button
      leftSection={icon}
      mt="md"
      w="100%"
      color={PRIMARY_COLOR}
      variant="outline"
      onClick={onClick}
    >
      {text}
    </Button>
  );
}

export default function ShareButton({
  guesses,
  win,
}: {
  guesses: Song[];
  win: boolean;
}) {
  const playButtonSound = useButtonSound();

  const guessEmoji = "🎵";
  const winEmoji = "🏆";
  const loseEmoji = "🌩️";
  // for each incorrect guess, create a black square
  let guessesString = "";

  for (let i = 0; i < guesses.length - 1; i++) {
    guessesString += `${guessEmoji} `;
  }

  if (win) {
    guessesString += winEmoji;
  } else {
    guessesString += loseEmoji;
  }

  const guessCount = win ? (guesses.length + 1).toString() : "X";

  // TODO: update the link
  const shareText = `Epicdle XYZ ${guessCount}/${MAX_GUESSES}
${guessesString}
https://epicdle.vercel.app/`;

  function share(text: string, mobile: boolean) {
    if (mobile) {
      navigator.share({
        title: "Epicdle",
        text: text,
        url: "https://epicdle.vercel.app/",
      });
    } else {
      // need to add 1 to the guesses length since winning guesses are not counted in the guess history array
      navigator.clipboard.writeText(text);

      // show a toast
      notifications.show({
        title: "Copied results to clipboard!",
        message: "Share your results with your friends!",
        position: "bottom-right",
        color: PRIMARY_COLOR,
      });
    }
  }

  return (
    <>
      <CommonShareButton
        text={"Share"}
        icon={<IconShare />}
        onClick={() => {
          playButtonSound();
          share(shareText, true);
        }}
      />
      <CommonShareButton
        text={"Copy"}
        icon={<IconCopy />}
        onClick={() => {
          playButtonSound();
          share(shareText, false);
        }}
      />
    </>
  );
}
