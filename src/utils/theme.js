// theme.js
import { DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4A90E2",
    accent: "#50E3C2",
    background: "#F7F9FC",
    surface: "#FFFFFF",
    text: "#333333",
    error: "#FF6B6B",
    disabled: "#BDBDBD",
    placeholder: "#9E9E9E",
    backdrop: "rgba(0, 0, 0, 0.5)",
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export default theme;
