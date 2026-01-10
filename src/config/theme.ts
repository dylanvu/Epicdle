"use client";

import { createTheme } from "@mantine/core";

// export const PRIMARY_COLOR = "#4A6572";
export const PRIMARY_COLOR = "#3B7A8C";
export const WRONG_COLOR = "#A55A5A";
export const WIN_COLOR = "#D4AF7F";

export const CONFETTI_COLORS = ["#D4AF7F", "#E08C79", "#7FB3B3"];

export const LEGENDARY_BOTTOM_GRADIENT_COLOR = "#b61e18";

/**
 * This should be the same as in the CSS global file --background color
 */
export const LEGENDARY_TOP_GRADIENT_COLOR = "#1a2428";

export const LEGACY_TOP_GRADIENT_COLOR = "#C9A066"

export const theme = createTheme({
  /* Put your mantine theme override here */
  fontFamily: "'Cinzel', sans-serif",
  focusClassName: "focus",
});
