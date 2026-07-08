import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "no" | "en";

const STORAGE_KEY = "language";

const no = {
  appTitle: "Fartskalkulator",
  tabPace: "Kalkuler fart",
  tabDistance: "Kalkuler distanse",
  kmPerHour: "Kilometer i timen",
  milesPerHour: "Miles i timen",
  minutesPerKm: "Minutter pr kilometer",
  secondsPerKm: "Sekunder pr kilometer",
  minutesPerMile: "Minutter pr mile",
  secondsPerMile: "Sekunder pr mile",
  kmhUnit: "km/t",
  mphUnit: "mph",
  hours: "Timer",
  minutes: "Minutter",
  seconds: "Sekunder",
  distanceKm: "Distanse (km)",
  distanceMiles: "Distanse (miles)",
  or: "eller",
  selectDistance: "Velg distanse",
  selectDistanceKm: "Velg distanse (km)",
  selectDistanceMiles: "Velg distanse (miles)",
  customDistance: "Egendefinert distanse",
  predictions: "Prognoser",
  splits: "Mellomtider",
  splitsKm: "Mellomtider (km)",
  splitsMiles: "Mellomtider (miles)",
  predictButton: "Prognoser og mellomtider",
  selectFormula: "Velg formel",
  baseBadge: "Utgangspunkt",
  evenPace: "Jevn fart",
  perKm: "pr km",
  perMile: "pr mile",
  finish: "Mål",
  close: "Lukk",
  decrease: "Reduser",
  increase: "Øk",
  switchToLightTheme: "Bytt til lyst tema",
  switchToDarkTheme: "Bytt til mørkt tema",
  switchLanguage: "Switch to English",
  selectUnits: "Velg enheter",
  unitMetric: "Metrisk",
  unitImperial: "Imperial",
  bothUnits: "Begge",
  /* "Maraton på 03:52:04" */
  dialogTitleConnector: "på",
  milesSuffix: "miles",
  kmSuffix: "km",
  distanceLabels: {
    Marathon: "Maraton",
    "Half-marathon": "Halvmaraton",
  } as Record<string, string>,
};

export type Translation = typeof no;

const en: Translation = {
  appTitle: "Pace Calculator",
  tabPace: "Calculate pace",
  tabDistance: "Calculate distance",
  kmPerHour: "Kilometers per hour",
  milesPerHour: "Miles per hour",
  minutesPerKm: "Minutes per kilometer",
  secondsPerKm: "Seconds per kilometer",
  minutesPerMile: "Minutes per mile",
  secondsPerMile: "Seconds per mile",
  kmhUnit: "km/h",
  mphUnit: "mph",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  distanceKm: "Distance (km)",
  distanceMiles: "Distance (miles)",
  or: "or",
  selectDistance: "Select distance",
  selectDistanceKm: "Select distance (km)",
  selectDistanceMiles: "Select distance (miles)",
  customDistance: "Custom distance",
  predictions: "Predictions",
  splits: "Splits",
  splitsKm: "Splits (km)",
  splitsMiles: "Splits (miles)",
  predictButton: "Predictions and splits",
  selectFormula: "Select formula",
  baseBadge: "Base result",
  evenPace: "Even pace",
  perKm: "per km",
  perMile: "per mile",
  finish: "Finish",
  close: "Close",
  decrease: "Decrease",
  increase: "Increase",
  switchToLightTheme: "Switch to light theme",
  switchToDarkTheme: "Switch to dark theme",
  switchLanguage: "Bytt til norsk",
  selectUnits: "Select units",
  unitMetric: "Metric",
  unitImperial: "Imperial",
  bothUnits: "Both",
  /* "Marathon in 03:52:04" */
  dialogTitleConnector: "in",
  milesSuffix: "miles",
  kmSuffix: "km",
  distanceLabels: {},
};

const translations: Record<Language, Translation> = { no, en };

const isLanguage = (value: string | null): value is Language =>
  value === "no" || value === "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
  /* Race names in units.ts are stored in English; this resolves them in the
     active language. */
  distanceLabel: (label: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : "no";
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (next: Language) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        distanceLabel: (label) => t.distanceLabels[label] ?? label,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
