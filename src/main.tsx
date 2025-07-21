import React from "react";
import { createRoot } from "react-dom/client";
import { createGlobalStyle } from "styled-components";
import App from "./App";

const GlobalStyle = createGlobalStyle`
      * {
        box-sizing: border-box;
      }
      body {
        font-family: sans-serif;
        font-size: 1rem;
        margin: 0;
      }

`;

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
