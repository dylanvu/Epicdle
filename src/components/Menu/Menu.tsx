"use client";
import { Box, Button, Flex, Stack, Text } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { useDisclosure } from "@mantine/hooks";
import DisclaimerModal from "@/components/modals/DisclaimerModal/DisclaimerModal";
import { IconBow, IconSword } from "@tabler/icons-react";

export default function Menu() {
  const [openedAbout, aboutHandler] = useDisclosure(false);

  const playButtonSound = useButtonSound(() => {
    // navigate to the game page
    window.location.href = "/game";
  });

  const playButtonSoundLegend = useButtonSound(() => {
    // navigate to the game page
    window.location.href = "/legend";
  });

  const playAboutButtonSound = useButtonSound();
  return (
    <Stack mt="md" justify="center" align="center" ml="auto" mr="auto">
      <DisclaimerModal openState={openedAbout} modalHandler={aboutHandler} />
      <Button
        onClick={() => playButtonSound()}
        size="lg"
        variant="filled"
        component="a"
        color={PRIMARY_COLOR}
        leftSection={<IconBow />}
      >
        Classic
      </Button>
      <Button
        onClick={() => {
          // playButtonSoundLegend();
        }}
        size="lg"
        variant="filled"
        component="a"
        color={PRIMARY_COLOR}
        leftSection={<IconSword />}
        disabled
      >
        Coming Soon: Legend (Instrumentals)
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => {
          playAboutButtonSound();
          aboutHandler.open();
        }}
        color={PRIMARY_COLOR}
      >
        Credits & Disclaimer
      </Button>
      <Text>
        All rights to the original music, sound effects, and album art belong to
        their respective owners.
      </Text>
      <Text>Please see the credits section for attributions.</Text>
    </Stack>
  );
}
