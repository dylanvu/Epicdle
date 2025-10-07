import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
});

const FONT_CLASS_NAME = cinzel.className;

export { cinzel, FONT_CLASS_NAME };
