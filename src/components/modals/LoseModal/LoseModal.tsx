import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LoseModal.module.css";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ShareButton from "@/components/ShareButton/ShareButton";
import ModalTitle from "../ModalTitle";
import { Song } from "@/interfaces/interfaces";
import ModalThanks from "../ModalThanks";
import SongLyrics from "../SongLyrics";
import ModalGif from "../ModalGif/ModalGif";
import {
  INSTRUMENTAL_GAME_API_BASE_ENDPOINT,
  ValidAPIBaseEndpoint,
} from "@/constants";

export default function TutorialModal({
  openState,
  modalHandler,
  guesses,
  base_endpoint,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  guesses: Song[];
  base_endpoint: ValidAPIBaseEndpoint;
}) {
  const playButtonSound = useButtonSound();
  let isLegendary = false;
  if (base_endpoint === INSTRUMENTAL_GAME_API_BASE_ENDPOINT) {
    isLegendary = true;
  }
  return (
    <Modal
      opened={openState}
      onClose={() => {
        modalHandler.close();
        playButtonSound();
      }}
      title={<ModalTitle>{isLegendary ? "Ouch!" : "Thunder..."}</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <ModalGif
        fileName={isLegendary ? "LegendModeLoss" : "ThunderBringer"}
        alt={
          isLegendary
            ? "Telemachus getting beat up by Antonius"
            : "Zeus ending Odysseus' crew"
        }
      />
      <SongLyrics>
        {isLegendary ? (
          <Text>Ooooh, maybe today's song was a bit too hard...</Text>
        ) : (
          <Text>Thunder, bring her through the wringer!</Text>
        )}
      </SongLyrics>
      <Text mt="lg">You didn't guess today's song... but feel free to try again though!</Text>

      <ModalThanks />

      <ShareButton
        guesses={guesses}
        win={false}
        base_endpoint={base_endpoint}
      />
      <Button
        onClick={() => {
          modalHandler.close();
          playButtonSound();
        }}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
      >
        Close
      </Button>
    </Modal>
  );
}
