import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;

    --color-bg: #f4f5f7;
    --color-surface: #ffffff;
    --color-surface-alt: #e9eaee;
    --color-surface-alt-hover: #dee0e6;
    --color-surface-alt-active: #d1d4dc;
    --color-text: #1c1e22;
    --color-text-muted: #5f6672;
    --color-border: #d4d7dd;

    --color-primary: #6200ee;
    --color-primary-soft: rgba(98, 0, 238, 0.1);
    --color-primary-softer: rgba(98, 0, 238, 0.05);
    --color-focus-ring: #6200ee;

    --radius-sm: 8px;
    --radius-md: 14px;
    --shadow-sm: 0 1px 2px rgba(16, 18, 24, 0.06), 0 4px 16px rgba(16, 18, 24, 0.08);
  }

  [data-theme="dark"] {
    color-scheme: dark;

    --color-bg: #101216;
    --color-surface: #181b21;
    --color-surface-alt: #242830;
    --color-surface-alt-hover: #2d323c;
    --color-surface-alt-active: #363c48;
    --color-text: #e8eaee;
    --color-text-muted: #9aa2ad;
    --color-border: #333945;

    --color-primary: #a98eff;
    --color-primary-soft: rgba(169, 142, 255, 0.16);
    --color-primary-softer: rgba(169, 142, 255, 0.08);
    --color-focus-ring: #a98eff;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  * {
    box-sizing: border-box;
  }

  html {
    /* The ripple/flash on tap fights the components' own pressed states. */
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 1rem;
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    transition: background-color 0.25s ease, color 0.25s ease;
    /* No pull-to-refresh/rubber-banding behind the locked app viewport. */
    overscroll-behavior-y: none;
  }

  button,
  input,
  select {
    font-family: inherit;
  }
`;
