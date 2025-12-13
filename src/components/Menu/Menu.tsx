"use client";
import { Button, Stack, Text } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import { useDisclosure } from "@mantine/hooks";
import DisclaimerModal from "@/components/modals/DisclaimerModal/DisclaimerModal";
import { IconBow, IconSword } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Menu() {
  const [openedAbout, aboutHandler] = useDisclosure(false);
  const isMobile = useIsMobile();

  const buttonWidth = isMobile ? "80%" : "50%"

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
        w={buttonWidth}
        variant="filled"
        component="a"
        color={PRIMARY_COLOR}
        leftSection={<IconBow />}
      >
        Classic (Original)
      </Button>
      <Button
        onClick={() => {
            playButtonSoundLegend();
        }}
        size="lg"
        w={buttonWidth}
        variant="filled"
        component="a"
        color={PRIMARY_COLOR}
        leftSection={<IconSword />}
      >
        Legend (Instrumentals)
      </Button>
      <Button
        size="lg"
        w={buttonWidth}
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
