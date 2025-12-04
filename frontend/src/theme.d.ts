import { Theme } from "@mui/material/styles";

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
      navy_hover: string;
      red: string;
      red_hover: string;
      turquoise: string;
      turquoise_hover: string;

      white: string;
    };
  }
}
