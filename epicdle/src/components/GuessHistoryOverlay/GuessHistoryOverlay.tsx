import { Song } from "@/interfaces/interfaces";
import styles from "./GuessHistoryOverlay.module.css";
import { Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function GuessHistoryOverlay({ guesses }: { guesses: Song[] }) {
  return (
    <div className={styles.guessHistory}>
      {guesses.map((guess, index) => (
        <div className={styles.guess} key={`guess-history-${index}`}>
          <IconX className={styles.X} size={40} />
          <Text className={styles.guessText}>{guess.name}</Text>
        </div>
      ))}
    </div>
  );
}
