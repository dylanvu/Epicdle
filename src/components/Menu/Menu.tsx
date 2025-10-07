"use client";
import { Button, Text } from "@mantine/core";
import styles from "./Menu.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/audio/playButtonSound";
import { useDisclosure } from "@mantine/hooks";
import DisclaimerModal from "@/components/modals/DisclaimerModal/DisclaimerModal";

export default function Menu() {
  const [openedAbout, aboutHandler] = useDisclosure(false);

  const playButtonSound = useButtonSound(() => {
    // navigate to the game page
    window.location.href = "/game";
  });
  const playAboutButtonSound = useButtonSound();
  return (
    <div className={styles.Menu}>
      <DisclaimerModal openState={openedAbout} modalHandler={aboutHandler} />
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
          onClick={() => {
            playAboutButtonSound();
            aboutHandler.open();
          }}
          color={PRIMARY_COLOR}
        >
          Credits & Disclaimer
        </Button>
      </div>
      <Text>
        All rights to the original music, sound effects, and album art belong to
        their respective owners.
      </Text>
      <Text>Please see the credits section for attributions.</Text>
    </div>
  );
}
