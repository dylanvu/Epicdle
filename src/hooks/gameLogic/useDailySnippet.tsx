import { useEffect, useState } from "react";
import { getDailySnippet } from "@/app/services/gameService";
import { notifications } from "@mantine/notifications";
import { Text, Stack, Anchor } from "@mantine/core";
import { SUPPORT_EMAIL } from "@/constants";
import { WRONG_COLOR } from "@/config/theme";
import { GameState } from "@/interfaces/interfaces";

export default function useDailySnippet({
  setGameState,
}: {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDailySnippet()
      .then((blob) => {
        if (blob) {
          setAudioUrl(URL.createObjectURL(blob));
          setGameState("play");
        }
      })
      .catch((err) => {
        setError(err);
        notifications.show({
          title: <Text size="xl">Something feels off here...</Text>,
          message: (
            <Stack>
              <Text>{err.message}</Text>
              <Text>
                If the issue persists, email{" "}
                <Anchor href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </Anchor>
              </Text>
            </Stack>
          ),
          color: WRONG_COLOR,
          autoClose: false,
        });
      });
  }, []);

  return { audioUrl, error };
}
