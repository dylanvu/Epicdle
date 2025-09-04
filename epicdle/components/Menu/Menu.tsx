"use client";
import { Button } from "@mantine/core";
import styles from "./Menu.module.css";

export default function Menu() {
  return (
    <div className={styles.Menu}>
      <div>
        <Button size="lg" variant="filled" fullWidth component="a" href="/game">
          Play
        </Button>
      </div>
      <div>
        <Button size="lg" variant="light" fullWidth component="a" href="/auth">
          Log In
        </Button>
      </div>
    </div>
  );
}
