export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  az: { name: 'Azərbaycan', flag: '🇦🇿' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  tr: { name: 'Türkçe', flag: '🇹🇷' }
};

export const COUNTRIES = [
  // Target countries (can be monitored)
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  
  // Neighboring countries
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  
  // Central Asia
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  
  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  
  // Middle East & North Africa
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  
  // Asia-Pacific
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  
  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' }
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
    id: 'turkic_world',
    name: 'Turkic World',
    icon: '🌙',
    description: 'Turkey & Central Asia',
    countries: ['TR', 'KZ', 'UZ', 'KG', 'TM']
  },
  {
    id: 'central_asia',
    name: 'Central Asia',
    icon: '🏔️',
    description: 'Kazakhstan, Uzbekistan, Kyrgyzstan',
    countries: ['KZ', 'UZ', 'KG', 'TJ', 'TM']
  },
  {
    id: 'caspian_states',
    name: 'Caspian States',
    icon: '⚓',
    description: 'Caspian Sea neighbors',
    countries: ['RU', 'IR', 'KZ', 'TM']
  },
  {
    id: 'european_union',
    name: 'European Union',
    icon: '🇪🇺',
    description: 'Major EU countries',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL']
  },
  {
    id: 'eastern_europe',
    name: 'Eastern Europe',
    icon: '🏰',
    description: 'Poland, Romania, Ukraine',
    countries: ['PL', 'RO', 'UA', 'BG', 'HU']
  },
  {
    id: 'nordic_baltic',
    name: 'Nordic+Baltic',
    icon: '❄️',
    description: 'Nordics and Baltics',
    countries: ['SE', 'NO', 'FI', 'DK']
  },
  {
    id: 'gulf_states',
    name: 'Gulf States',
    icon: '🕌',
    description: 'GCC countries',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH']
  },
  {
    id: 'arabic_world',
    name: 'Arabic World',
    icon: '🌴',
    description: 'Arab media coverage',
    countries: ['SA', 'EG', 'JO', 'LB', 'MA']
  },
  {
    id: 'brics',
    name: 'BRICS',
    icon: '💎',
    description: 'BRICS nations',
    countries: ['BR', 'RU', 'IN', 'CN', 'ZA']
  },
  {
    id: 'global_powers',
    name: 'Global Powers',
    icon: '🌍',
    description: 'USA, China, Russia',
    countries: ['US', 'CN', 'RU', 'GB']
  },
  {
    id: 'post_soviet',
    name: 'Post-Soviet',
    icon: '⭐',
    description: 'Former USSR states',
    countries: ['RU', 'UA', 'KZ', 'GE', 'AM']
  }
];