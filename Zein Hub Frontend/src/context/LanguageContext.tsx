"use client";

import * as React from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/i18n";
import { Language, Direction, translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.ar;
  i18nT: (key: string, options?: any) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "zein_hub_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("ar");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (storedLang === "ar" || storedLang === "en") {
        setLanguageState(storedLang);
        i18n.changeLanguage(storedLang);
      } else {
        i18n.changeLanguage("ar");
      }
    } catch {
      // ignore localstorage errors
    }
    setMounted(true);
  }, []);

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  }, [language, setLanguage]);

  React.useEffect(() => {
    if (mounted && typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction, mounted]);

  const t = translations[language] || translations.ar;

  const i18nT = React.useCallback(
    (key: string, options?: any): string => {
      return String(i18n.t(key, options));
    },
    []
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider
        value={{
          language,
          direction,
          setLanguage,
          toggleLanguage,
          t,
          i18nT,
        }}
      >
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
