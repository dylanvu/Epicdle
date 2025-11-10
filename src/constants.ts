import { Song } from "./interfaces/interfaces";

/**
 * The maximum number of guesses the user can make, inclusive
 */
export const MAX_GUESSES = 6;

/**
 * How many seconds each segment is
 */
export const SECONDS_PER_GUESS = 0.5;

/**
 * IANA time zone identifier
 * Some other ones:
 * "America/New_York"	Eastern Time (US & Canada)
 * "America/Chicago"	Central Time (US & Canada)
 * "America/Denver"	Mountain Time (US & Canada)
 * "America/Los_Angeles"	Pacific Time (US & Canada)
 *
 * Pheonix is used here because there is no daylight savings time and I really don't want to deal with that HAHAHAHA
 */
export const RESET_TIMEZONE = "America/Phoenix";

const ASSET_BASE_PATH = "";

export const ALBUM_NAME_TO_COVER_MAP: Record<string, string> = {
  "The Troy Saga": `${ASSET_BASE_PATH}/The_Troy_Saga.webp`,
  "The Cyclops Saga": `${ASSET_BASE_PATH}/The_Cyclops_Saga.webp`,
  "The Ocean Saga": `${ASSET_BASE_PATH}/The_Ocean_Saga.webp`,
  "The Circe Saga": `${ASSET_BASE_PATH}/The_Circe_Saga.webp`,
  "The Underworld Saga": `${ASSET_BASE_PATH}/The_Underworld_Saga.webp`,
  "The Thunder Saga": `${ASSET_BASE_PATH}/The_Thunder_Saga.webp`,
  "The Wisdom Saga": `${ASSET_BASE_PATH}/The_Wisdom_Saga.webp`,
  "The Vengeance Saga": `${ASSET_BASE_PATH}/The_Vengeance_Saga.webp`,
  "The Ithaca Saga": `${ASSET_BASE_PATH}/The_Ithaca_Saga.webp`,
};

