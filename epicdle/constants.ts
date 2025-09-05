import { Song } from "./interfaces/interfaces";

export const MAX_GUESSES = 6;

export const ALBUM_NAME_TO_COVER_MAP: Record<string, string> = {
  "The Troy Saga": "/The_Troy_Saga.webp",
  "The Cyclops Saga": "/The_Cyclops_Saga.webp",
  "The Ocean Saga": "/The_Ocean_Saga.webp",
  "The Circe Saga": "/The_Circe_Saga.webp",
  "The Underworld Saga": "/The_Underworld_Saga.webp",
  "The Thunder Saga": "/The_Thunder_Saga.webp",
  "The Wisdom Saga": "/The_Wisdom_Saga.webp",
  "The Vengeance Saga": "/The_Vengeance_Saga.webp",
  "The Ithaca Saga": "/The_Ithaca_Saga.webp",
};

export const SONG_LIST: Song[] = [
  { name: "The Horse and the Infant", album: "The Troy Saga" },
  { name: "Just a Man", album: "The Troy Saga" },
  { name: "Full Speed Ahead", album: "The Troy Saga" },
  { name: "Open Arms", album: "The Troy Saga" },
  { name: "Warrior of the Mind", album: "The Troy Saga" },

  { name: "Polyphemus", album: "The Cyclops Saga" },
  { name: "Survive", album: "The Cyclops Saga" },
  { name: "Remember Them", album: "The Cyclops Saga" },
  { name: "My Goodbye", album: "The Cyclops Saga" },

  { name: "Storm", album: "The Ocean Saga" },
  { name: "Luck Runs Out", album: "The Ocean Saga" },
  { name: "Keep Your Friends Close", album: "The Ocean Saga" },
  { name: "Ruthlessness", album: "The Ocean Saga" },

  { name: "Puppeteer", album: "The Circe Saga" },
  { name: "Wouldn't You Like", album: "The Circe Saga" },
  { name: "Done For", album: "The Circe Saga" },
  { name: "There Are Other Ways", album: "The Circe Saga" },

  { name: "The Underworld", album: "The Underworld Saga" },
  { name: "No Longer You", album: "The Underworld Saga" },
  { name: "Monster", album: "The Underworld Saga" },

  { name: "Suffering", album: "The Thunder Saga" },
  { name: "Different Beast", album: "The Thunder Saga" },
  { name: "Scylla", album: "The Thunder Saga" },
  { name: "Mutiny", album: "The Thunder Saga" },
  { name: "Thunder Bringer", album: "The Thunder Saga" },

  { name: "Legendary", album: "The Wisdom Saga" },
  { name: "Little Wolf", album: "The Wisdom Saga" },
  { name: "We'll Be Fine", album: "The Wisdom Saga" },
  { name: "Love in Paradise", album: "The Wisdom Saga" },
  { name: "God Games", album: "The Wisdom Saga" },

  { name: "Not Sorry for Loving You", album: "The Vengeance Saga" },
  { name: "Dangerous", album: "The Vengeance Saga" },
  { name: "Charybdis", album: "The Vengeance Saga" },
  { name: "Get in the Water", album: "The Vengeance Saga" },
  { name: "Six Hundred Strike", album: "The Vengeance Saga" },

  { name: "The Challenge", album: "The Ithaca Saga" },
  { name: "Hold Them Down", album: "The Ithaca Saga" },
  { name: "Odysseus", album: "The Ithaca Saga" },
  { name: "I Can't Help but Wonder", album: "The Ithaca Saga" },
  { name: "Would You Fall in Love with Me Again", album: "The Ithaca Saga" },
];
