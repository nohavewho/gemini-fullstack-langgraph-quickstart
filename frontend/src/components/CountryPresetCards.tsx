import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const getPresetCards = (t: (key: string) => string) => [
  {
    id: "azerbaijan_focus",
    title: t('neighboring_countries'),
    subtitle: t('neighboring_desc'),
    icon: "🏛️",
    bgColor: "from-red-100 to-red-200",
    borderColor: "border-red-300",
    iconBg: "bg-red-500",
    countries: ["TR", "RU", "IR", "GE"]
  },
  {
    id: "european_press",
    title: t('european_press'),
    subtitle: t('european_desc'),
    icon: "🇪🇺",
    bgColor: "from-blue-100 to-blue-200", 
    borderColor: "border-blue-300",
    iconBg: "bg-blue-500",
    countries: ["DE", "FR", "IT", "ES", "NL", "PL"]
  },
  {
    id: "usa_media",
    title: t('usa_media'),
    subtitle: t('usa_desc'),
    icon: "🇺🇸",
    bgColor: "from-green-100 to-green-200",
    borderColor: "border-green-300", 
    iconBg: "bg-green-500",
    countries: ["US"]
  },
  {
    id: "arabic_world",
    title: t('arabic_world'),
    subtitle: t('arabic_desc'),
    icon: "🕌",
    bgColor: "from-yellow-100 to-yellow-200",
    borderColor: "border-yellow-300",
    iconBg: "bg-yellow-500",
    countries: ["SA", "AE", "QA", "EG", "JO"]
  },
  {
    id: "energy_sector",
    title: t('energy_sector'),
    subtitle: t('energy_desc'),
    icon: "⚡",
    bgColor: "from-purple-100 to-purple-200",
    borderColor: "border-purple-300",
    iconBg: "bg-purple-500",
    countries: ["NO", "KZ", "SA", "RU", "US"]
  },
  {
    id: "global_media",
    title: t('global_media'),
    subtitle: t('global_desc'),
    icon: "🌍",
    bgColor: "from-indigo-100 to-indigo-200",
    borderColor: "border-indigo-300",
    iconBg: "bg-indigo-500",
    countries: ["US", "GB", "DE", "FR", "CN", "JP"]
  },
  {
    id: "asian_markets",
    title: t('asian_markets'),
    subtitle: t('asian_desc'),
    icon: "🏮",
    bgColor: "from-orange-100 to-orange-200", 
    borderColor: "border-orange-300",
    iconBg: "bg-orange-500",
    countries: ["CN", "JP", "IN", "KR", "SG"]
  },
  {
    id: "custom_analysis",
    title: t('custom_analysis'),
    subtitle: t('custom_desc'),
    icon: "✏️",
    bgColor: "from-gray-100 to-gray-200",
    borderColor: "border-gray-300", 
    iconBg: "bg-gray-500",
    countries: []
  }
];

interface CountryPresetCardsProps {
  selectedPreset: string;
  onPresetSelect: (presetId: string, countries: string[]) => void;
}

export function CountryPresetCards({ selectedPreset, onPresetSelect }: CountryPresetCardsProps) {
  const { t } = useTranslation();
  const presetCards = getPresetCards(t);
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('quick_templates')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {presetCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onPresetSelect(card.id, card.countries)}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg
              bg-gradient-to-br ${card.bgColor} ${card.borderColor}
              ${selectedPreset === card.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              <span className="text-white text-lg">{card.icon}</span>
            </div>
            
            {/* Content */}
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 leading-tight">
                {card.title}
              </h3>
              <p className="text-gray-600 text-xs leading-tight">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}