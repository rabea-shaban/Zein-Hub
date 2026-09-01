'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

const resources = {
  ar: {
    translation: arTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// Check stored language or default to Arabic
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('zein_language');
    if (saved === 'ar' || saved === 'en') return saved;
  }
  return 'ar';
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // React already escapes values safely
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
