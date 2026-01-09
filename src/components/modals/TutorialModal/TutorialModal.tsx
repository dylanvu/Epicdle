"use client";
import { Anchor, Button, List, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./TutorialModal.module.css";
import { MAX_GUESSES, SUPPORT_EMAIL } from "@/constants";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ModalTitle from "../ModalTitle";
import SongLyrics from "../SongLyrics";
import ModalGif from "../ModalGif/ModalGif";
import {
  IconSearch,
  IconArrowRight,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function TutorialModal({
  openState,
  modalHandler,
  isLegendary,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
  isLegendary: boolean;
}) {
  const playButtonSound = useButtonSound();
  const isMobile = useIsMobile();
  return (
    <Modal
      opened={openState}
      onClose={() => {
        playButtonSound();
        modalHandler.close();
      }}
      title={<ModalTitle>How to Play</ModalTitle>}
      className={styles.game}
      lockScroll={false}
    >
      <Stack gap="xs">
        <ModalGif
          fileName={isLegendary ? "Legend" : "Boar"}
          alt={
            isLegendary
              ? "Legendary - Telemachus Animatic"
              : "Warrior of the Mind Animatic - Boar Scene"
          }
        />

        <SongLyrics>
          {isLegendary ? (
            <>
              <Text>Give me rhythms and a drumbeat</Text>
              <Text>Give me tempos and a motif</Text>
              <Text>Without the lyrics, songs are scary</Text>
              <Text>But I wanna be legendary!</Text>
            </>
          ) : (
            <>
              <Text>You have a challenge, a test of skill</Text>
              <Text>A song to name that will assess your will</Text>
              <Text>
                There are
                <Text fw={700} span>
                  {" "}
                  {MAX_GUESSES.toString()} tries{" "}
                </Text>
                to reach win's thrill
              </Text>
              <Text>A mistold guess allows the song to fill</Text>
            </>
          )}
        </SongLyrics>
        <List type="ordered" mt="md">
          <List.Item>
            <Text>
              Listen to the snippet using{" "}
              <ThemeIcon color={PRIMARY_COLOR} component="span">
                <IconPlayerPlayFilled />
              </ThemeIcon>
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Search for a song using{" "}
              {isMobile ? (
                <ThemeIcon color={PRIMARY_COLOR} component="span">
                  <IconSearch />
                </ThemeIcon>
              ) : (
                `the "Choose Song" button`
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Submit your guess using{" "}
              {isMobile ? (
                <ThemeIcon color={PRIMARY_COLOR} component="span">
                  <IconArrowRight />
                </ThemeIcon>
              ) : (
                `the "Submit Guess" button`
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text>Repeat until you get it! Each attempt reveals more of the song.</Text>
          </List.Item>
        </List>
        <Text mt="md">
          Guess the song in{" "}
          <Text fw={700} span>
            {MAX_GUESSES.toString()} or fewer tries
          </Text>
          . You can always also refresh the page to try again.
        </Text>
        <Text>Good luck!</Text>
      </Stack>

      <Button
        onClick={() => {
          playButtonSound();
          modalHandler.close();
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
