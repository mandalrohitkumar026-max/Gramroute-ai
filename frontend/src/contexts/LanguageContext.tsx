import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations, TranslationSchema } from '../i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  speechLocale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'gramroute_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (stored && ['en', 'hi', 'gu'].includes(stored)) {
        return stored;
      }
    } catch {
      // LocalStorage unavailable in sandbox
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const speechLocale = useMemo(() => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    return found ? found.speechLocale : 'en-IN';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speechLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
