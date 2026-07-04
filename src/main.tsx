import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GlobalStyle } from "./theme/GlobalStyle";
import { applyTheme, getPreferredTheme } from "./theme/useTheme";

// Apply the theme before the first paint to avoid a light-mode flash.
applyTheme(getPreferredTheme());

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
