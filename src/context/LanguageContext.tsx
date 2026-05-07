import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "@/i18n";
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
  const { i18n: i18nInstance } = useTranslation();

  const [language, setLanguage] = useState<AppLanguage>(() =>
    normalizeLanguage(i18nInstance.language)
  );

  useEffect(() => {
    const syncFromI18n = (lng: string) => {
      setLanguage(normalizeLanguage(lng));
    };

    syncFromI18n(i18nInstance.language);
    i18nInstance.on("languageChanged", syncFromI18n);
    return () => {
      i18nInstance.off("languageChanged", syncFromI18n);
    };
  }, [i18nInstance]);

  const changeLanguage = useCallback(
    async (nextLanguage: AppLanguage) => {
      await i18nInstance.changeLanguage(nextLanguage);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    },
    [i18nInstance]
  );

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
