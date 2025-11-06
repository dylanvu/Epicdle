"use client";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { GAME_URL, MAX_GUESSES } from "@/constants";
import { PRIMARY_COLOR } from "@/config/theme";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShare, IconCopy } from "@tabler/icons-react";
import { ReactNode, useEffect, useState } from "react";
import { Song } from "@/interfaces/interfaces";
import { getLifetimeGameDay } from "@/app/services/gameService";

import { useFirebaseAnalytics } from "@/contexts/firebaseContext";

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
  useEffect(() => {
    getLifetimeGameDay().then(setLifetimeGameDay);
  }, []);

  const { logEvent } = useFirebaseAnalytics();

  const [lifetimeGameDay, setLifetimeGameDay] = useState(0);

  const playButtonSound = useButtonSound();

  const guessEmoji = "🎵";
  const winEmoji = "🏆";
  const loseEmoji = "🌩️";
  // for each incorrect guess, create a music note
  // I HAVE NO IDEA WHY THIS CODE IS SO HORRENDOUSLY BAD???? FOR SOMETHING SO SIMPLE?
  let guessesString = "";
  // there is a bug where if you win, you are missing a music note
  // but if you lose, you have one extra?
  const totalGuesses = win ? guesses.length : guesses.length - 1;
  for (let i = 0; i < totalGuesses; i++) {
    guessesString += `${guessEmoji} `;
  }

  if (win) {
    guessesString += winEmoji;
  } else {
    guessesString += loseEmoji;
  }

  const guessCount = win ? (guesses.length + 1).toString() : "X";

  // TODO: update the link
  const shareText = `Epicdle #${lifetimeGameDay} ${guessCount}/${MAX_GUESSES}
${guessesString}
${GAME_URL}`;

  function share(text: string, mobile: boolean) {
    if (mobile) {
      navigator.share({
        title: "Epicdle",
        text: text,
        url: GAME_URL,
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
          logEvent("share_results");
        }}
      />
      <CommonShareButton
        text={"Copy"}
        icon={<IconCopy />}
        onClick={() => {
          playButtonSound();
          share(shareText, false);
          logEvent("copy_results");
        }}
      />
    </>
  );
}
