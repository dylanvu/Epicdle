import { notifications } from "@mantine/notifications";
import { Text, Stack, Anchor } from "@mantine/core";
import { SUPPORT_EMAIL } from "@/constants";
import { WRONG_COLOR } from "@/config/theme";

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
