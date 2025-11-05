import {
  Button,
  Modal,
  Text,
  Title,
  List,
  Anchor,
  Divider,
  Stack,
} from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./DisclaimerModal.module.css";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ModalTitle from "../ModalTitle";
import { SUPPORT_EMAIL } from "@/constants";

export default function DisclaimerModal({
  openState,
  modalHandler,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
}) {
  const playButtonSound = useButtonSound();

  return (
    <Modal
      opened={openState}
      onClose={() => {
        modalHandler.close();
        playButtonSound();
      }}
      title={<ModalTitle>Credits & Disclaimer</ModalTitle>}
      className={styles.about}
      lockScroll={false}
      size="lg"
    >
      <Stack gap="xs">
        {/* --- Attribution / Credits Section --- */}
        <Title order={4}>Attribution / Credits</Title>
        <Title order={5}>Game/Coding</Title>
        <Text>Yours Truly: Dylan</Text>
        <Text>
          Got any problems or questions? Shoot me an email:{" "}
          <Anchor
            href={`mailto:${SUPPORT_EMAIL}`}
            target="_blank"
            rel="noreferrer"
          >
            {SUPPORT_EMAIL}
          </Anchor>
        </Text>

        <Title order={5}>Music</Title>
        <Text>Jorge Rivera-Herrans, Winion Entertainment LLC</Text>
        <Title order={5}>Album Art</Title>
        <Text>
          <Anchor
            href="https://zwistillustration.com/about-1"
            target="_blank"
            rel="noreferrer"
          >
            ZWIST
          </Anchor>
        </Text>
        <Title order={5}>GIFs</Title>
        <List>
          <List.Item>
            <Anchor
              href="https://www.youtube.com/watch?v=nMmrtgbFmOg"
              target="_blank"
              rel="noreferrer"
            >
              WolfyTheWitch's "Warrior of the Mind" Animatic
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://www.youtube.com/watch?v=gtKNgFftV5Y"
              target="_blank"
              rel="noreferrer"
            >
              Neal Illustrator's "Thunder Bringer" Animatic
            </Anchor>
          </List.Item>
        </List>
        <Title order={5}>Sound Effects</Title>
        <List>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/loud-thunder-sound-effect-359272/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/loud-thunder-sound-effect-359272/
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/big-thunder-clap-99753/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/big-thunder-clap-99753/
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/epic-orchestra-reveal-ident-165193/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/epic-orchestra-reveal-ident-165193/
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/11l-triumphant-orchestra-1749487502507-360359/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/11l-triumphant-orchestra-1749487502507-360359/
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/click-for-game-menu-131903/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/click-for-game-menu-131903/
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor
              href="https://pixabay.com/sound-effects/sword-slash-and-swing-185432/"
              target="_blank"
              rel="noreferrer"
            >
              https://pixabay.com/sound-effects/sword-slash-and-swing-185432/
            </Anchor>
          </List.Item>
        </List>
        <Divider my="sm" />
        {/* --- Footer Content --- */}
        <Title order={4}>Disclaimer</Title>
        <Text>
          I'm just a humble developer who codes for fun. This is a completely
          free, fan-made project created out of love for the musical.
        </Text>
        <Text>
          If you enjoy the game and would like to support me to help cover the
          game server maintenance and other costs coming out of my own pocket,
          you can do so{" "}
          <Anchor
            href="https://buymeacoffee.com/dylanvu"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            here
          </Anchor>
          !
        </Text>
        <Text>
          Support is never required to enjoy all features of the game! It's just
          a way to help keep the project running.
        </Text>
        <Text fw={700}>
          I am not affiliated with Jorge Rivera-Herrans, any members of the EPIC
          cast, or Winion Entertainment LLC in any way. All rights to the
          original music, animatics, sound effects, and album art belong to
          their respective owners. If you'd like to support the official
          creators, please support their channels/socials and listen to Epic:
          The Musical!
        </Text>
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
      </Stack>
    </Modal>
  );
}
