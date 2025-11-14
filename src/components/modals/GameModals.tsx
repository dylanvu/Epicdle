import { IYouTubeVideo, Song } from "@/interfaces/interfaces";
import { UseDisclosureHandlers } from "@mantine/hooks";
import { Dispatch, SetStateAction } from "react";
import TutorialModal from "./TutorialModal/TutorialModal";
import SongListModal from "./SongListModal/SongListModal";
import WinModal from "./WinModal/WinModal";
import LoseModal from "./LoseModal/LoseModal";
import DisclaimerModal from "./DisclaimerModal/DisclaimerModal";
import {
  INSTRUMENTAL_GAME_API_BASE_ENDPOINT,
  ValidAPIBaseEndpoint,
} from "@/constants";

/**
 * Wrapper for all the game modals
 */
export default function GameModals({
  openedHelp,
  helpHandler,
  openedSearchModal,
  searchModalHandler,
  openedWinModal,
  winModalHandler,
  openedLoseModal,
  loseModalHandler,
  openedDisclaimerModal,
  disclaimerModalHandler,
  setSelectedSong,
  guesses,
  YouTubeVideo,
  base_endpoint,
}: {
  openedHelp: boolean;
  helpHandler: UseDisclosureHandlers;
  openedSearchModal: boolean;
  searchModalHandler: UseDisclosureHandlers;
  openedWinModal: boolean;
  winModalHandler: UseDisclosureHandlers;
  openedLoseModal: boolean;
  loseModalHandler: UseDisclosureHandlers;
  openedDisclaimerModal: boolean;
  disclaimerModalHandler: UseDisclosureHandlers;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
  guesses: Song[];
  YouTubeVideo: IYouTubeVideo | null;
  base_endpoint: ValidAPIBaseEndpoint;
}) {
  const isInstrumentalMode =
    base_endpoint === INSTRUMENTAL_GAME_API_BASE_ENDPOINT;
  return (
    <>
      <TutorialModal
        openState={openedHelp}
        modalHandler={helpHandler}
        isLegendary={isInstrumentalMode}
      />
      <SongListModal
        openState={openedSearchModal}
        modalHandler={searchModalHandler}
        setSelectedSong={setSelectedSong}
        guesses={guesses}
      />
      <WinModal
        openState={openedWinModal}
        modalHandler={winModalHandler}
        guesses={guesses}
        YouTubeVideo={YouTubeVideo}
        base_endpoint={base_endpoint}
      />
      <LoseModal
        openState={openedLoseModal}
        modalHandler={loseModalHandler}
        guesses={guesses}
        base_endpoint={base_endpoint}
      />
      <DisclaimerModal
        openState={openedDisclaimerModal}
        modalHandler={disclaimerModalHandler}
      />
    </>
  );
}
