import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' },
  { code: 'az', name: 'AZ', flag: '🇦🇿' },
  { code: 'tr', name: 'TR', flag: '🇹🇷' }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1">
      {LANGUAGE_OPTIONS.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className={`
            px-2 py-1 text-xs transition-all duration-200
            ${language === lang.code 
              ? 'bg-[#ffd700] text-[#003d5c] hover:bg-[#ffd700]/90 border-[#ffd700]'
              : 'bg-[#003d5c]/80 border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/20'
            }
          `}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </Button>
      ))}
    </div>
  );
}