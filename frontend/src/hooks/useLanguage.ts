import { useState, useEffect } from 'react';

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
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Get browser language
    const browserLanguage = navigator.language || navigator.languages?.[0] || DEFAULT_LANGUAGE;
    
    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = browserLanguage.split('-')[0].toLowerCase();
    
    // Check if we support this language
    const supportedLanguage = LANGUAGES[langCode] || DEFAULT_LANGUAGE;
    
    setLanguage(supportedLanguage);
  }, []);

  return { language, setLanguage };
}