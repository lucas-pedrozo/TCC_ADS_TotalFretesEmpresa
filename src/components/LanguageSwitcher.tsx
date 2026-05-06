import { useState } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { SUPPORTED_LANGUAGES, type AppLanguage } from "@/i18n/resources";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleChangeLanguage = async (nextLanguage: AppLanguage) => {
    await changeLanguage(nextLanguage);
    setIsOpen(false);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className="relative">
        {isOpen && (
          <div className="absolute right-0 bottom-12 w-44 rounded-md border border-stone-200 bg-white shadow-lg">
            {SUPPORTED_LANGUAGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => void handleChangeLanguage(option)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-stone-100 ${
                  option === language ? "font-semibold text-black" : "text-stone-700"
                }`}
              >
                {t(`switcher.${option}`)}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg hover:bg-stone-800"
          aria-label={t("common.language")}
        >
          <Languages size={16} />
          <span>{language}</span>
        </button>
      </div>
    </div>
  );
}
