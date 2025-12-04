import { createTheme } from "@mui/material/styles";
import { STAFFANY_COLORS } from "./colors";

declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      navy: string;
      navy_hover: string;

      red: string;
      red_hover: string;

      turquoise: string;
      turquoise_hover: string;

      white: string;
    };
  }
  interface ThemeOptions {
    customColors?: {
      navy: string;
      red: string;
      turquoise: string;

      navy_hover: string;
      red_hover: string;
      turquoise_hover: string;

      white: string;
    };
  }
}

export const staffanyTheme = createTheme({
  palette: {
    primary: {
      main: STAFFANY_COLORS.NAVY,
    },
    secondary: {
      main: STAFFANY_COLORS.RED,
      contrastText: STAFFANY_COLORS.WHITE,
    },
    error: {
      main: STAFFANY_COLORS.RED,
    },
    success: {
      main: STAFFANY_COLORS.TURQOISE,
    },
  },
  customColors: {
    navy: STAFFANY_COLORS.NAVY,
    red: STAFFANY_COLORS.RED,
    turquoise: STAFFANY_COLORS.TURQOISE,

    navy_hover: STAFFANY_COLORS.NAVY_HOVER,
    red_hover: STAFFANY_COLORS.RED_HOVER,
    turquoise_hover: STAFFANY_COLORS.TURQOISE_HOVER,

    white: STAFFANY_COLORS.WHITE,
  },
});
