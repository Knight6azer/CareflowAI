import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/languages';
import { TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('careflow_language');
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('careflow_language', langCode);
      } catch {
        // ignore
      }
    }
  };

  // Helper to resolve nested keys like "home.hero.title"
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    
    // 1. Try current language
    let current = TRANSLATIONS[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && current !== null) {
      return current;
    }

    // 2. Try default English fallback
    let defaultLang = TRANSLATIONS[DEFAULT_LANGUAGE];
    for (const key of keys) {
      if (defaultLang && typeof defaultLang === 'object' && key in defaultLang) {
        defaultLang = defaultLang[key];
      } else {
        defaultLang = undefined;
        break;
      }
    }

    if (defaultLang !== undefined && defaultLang !== null) {
      return defaultLang;
    }

    return fallback || path;
  };

  const currentLanguageObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES, currentLanguageObj }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

