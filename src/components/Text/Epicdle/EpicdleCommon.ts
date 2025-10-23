import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const FONT_CLASS_NAME = cinzel.className;

export { cinzel, FONT_CLASS_NAME };
