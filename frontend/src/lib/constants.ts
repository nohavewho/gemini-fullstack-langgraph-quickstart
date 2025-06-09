export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  az: { name: 'Azərbaycan', flag: '🇦🇿' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  tr: { name: 'Türkçe', flag: '🇹🇷' }
};

export const COUNTRIES = [
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' }
];

export const PRESET_GROUPS = [
  {
    id: 'neighboring_countries',
    name: 'Neighboring Countries',
    icon: '🏛️',
    description: 'Turkey, Russia, Iran, Georgia, Armenia',
    countries: ['TR', 'RU', 'IR', 'GE', 'AM']
  },
  {
    id: 'european_union',
    name: 'European Union',
    icon: '🇪🇺',
    description: 'Major EU countries press coverage',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL']
  },
  {
    id: 'usa_media',
    name: 'USA Media',
    icon: '🇺🇸',
    description: 'American press and media outlets',
    countries: ['US']
  },
  {
    id: 'arabic_world',
    name: 'Arabic World',
    icon: '🕌',
    description: 'Middle Eastern press coverage',
    countries: ['SA', 'AE', 'EG', 'JO', 'KW']
  },
  {
    id: 'global_powers',
    name: 'Global Powers',
    icon: '🌍',
    description: 'USA, China, Russia, UK',
    countries: ['US', 'CN', 'RU', 'GB']
  },
  {
    id: 'asian_markets',
    name: 'Asian Markets',
    icon: '🏮',
    description: 'China, Japan, India, South Korea',
    countries: ['CN', 'JP', 'IN', 'KR']
  }
];