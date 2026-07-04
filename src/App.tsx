import React from "react";
import styled from "styled-components";
import { PaceCalculator } from "./views/PaceCalculator";
import { useTheme } from "./theme/useTheme";
import { MoonIcon } from "./icons/Moon";
import { SunIcon } from "./icons/Sun";

const Main = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 48px;
`;

const Header = styled.header`
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: -0.01em;
`;

const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: var(--color-surface-alt);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
`;

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Main>
      <Header>
        <Title>Pace Calculator</Title>
        <ThemeToggle
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Bytt til lyst tema" : "Bytt til mørkt tema"
          }
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </ThemeToggle>
      </Header>
      <PaceCalculator />
    </Main>
  );
}

export default App;
