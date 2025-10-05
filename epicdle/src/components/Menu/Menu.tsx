"use client";
import { Button, Text } from "@mantine/core";
import styles from "./Menu.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/audio/playButtonSound";

export default function Menu() {
  const playButtonSound = useButtonSound(() => {
    // navigate to the game page
    window.location.href = "/game";
  });
  const playAboutButtonSound = useButtonSound(() => {
    // navigate to the about page
    window.location.href = "/about";
  });
  return (
    <div className={styles.Menu}>
      <div>
        <Button
          onClick={() => playButtonSound()}
          size="lg"
          variant="filled"
          fullWidth
          component="a"
          color={PRIMARY_COLOR}
        >
          Play
        </Button>
      </div>
      <div>
        <Button
          size="lg"
          variant="outline"
          fullWidth
          component="a"
          href="/auth"
          color={PRIMARY_COLOR}
        >
          About
        </Button>
      </div>
      <Text>
        All rights to the original music and album art belong to their
        respective owners.
      </Text>
      <Text>
        Please support Jorge Rivera-Herrans and Winion Entertainment LLC!
      </Text>
    </div>
  );
}
