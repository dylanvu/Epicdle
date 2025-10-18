import { Song } from "@/interfaces/interfaces";
import { UseDisclosureHandlers } from "@mantine/hooks";
import { Dispatch, SetStateAction } from "react";
import TutorialModal from "./TutorialModal/TutorialModal";
import SongListModal from "./SongListModal/SongListModal";
import WinModal from "./WinModal/WinModal";
import LoseModal from "./LoseModal/LoseModal";

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
  setSelectedSong,
  guesses,
}: {
  openedHelp: boolean;
  helpHandler: UseDisclosureHandlers;
  openedSearchModal: boolean;
  searchModalHandler: UseDisclosureHandlers;
  openedWinModal: boolean;
  winModalHandler: UseDisclosureHandlers;
  openedLoseModal: boolean;
  loseModalHandler: UseDisclosureHandlers;
  setSelectedSong: Dispatch<SetStateAction<Song | undefined>>;
  guesses: Song[];
}) {
  return (
    <>
      <TutorialModal openState={openedHelp} modalHandler={helpHandler} />
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
      />
      <LoseModal
        openState={openedLoseModal}
        modalHandler={loseModalHandler}
        guesses={guesses}
      />
    </>
  );
}
