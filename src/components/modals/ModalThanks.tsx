import { Text } from "@mantine/core";

export default function ModalThanks() {
  return (
    <>
      <Text fs={"italic"} mt={"md"}>
        Thanks for playing today! Please come back tomorrow for a new song!
      </Text>
      <Text fs={"italic"} fw={700} mt={"md"}>
        If you had fun, please consider sharing the game with your friends.
      </Text>
    </>
  );
}
