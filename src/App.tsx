import React from "react";
import styled from "styled-components";
import { PaceCalculator } from "./views/PaceCalculator";
import { useTheme } from "./theme/useTheme";
import { MoonIcon } from "./icons/Moon";
import { SunIcon } from "./icons/Sun";
import { SegmentedControl } from "./components/SegmentedControl";
import { UnitMode, useUnitMode } from "./units/useUnitMode";
import { useTranslation } from "./i18n/i18n";

const Main = styled.main`
  /* Lock the app to the visible viewport; overflow scrolls inside the
     card instead of the page. dvh tracks iOS Safari's collapsing bars. */
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 12px;

  /* Edge to edge on small screens; the header keeps its own gutter. */
  @media (max-width: 560px) {
    padding: 0;
  }
`;

/* The h1 exists for SEO and screen readers; visually the toolbar is the
   header. */
const VisuallyHiddenTitle = styled.h1`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

const Header = styled.header`
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0 12px;

  @media (max-width: 560px) {
    padding: 12px 16px;
  }
`;

const UnitControl = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoundButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--color-surface-alt);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
`;

function App() {
  const { theme, toggleTheme } = useTheme();
  const { unitMode, setUnitMode } = useUnitMode();
  const { language, setLanguage, t } = useTranslation();

  const unitModeOptions: Array<{ value: UnitMode; label: string }> = [
    { value: "km", label: t.unitMetric },
    { value: "miles", label: t.unitImperial },
    { value: "both", label: t.bothUnits },
  ];

  return (
    <Main>
      <VisuallyHiddenTitle>{t.appTitle}</VisuallyHiddenTitle>
      <Header>
        <UnitControl>
          <SegmentedControl
            ariaLabel={t.selectUnits}
            options={unitModeOptions}
            value={unitMode}
            onChange={setUnitMode}
          />
        </UnitControl>
        <RoundButton
          type="button"
          onClick={() => setLanguage(language === "no" ? "en" : "no")}
          aria-label={t.switchLanguage}
        >
          {language === "no" ? "EN" : "NO"}
        </RoundButton>
        <RoundButton
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? t.switchToLightTheme : t.switchToDarkTheme
          }
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </RoundButton>
      </Header>
      <PaceCalculator unitMode={unitMode} />
    </Main>
  );
}

export default App;
