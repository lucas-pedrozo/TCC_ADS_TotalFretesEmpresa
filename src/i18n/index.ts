import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, resources, SUPPORTED_LANGUAGES, type AppLanguage } from "./resources";

function normalizeLanguage(language: string | null | undefined): AppLanguage {
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  if (SUPPORTED_LANGUAGES.includes(language as AppLanguage)) {
    return language as AppLanguage;
  }

  const languageCode = language.split("-")[0]?.toLowerCase();
  return languageCode === "en" ? "en" : DEFAULT_LANGUAGE;
}

const initialLanguage = normalizeLanguage(
  typeof window !== "undefined" ? window.localStorage.getItem("app_language") ?? window.navigator.language : DEFAULT_LANGUAGE
);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export { normalizeLanguage };
export default i18n;
