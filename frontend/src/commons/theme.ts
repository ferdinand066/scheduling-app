import { createTheme } from "@mui/material/styles";
import { STAFFANY_COLORS } from "./colors";

declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      navy: string;
      red: string;
      turquoise: string;
    };
  }
  interface ThemeOptions {
    customColors?: {
      navy: string;
      red: string;
      turquoise: string;
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
      contrastText: "white",
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
  },
});
