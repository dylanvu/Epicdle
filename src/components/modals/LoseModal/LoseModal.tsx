import { useState, useRef } from "react";
import { Button, Modal, Text, Loader } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LoseModal.module.css";
import { PRIMARY_COLOR, WRONG_COLOR } from "@/config/theme";
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
import { IconReload, IconBulb } from "@tabler/icons-react";
import { getAnswer } from "@/app/services/gameService";
import { useFirebaseAnalytics } from "@/contexts/firebaseContext";


export default function LoseModal({
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
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingReveal, setConfirmingReveal] = useState(false);
  const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let isLegendary = false;
  if (base_endpoint === INSTRUMENTAL_GAME_API_BASE_ENDPOINT) {
    isLegendary = true;
  }
  const { logEvent } = useFirebaseAnalytics();
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
      <Text mt="lg">You didn't guess today's song...</Text>

      <Button
        leftSection={<IconReload/>}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
        variant="light"
        onClick={() => {
          playButtonSound();
          logEvent("retry_click")
          window.location.reload()
        }}
      >
        Try Again
      </Button>
      <Button
        className={styles.revealButton}
        leftSection={<IconBulb/>}
        rightSection={isLoading ? <Loader size="xs" color={confirmingReveal ? WRONG_COLOR : PRIMARY_COLOR} /> : null}
        mt="md"
        w="100%"
        color={confirmingReveal ? WRONG_COLOR : PRIMARY_COLOR}
        variant={confirmingReveal ? "filled" : "light"}
        disabled={!!answer || isLoading}
        onClick={() => {
          playButtonSound();
          if (!confirmingReveal) {
            // First click - enter confirmation mode
            setConfirmingReveal(true);
            // Clear any existing timeout
            if (confirmTimeoutRef.current) {
              clearTimeout(confirmTimeoutRef.current);
            }
            // Auto-reset after 3 seconds
            confirmTimeoutRef.current = setTimeout(() => {
              setConfirmingReveal(false);
            }, 3000);
          } else {
            // Second click - actually reveal the answer
            if (confirmTimeoutRef.current) {
              clearTimeout(confirmTimeoutRef.current);
            }
            setIsLoading(true);
            logEvent("reveal_answer")
            getAnswer(base_endpoint).then((response) => {
              setAnswer(response.song);
            }).finally(() => {
              setIsLoading(false);
              setConfirmingReveal(false);
            })
          }
        }}
      >
        {confirmingReveal ? "Are you sure?" : "Reveal Answer"}
      </Button>

      {answer && (
        <Text mt="md" fw={600} ta="center" c={PRIMARY_COLOR}>
          The answer was: {answer}
        </Text>
      )}

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
