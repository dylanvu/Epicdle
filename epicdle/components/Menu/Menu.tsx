"use client";
import { Button } from "@mantine/core";
import styles from "./Menu.module.css";
import { PRIMARY_COLOR } from "../../theme";

export default function Menu() {
  return (
    <div className={styles.Menu}>
      <div>
        <Button
          size="lg"
          variant="filled"
          fullWidth
          component="a"
          href="/game"
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
