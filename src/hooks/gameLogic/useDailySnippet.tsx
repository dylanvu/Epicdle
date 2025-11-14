"use client";

import { useEffect, useState } from "react";
import { getDailySnippet } from "@/app/services/gameService";
import { GameState, HttpError } from "@/interfaces/interfaces";
import { createErrorNotification } from "@/components/Notifications/ErrorNotification";
import { ValidAPIBaseEndpoint } from "@/constants";

export default function useDailySnippet({
  setGameState,
  base_endpoint,
}: {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  base_endpoint: ValidAPIBaseEndpoint;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    getDailySnippet(base_endpoint)
      .then((blob) => {
        if (blob) {
          setAudioUrl(URL.createObjectURL(blob));
          setGameState("play");
        } else {
          throw new HttpError("No snippet found.", 404);
        }
      })
      .catch((err) => {
        createErrorNotification(err);
      });
  }, []);

  return { audioUrl };
}
