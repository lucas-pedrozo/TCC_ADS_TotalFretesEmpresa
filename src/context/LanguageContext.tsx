import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLanguage } from "@/i18n";
import { DEFAULT_LANGUAGE, type AppLanguage } from "@/i18n/resources";

const LANGUAGE_STORAGE_KEY = "app_language";

type LanguageContextData = {
  language: AppLanguage;
  changeLanguage: (language: AppLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextData | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  useTranslation();

  const language = normalizeLanguage(i18n.language);

  const changeLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    await i18n.changeLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const value = useMemo(
    () => ({
      language: language ?? DEFAULT_LANGUAGE,
      changeLanguage,
    }),
    [language, changeLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
