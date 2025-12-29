import { notifications } from "@mantine/notifications";
import { Text, Stack, Anchor } from "@mantine/core";
import { SUPPORT_EMAIL } from "@/constants";
import { PRIMARY_COLOR, WRONG_COLOR } from "@/config/theme";

export function createErrorNotification(err: Error) {
  notifications.show({
    title: (
      <Text size="xl" fw={400}>
        Something feels off here...
      </Text>
    ),
    message: (
      <Stack>
        <Text>{err.message}</Text>
        <Text>
          If the issue persists, please email{" "}
          <Anchor
            href={`mailto:${SUPPORT_EMAIL}`}
            target="_blank"
            rel="noreferrer"
          >
            {SUPPORT_EMAIL}
          </Anchor>{" "}
          with a screenshot of this page!
        </Text>
      </Stack>
    ),
    position: "bottom-center",
    color: WRONG_COLOR,
    autoClose: false,
  });
}

export function createSystemNotification(message: string) {
  notifications.show({
    title: (
      <Text size="xl" fw={400}>
        Hey there!
      </Text>
    ),
    message: <Text>{message}</Text>,
    position: "top-center",
    color: WRONG_COLOR,
    autoClose: false,
  });
}

export function createInformationalNotification(message: string, title: string) {
  notifications.show({
    title: (
      <Text size="xl" fw={400}>
        {title}
      </Text>
    ),
    message: <Text>{message}</Text>,
    position: "top-center",
    color: PRIMARY_COLOR,
    autoClose: 5000,
  });
}