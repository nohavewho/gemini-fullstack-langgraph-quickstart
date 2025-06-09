import { useState } from 'react';

// Language mappings
const LANGUAGES = {
  'en': 'en',
  'ru': 'ru',
  'az': 'az',
  'tr': 'tr',
  'ar': 'ar',
  'de': 'de',
  'fr': 'fr',
  'es': 'es'
};

// Fallback language
const DEFAULT_LANGUAGE = 'en';

export function useLanguage() {
  const [language, setLanguageState] = useState<string>(() => {
    // First try to get from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
    
    // Otherwise use browser language
    const browserLanguage = navigator.language || navigator.languages?.[0] || DEFAULT_LANGUAGE;
    const langCode = browserLanguage.split('-')[0].toLowerCase();
    const supportedLanguage = LANGUAGES[langCode] || DEFAULT_LANGUAGE;
    
    // Save to localStorage
    localStorage.setItem('preferredLanguage', supportedLanguage);
    return supportedLanguage;
  });

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  return { language, setLanguage };
}