"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import "@fontsource/dancing-script";
import "@fontsource/inter";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    logo: React.CSSProperties; // Add 'logo' variant
  }

  // Allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    logo?: React.CSSProperties; // Add 'logo' variant
  }
}

// Update Typography's `variant` prop to include 'logo'
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    logo: true;
  }
}

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "light", /// default dark style applied
      primary: {
        main: "#f44336",
      },
      secondary: {
        main: "#ff1744",
      },
    },
    typography: {
      fontFamily: "Inter, Roboto, Arial, sans-serif", // Global font
      logo: {
        fontFamily: "Dancing Script, cursive", // Use Dancing Script for logo
        fontSize: "2rem",
        fontWeight: "bold",
      },
    },
  })
);
export default theme;
