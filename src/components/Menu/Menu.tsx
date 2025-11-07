"use client";
import { Button, Stack, Text } from "@mantine/core";
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
        Play
      </Button>

      <Button
        onClick={() => {}}
        size="lg"
        variant="filled"
        component="a"
        color={PRIMARY_COLOR}
        leftSection={<IconSword />}
        disabled
      >
        COMING SOON: Instrumental Mode
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
