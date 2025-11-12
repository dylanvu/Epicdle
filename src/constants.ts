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
    url: "https://youtube.com/embed/bWIgy-Ls-SU?si=h6Y18S42l3e7oJ1B",
  },
  {
    name: "Just a Man",
    album: "The Troy Saga",
    perfect_win_text: "Yeet",
    url: "https://youtube.com/embed/hNdvp9Qo8PA?si=8qVo4zER7hUSRO9b",
  },
  {
    name: "Full Speed Ahead",
    album: "The Troy Saga",
    perfect_win_text: "Sail On",
    url: "https://youtube.com/embed/x3KOt-3T73c?si=vJ-0PnhUG9MammHo",
  },
  {
    name: "Open Arms",
    album: "The Troy Saga",
    perfect_win_text: "Amazing",
    url: "https://youtube.com/embed/-oMZw8DQbaI?si=B7fnHC1mmBWqOLai",
  },
  {
    name: "Warrior of the Mind",
    album: "The Troy Saga",
    perfect_win_text: "Warrior of the Mind",
    url: "https://youtube.com/embed/-oMZw8DQbaI?si=Ycy5vrK0Mm7XOM2Q",
  },
  {
    name: "Polyphemus",
    album: "The Cyclops Saga",
    perfect_win_text: "Cunning",
    url: "https://youtube.com/embed/nDQyFHmuQls?si=JwwlpXPF7xL2EbzV",
  },
  {
    name: "Survive",
    album: "The Cyclops Saga",
    perfect_win_text: "Survived",
    url: "https://youtube.com/embed/rND9-qeA7Lo?si=OzA6Hlneav6-n8uT",
  },
  {
    name: "Remember Them",
    album: "The Cyclops Saga",
    perfect_win_text: "You remembered",
    url: "https://youtube.com/embed/NGxrhdgAg18?si=Eyz3nNKyv6hI04Gn",
  },
  {
    name: "My Goodbye",
    album: "The Cyclops Saga",
    perfect_win_text: "Farewell for Today",
    url: "https://youtube.com/embed/NGxrhdgAg18?si=6ovb7hzE3KLQLQCV",
  },
  {
    name: "Storm",
    album: "The Ocean Saga",
    perfect_win_text: "Unyielding",
    url: "https://youtube.com/embed/sRntPU_s-gI?si=t2DHodf3wBbOaUdN",
  },
  {
    name: "Luck Runs Out",
    album: "The Ocean Saga",
    perfect_win_text: "Luck? Or wit?",
    url: "https://youtube.com/embed/ZxQHl2fVJ-s?si=FXzjyXEvfEcEICnU",
  },
  {
    name: "Keep Your Friends Close",
    album: "The Ocean Saga",
    perfect_win_text: "Outplayed",
    url: "https://youtube.com/embed/ZxQHl2fVJ-s?si=VMoIkZpksoxsPmvg",
  },
  {
    name: "Ruthlessness",
    album: "The Ocean Saga",
    perfect_win_text: "Ruthless",
    url: "https://youtube.com/embed/3dzBlSeCJNg?si=igqrsnt81oIz8go0",
  },
  {
    name: "Puppeteer",
    album: "The Circe Saga",
    perfect_win_text: "Enchanting",
    url: "https://youtube.com/embed/3dzBlSeCJNg?si=kDyLMe8dn1EURAKQ",
  },
  {
    name: "Wouldn't You Like",
    album: "The Circe Saga",
    perfect_win_text: "Holy Moly",
    url: "https://youtube.com/embed/Mz2ASoe6OG0?si=5fKthG8Nw8QlNoFs",
  },
  {
    name: "Done For",
    album: "The Circe Saga",
    perfect_win_text: "Bewitched",
    url: "https://youtube.com/embed/km6NITbLVHc?si=-FZToTE-meG6Mo_c",
  },
  {
    name: "There Are Other Ways",
    album: "The Circe Saga",
    perfect_win_text: "Crew saved",
    url: "https://youtube.com/embed/km6NITbLVHc?si=s6lxJD83cptFHZYg",
  },
  {
    name: "The Underworld",
    album: "The Underworld Saga",
    perfect_win_text: "Haunting",
    url: "https://youtube.com/embed/uXdLAOBANGE?si=gx1LgC9443PjJRbK",
  },
  {
    name: "No Longer You",
    album: "The Underworld Saga",
    perfect_win_text: "Prophetic",
    url: "https://youtube.com/embed/BZ8qL5P270Q?si=DTS8-z99kjee_qz-",
  },
  {
    name: "Monster",
    album: "The Underworld Saga",
    perfect_win_text: "Monstrous",
    url: "https://youtube.com/embed/BZ8qL5P270Q?si=qixRJAA9Wjca0aM1",
  },

  {
    name: "Suffering",
    album: "The Thunder Saga",
    perfect_win_text: "Enthralling",
    url: "https://youtube.com/embed/4Q0Un9PQ0wk?si=I37u1R2_uvLjZKHi",
  },
  {
    name: "Different Beast",
    album: "The Thunder Saga",
    perfect_win_text: "Beastly",
    url: "https://youtube.com/embed/x2r7dKWFbP8?si=IODVkOInwm1qZYGe",
  },
  {
    name: "Scylla",
    album: "The Thunder Saga",
    perfect_win_text: "No one sacrificed",
    url: "https://youtube.com/embed/PTGWC85tLfg?si=AgXegnbCy2gE3kIh",
  },
  {
    name: "Mutiny",
    album: "The Thunder Saga",
    perfect_win_text: "Un-doomed",
    url: "https://youtube.com/embed/x_xJEfDB7y0?si=MqwBwpr2VI3I5bOX",
  },
  {
    name: "Thunder Bringer",
    album: "The Thunder Saga",
    perfect_win_text: "Sublime",
    url: "https://youtube.com/embed/cAId1J7msWI?si=DP499UWSDSG80mYk",
  },

  {
    name: "Legendary",
    album: "The Wisdom Saga",
    perfect_win_text: "Legendary",
    url: "https://youtube.com/embed/Z9NNit-z8wE?si=9xU15hiekgC0eXT8",
  },
  {
    name: "Little Wolf",
    album: "The Wisdom Saga",
    perfect_win_text: "Little Wolf",
    url: "https://youtube.com/embed/-gqU2V1snnc?si=a7MJzTiG4KNt_HBq",
  },
  {
    name: "We'll Be Fine",
    album: "The Wisdom Saga",
    perfect_win_text: "Splendid",
    url: "https://youtube.com/embed/-gqU2V1snnc?si=1zor1vXS0qHM_EIL",
  },
  {
    name: "Love in Paradise",
    album: "The Wisdom Saga",
    perfect_win_text: "Euphoric",
    url: "https://youtube.com/embed/3pIXn3zHkpc?si=ndko90xYZEnEBFZq",
  },
  {
    name: "God Games",
    album: "The Wisdom Saga",
    perfect_win_text: "Game Won",
    url: "https://youtube.com/embed/jWOpikivhbQ?si=IUYLH5802gP0TB9m",
  },

  {
    name: "Not Sorry for Loving You",
    album: "The Vengeance Saga",
    perfect_win_text: "Escaped",
    url: "https://youtube.com/embed/5m3Xe7iDivk?si=75PSTFJ6Z4H1OObB",
  },
  {
    name: "Dangerous",
    album: "The Vengeance Saga",
    perfect_win_text: "Dangerous",
    url: "https://youtube.com/embed/jZW2GnEcjpM?si=dAkQfbHD6Cj_8J_J",
  },
  {
    name: "Charybdis",
    album: "The Vengeance Saga",
    perfect_win_text: "Held on",
    url: "https://youtube.com/embed/4n0U1Erga90?si=NIcp23blYnFYo6LB",
  },
  {
    name: "Get in the Water",
    album: "The Vengeance Saga",
    perfect_win_text: "Tides Turned",
    url: "https://youtube.com/embed/8njnTRKGdYw?si=OUeAD_-eIk3x-jRr",
  },
  {
    name: "Six Hundred Strike",
    album: "The Vengeance Saga",
    perfect_win_text: "Crew avenged",
    url: "https://youtube.com/embed/8njnTRKGdYw?si=JFGdh3zbyoh8tJjI",
  },

  {
    name: "The Challenge",
    album: "The Ithaca Saga",
    perfect_win_text: "Challenge won",
    url: "https://youtube.com/embed/T3rnBuSTNhY?si=lCev1kC6m1TNrIKp",
  },
  {
    name: "Hold Them Down",
    album: "The Ithaca Saga",
    perfect_win_text: "Plot Discovered",
    url: "https://youtube.com/embed/Bb6ssHUxrNk?si=yUxEhoiL5lSDVmg7",
  },
  {
    name: "Odysseus",
    album: "The Ithaca Saga",
    perfect_win_text: "No Mercy",
    url: "https://youtube.com/embed/oeDDZNKHOVo?si=1eD3v6ZJLjfeOu4M",
  },
  {
    name: "I Can't Help but Wonder",
    album: "The Ithaca Saga",
    perfect_win_text: "Reunited",
    url: "https://youtube.com/embed/UjcV3CYfCsM?si=TegweSAU-XDnPG6V",
  },
  {
    name: "Would You Fall in Love with Me Again",
    album: "The Ithaca Saga",
    perfect_win_text: "Penelope",
    url: "https://youtube.com/embed/FBfT0E6oF6I?si=BLg9j4xvq5rDGMR0",
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
