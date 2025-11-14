import { Button, Modal, Text } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./WinModal.module.css";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ShareButton from "@/components/ShareButton/ShareButton";
import ModalTitle from "../ModalTitle";
import { IYouTubeVideo, Song } from "@/interfaces/interfaces";
import ModalThanks from "../ModalThanks";
import SongLyrics from "../SongLyrics";
import ModalGif from "../ModalGif/ModalGif";
import {
  INSTRUMENTAL_GAME_API_BASE_ENDPOINT,
  ValidAPIBaseEndpoint,
} from "@/constants";

function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);

  if (parts.some(isNaN)) {
    throw new Error("Invalid timestamp format");
  }

  let seconds = 0;

  if (parts.length === 2) {
    const [minutes, secs] = parts;
    seconds = minutes * 60 + secs;
  } else if (parts.length === 3) {
    const [hours, minutes, secs] = parts;
    seconds = hours * 3600 + minutes * 60 + secs;
  } else {
    throw new Error("Timestamp must be in MM:SS or HH:MM:SS format");
  }

  return seconds;
}

function makeYoutubeEmbedUrl(
  base: string,
  params: Record<string, string | number | boolean | null | undefined>
) {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
    });
    return url.toString();
  } catch {
    // fallback for non-absolute urls
    const sep = base.includes("?") ? "&" : "?";
    const query = Object.entries(params)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      )
      .join("&");
    return `${base}${query ? sep + query : ""}`;
  }
}

export default function WinModal({
  openState,
  modalHandler,
  guesses,
  YouTubeVideo,
  base_endpoint,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  guesses: Song[];
  YouTubeVideo: IYouTubeVideo | null;
  base_endpoint: ValidAPIBaseEndpoint;
}) {
  const playButtonSound = useButtonSound();
  let songTime: number | null = null;
  if (YouTubeVideo) {
    songTime = timestampToSeconds(YouTubeVideo.startTimeStamp);
  }

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
      title={<ModalTitle>You Win!</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <ModalGif
        fileName={isLegendary ? "LegendaryWin" : "WarriorOfTheMind"}
        alt={
          isLegendary
            ? "Telemachus slaying suitors"
            : "Warrior of the Mind Animatic"
        }
      />
      <SongLyrics>
        {isLegendary ? (
          <>
            <Text>
              You came{" "}
              <Text fw={700} span>
                prepared
              </Text>
              !
            </Text>
          </>
        ) : (
          <Text>
            You are a{" "}
            <Text fw={700} span>
              warrior of the mind
            </Text>
            !
          </Text>
        )}
      </SongLyrics>
      <Text mt="lg" mb="lg">
        You guessed today's song!
      </Text>
      {songTime && YouTubeVideo && (
        <div style={{ aspectRatio: "1 / 1", width: "100%" }}>
          <iframe
            width="100%"
            height="100%"
            src={makeYoutubeEmbedUrl(YouTubeVideo.url, { start: songTime })}
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>
      )}
      <ModalThanks />
      <ShareButton guesses={guesses} win={true} base_endpoint={base_endpoint} />
      <Button
        onClick={() => {
          modalHandler.close();
          playButtonSound();
        }}
        mt="md"
        w="100%"
        color={PRIMARY_COLOR}
      >
        Let's Go!
      </Button>
    </Modal>
  );
}
