"use client";
import { Button } from "@mantine/core";
import styles from "./Menu.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/audio/playButtonSound";

export default function Menu() {
  const playButtonSound = useButtonSound(() => {
    // navigate to the game page
    window.location.href = "/game";
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
          variant="light"
          fullWidth
          component="a"
          href="/auth"
          color={PRIMARY_COLOR}
        >
          Log In
        </Button>
      </div>
    </div>
  );
}