export const SONG_LIST: Song[] = [
  {
    name: "The Horse and the Infant",
    album: "The Troy Saga",
    perfect_win_text: "Conquered",
  },
  { name: "Just a Man", album: "The Troy Saga", perfect_win_text: "Yeet" },
  {
    name: "Full Speed Ahead",
    album: "The Troy Saga",
    perfect_win_text: "Sail On",
  },
  { name: "Open Arms", album: "The Troy Saga", perfect_win_text: "Amazing" },
  {
    name: "Warrior of the Mind",
    album: "The Troy Saga",
    perfect_win_text: "Warrior of the Mind",
  },

  {
    name: "Polyphemus",
    album: "The Cyclops Saga",
    perfect_win_text: "Cunning",
  },
  { name: "Survive", album: "The Cyclops Saga", perfect_win_text: "Survived" },
  {
    name: "Remember Them",
    album: "The Cyclops Saga",
    perfect_win_text: "You remembered",
  },
  {
    name: "My Goodbye",
    album: "The Cyclops Saga",
    perfect_win_text: "Farewell for Today",
  },

  { name: "Storm", album: "The Ocean Saga", perfect_win_text: "Unyielding" },
  {
    name: "Luck Runs Out",
    album: "The Ocean Saga",
    perfect_win_text: "Luck? Or wit?",
  },
  {
    name: "Keep Your Friends Close",
    album: "The Ocean Saga",
    perfect_win_text: "Outplayed",
  },
  {
    name: "Ruthlessness",
    album: "The Ocean Saga",
    perfect_win_text: "Ruthless",
  },

  {
    name: "Puppeteer",
    album: "The Circe Saga",
    perfect_win_text: "Enchanting",
  },
  {
    name: "Wouldn't You Like",
    album: "The Circe Saga",
    perfect_win_text: "Holy Moly",
  },
  {
    name: "Done For",
    album: "The Circe Saga",
    perfect_win_text: "Bewitched",
  },
  {
    name: "There Are Other Ways",
    album: "The Circe Saga",
    perfect_win_text: "Crew saved",
  },
  {
    name: "The Underworld",
    album: "The Underworld Saga",
    perfect_win_text: "Haunting",
  },
  {
    name: "No Longer You",
    album: "The Underworld Saga",
    perfect_win_text: "Prophetic",
  },
  {
    name: "Monster",
    album: "The Underworld Saga",
    perfect_win_text: "Monstrous",
  },

  {
    name: "Suffering",
    album: "The Thunder Saga",
    perfect_win_text: "Enthralling",
  },
  {
    name: "Different Beast",
    album: "The Thunder Saga",
    perfect_win_text: "Beastly",
  },
  {
    name: "Scylla",
    album: "The Thunder Saga",
    perfect_win_text: "Escaped Scylla",
  },
  { name: "Mutiny", album: "The Thunder Saga", perfect_win_text: "Un-doomed" },
  {
    name: "Thunder Bringer",
    album: "The Thunder Saga",
    perfect_win_text: "Sublime",
  },

  {
    name: "Legendary",
    album: "The Wisdom Saga",
    perfect_win_text: "Legendary",
  },
  {
    name: "Little Wolf",
    album: "The Wisdom Saga",
    perfect_win_text: "Little Wolf",
  },
  {
    name: "We'll Be Fine",
    album: "The Wisdom Saga",
    perfect_win_text: "Splendid",
  },
  {
    name: "Love in Paradise",
    album: "The Wisdom Saga",
    perfect_win_text: "Euphoric",
  },
  {
    name: "God Games",
    album: "The Wisdom Saga",
    perfect_win_text: "Game Won",
  },

  {
    name: "Not Sorry for Loving You",
    album: "The Vengeance Saga",
    perfect_win_text: "Escaped",
  },
  {
    name: "Dangerous",
    album: "The Vengeance Saga",
    perfect_win_text: "Dangerous",
  },
  {
    name: "Charybdis",
    album: "The Vengeance Saga",
    perfect_win_text: "Held on",
  },
  {
    name: "Get in the Water",
    album: "The Vengeance Saga",
    perfect_win_text: "Tides Turned",
  },
  {
    name: "Six Hundred Strike",
    album: "The Vengeance Saga",
    perfect_win_text: "Crew avenged",
  },

  {
    name: "The Challenge",
    album: "The Ithaca Saga",
    perfect_win_text: "Challenge won",
  },
  {
    name: "Hold Them Down",
    album: "The Ithaca Saga",
    perfect_win_text: "Plot Discovered",
  },
  {
    name: "Odysseus",
    album: "The Ithaca Saga",
    perfect_win_text: "Kingdom recovered",
  },
  {
    name: "I Can't Help but Wonder",
    album: "The Ithaca Saga",
    perfect_win_text: "Reunited",
  },
  {
    name: "Would You Fall in Love with Me Again",
    album: "The Ithaca Saga",
    perfect_win_text: "Penelope",
  },
];

/**
 * The name of the collection in the Firestore database, the Google storage folder name, and the Cloudflare CDN R2 bucket (cannot use underscores)
 */
export const FIREBASE_DATABASE_COLLECTION_NAME = "epic-the-musical";

export const FIREBASE_DATABASE_COLLECTION_NAME_INSTRUMENTAL_MODE =
  "epic-the-musical-instrumental";

/**
 * The name of the Firebase Storage bucket
 * https://firebase.google.com/docs/storage/web/start#add-sdk-and-initialize
 */
export const FIREBASE_STORAGE_BUCKET_NAME = "epicdle.firebasestorage.app";

export const SUPPORT_EMAIL = "epicdle.game@gmail.com";

export const RESET_HOUR_UTC = 7;

export const GAME_URL = "https://epicdle.com";

export const GAME_API_BASE_ENDPOINT = "/api/game";
