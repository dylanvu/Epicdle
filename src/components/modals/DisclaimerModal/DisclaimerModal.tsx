import { Button, Modal, Text, Title, List, Anchor } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./DisclaimerModal.module.css";
import { PRIMARY_COLOR } from "@/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ModalTitle from "../ModalTitle";

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
    >
      <Title order={4}>Attribution / Credits</Title>
      <Title order={5}>Music</Title>
      <Text>Jorge Rivera-Herrans, Winion Entertainment LLC</Text>
      <Title order={5}>Album Art</Title>
      <Text>
        <Anchor href={"https://zwistillustration.com/about-1"}>ZWIST</Anchor>
      </Text>
      <Title order={5}>GIFs</Title>
      <List>
        <List.Item>
          <Anchor href="https://www.youtube.com/watch?v=nMmrtgbFmOg">
            WolfyTheWitch's "Warrior of the Mind" Animatic
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://www.youtube.com/watch?v=gtKNgFftV5Y">
            Neal Illustrator's "Thunder Bringer" Animatic
          </Anchor>
        </List.Item>
      </List>
      <Title order={5}>Sound Effects</Title>
      <List>
        <List.Item>
          <Anchor href="https://pixabay.com/sound-effects/loud-thunder-sound-effect-359272/">
            https://pixabay.com/sound-effects/loud-thunder-sound-effect-359272/
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://pixabay.com/sound-effects/big-thunder-clap-99753/">
            https://pixabay.com/sound-effects/big-thunder-clap-99753/
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://pixabay.com/sound-effects/epic-orchestra-reveal-ident-165193/">
            https://pixabay.com/sound-effects/epic-orchestra-reveal-ident-165193/
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://pixabay.com/sound-effects/11l-triumphant-orchestra-1749487502507-360359/">
            https://pixabay.com/sound-effects/11l-triumphant-orchestra-1749487502507-360359/
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://pixabay.com/sound-effects/click-for-game-menu-131903/">
            https://pixabay.com/sound-effects/click-for-game-menu-131903/
          </Anchor>
        </List.Item>
      </List>

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
