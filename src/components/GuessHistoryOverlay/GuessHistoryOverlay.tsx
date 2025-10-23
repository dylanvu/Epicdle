import { Song } from "@/interfaces/interfaces";
import styles from "./GuessHistoryOverlay.module.css";
import { Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { WRONG_COLOR } from "@/theme";

export default function GuessHistoryOverlay({ guesses }: { guesses: Song[] }) {
  return (
    <div className={styles.guessHistory}>
      {guesses.map((guess, index) => (
        <div className={styles.guess} key={`guess-history-${index}`}>
          <IconX
            size={40}
            style={{
              color: WRONG_COLOR,
            }}
            className={styles.guessIcon}
          />
          <Text className={styles.guessText}>{guess.name}</Text>
        </div>
      ))}
    </div>
  );
}
