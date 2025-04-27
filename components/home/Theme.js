import { DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FFD93D",
    background: "#2D1B69",
    text: "#FFFFFF",
    chip: "#4A148C",
    chipText: "#FFFFFF",
  },
  fonts: {
    ...DefaultTheme.fonts,
    medium: {
      fontFamily: "System",
      fontWeight: "600",
    },
  },
};
