import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Globe, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { cn } from '../lib/utils';

// Country data with regions
export const COUNTRIES = {
  // Europe
  "AL": { name: "Albania", region: "Europe" },
  "AD": { name: "Andorra", region: "Europe" },
  "AM": { name: "Armenia", region: "Caucasus" },
  "AT": { name: "Austria", region: "Europe" },
  "AZ": { name: "Azerbaijan", region: "Caucasus" },
  "BY": { name: "Belarus", region: "Europe" },
  "BE": { name: "Belgium", region: "Europe" },
  "BA": { name: "Bosnia and Herzegovina", region: "Europe" },
  "BG": { name: "Bulgaria", region: "Europe" },
  "HR": { name: "Croatia", region: "Europe" },
  "CY": { name: "Cyprus", region: "Europe" },
  "CZ": { name: "Czech Republic", region: "Europe" },
  "DK": { name: "Denmark", region: "Europe" },
  "EE": { name: "Estonia", region: "Europe" },
  "FI": { name: "Finland", region: "Europe" },
  "FR": { name: "France", region: "Europe" },
  "GE": { name: "Georgia", region: "Caucasus" },
  "DE": { name: "Germany", region: "Europe" },
  "GR": { name: "Greece", region: "Europe" },
  "HU": { name: "Hungary", region: "Europe" },
  "IS": { name: "Iceland", region: "Europe" },
  "IE": { name: "Ireland", region: "Europe" },
  "IT": { name: "Italy", region: "Europe" },
  "KZ": { name: "Kazakhstan", region: "Central Asia" },
  "XK": { name: "Kosovo", region: "Europe" },
  "LV": { name: "Latvia", region: "Europe" },
  "LI": { name: "Liechtenstein", region: "Europe" },
  "LT": { name: "Lithuania", region: "Europe" },
  "LU": { name: "Luxembourg", region: "Europe" },
  "MK": { name: "North Macedonia", region: "Europe" },
  "MT": { name: "Malta", region: "Europe" },
  "MD": { name: "Moldova", region: "Europe" },
  "MC": { name: "Monaco", region: "Europe" },
  "ME": { name: "Montenegro", region: "Europe" },
  "NL": { name: "Netherlands", region: "Europe" },
  "NO": { name: "Norway", region: "Europe" },
  "PL": { name: "Poland", region: "Europe" },
  "PT": { name: "Portugal", region: "Europe" },
  "RO": { name: "Romania", region: "Europe" },
  "RU": { name: "Russia", region: "Europe" },
  "SM": { name: "San Marino", region: "Europe" },
  "RS": { name: "Serbia", region: "Europe" },
  "SK": { name: "Slovakia", region: "Europe" },
  "SI": { name: "Slovenia", region: "Europe" },
  "ES": { name: "Spain", region: "Europe" },
  "SE": { name: "Sweden", region: "Europe" },
  "CH": { name: "Switzerland", region: "Europe" },
  "TR": { name: "Turkey", region: "Middle East" },
  "UA": { name: "Ukraine", region: "Europe" },
  "GB": { name: "United Kingdom", region: "Europe" },
  "VA": { name: "Vatican City", region: "Europe" },
  
  // Asia
  "AF": { name: "Afghanistan", region: "Central Asia" },
  "BH": { name: "Bahrain", region: "Middle East" },
  "BD": { name: "Bangladesh", region: "South Asia" },
  "BT": { name: "Bhutan", region: "South Asia" },
  "BN": { name: "Brunei", region: "Southeast Asia" },
  "KH": { name: "Cambodia", region: "Southeast Asia" },
  "CN": { name: "China", region: "East Asia" },
  "IN": { name: "India", region: "South Asia" },
  "ID": { name: "Indonesia", region: "Southeast Asia" },
  "IR": { name: "Iran", region: "Middle East" },
  "IQ": { name: "Iraq", region: "Middle East" },
  "IL": { name: "Israel", region: "Middle East" },
  "JP": { name: "Japan", region: "East Asia" },
  "JO": { name: "Jordan", region: "Middle East" },
  "KW": { name: "Kuwait", region: "Middle East" },
  "KG": { name: "Kyrgyzstan", region: "Central Asia" },
  "LA": { name: "Laos", region: "Southeast Asia" },
  "LB": { name: "Lebanon", region: "Middle East" },
  "MY": { name: "Malaysia", region: "Southeast Asia" },
  "MV": { name: "Maldives", region: "South Asia" },
  "MN": { name: "Mongolia", region: "East Asia" },
  "MM": { name: "Myanmar", region: "Southeast Asia" },
  "NP": { name: "Nepal", region: "South Asia" },
  "KP": { name: "North Korea", region: "East Asia" },
  "OM": { name: "Oman", region: "Middle East" },
  "PK": { name: "Pakistan", region: "South Asia" },
  "PS": { name: "Palestine", region: "Middle East" },
  "PH": { name: "Philippines", region: "Southeast Asia" },
  "QA": { name: "Qatar", region: "Middle East" },
  "SA": { name: "Saudi Arabia", region: "Middle East" },
  "SG": { name: "Singapore", region: "Southeast Asia" },
  "KR": { name: "South Korea", region: "East Asia" },
  "LK": { name: "Sri Lanka", region: "South Asia" },
  "SY": { name: "Syria", region: "Middle East" },
  "TW": { name: "Taiwan", region: "East Asia" },
  "TJ": { name: "Tajikistan", region: "Central Asia" },
  "TH": { name: "Thailand", region: "Southeast Asia" },
  "TL": { name: "Timor-Leste", region: "Southeast Asia" },
  "TM": { name: "Turkmenistan", region: "Central Asia" },
  "AE": { name: "United Arab Emirates", region: "Middle East" },
  "UZ": { name: "Uzbekistan", region: "Central Asia" },
  "VN": { name: "Vietnam", region: "Southeast Asia" },
  "YE": { name: "Yemen", region: "Middle East" },
  
  // Americas
  "US": { name: "United States", region: "North America" },
  "CA": { name: "Canada", region: "North America" },
  "MX": { name: "Mexico", region: "North America" },
  "BR": { name: "Brazil", region: "South America" },
  "AR": { name: "Argentina", region: "South America" },
  "CL": { name: "Chile", region: "South America" },
  "CO": { name: "Colombia", region: "South America" },
  "PE": { name: "Peru", region: "South America" },
  "VE": { name: "Venezuela", region: "South America" },
  "EC": { name: "Ecuador", region: "South America" },
  "BO": { name: "Bolivia", region: "South America" },
  "PY": { name: "Paraguay", region: "South America" },
  "UY": { name: "Uruguay", region: "South America" },
  "GY": { name: "Guyana", region: "South America" },
  "SR": { name: "Suriname", region: "South America" },
  "GF": { name: "French Guiana", region: "South America" },
  
  // Africa (major countries)
  "DZ": { name: "Algeria", region: "Africa" },
  "EG": { name: "Egypt", region: "Africa" },
  "ET": { name: "Ethiopia", region: "Africa" },
  "GH": { name: "Ghana", region: "Africa" },
  "KE": { name: "Kenya", region: "Africa" },
  "LY": { name: "Libya", region: "Africa" },
  "MA": { name: "Morocco", region: "Africa" },
  "NG": { name: "Nigeria", region: "Africa" },
  "ZA": { name: "South Africa", region: "Africa" },
  "SD": { name: "Sudan", region: "Africa" },
  "TN": { name: "Tunisia", region: "Africa" },
  "UG": { name: "Uganda", region: "Africa" },
  "ZW": { name: "Zimbabwe", region: "Africa" },
  
  // Oceania
  "AU": { name: "Australia", region: "Oceania" },
  "NZ": { name: "New Zealand", region: "Oceania" },
  "FJ": { name: "Fiji", region: "Oceania" },
  "PG": { name: "Papua New Guinea", region: "Oceania" },
};

// Preset configurations
export const PRESETS = {
  "azerbaijan_focus": {
    name: "Azerbaijan Focus",
    description: "News about Azerbaijan",
    countries: ["AZ"],
    icon: "🇦🇿"
  },
  "caucasus": {
    name: "Caucasus Region",
    description: "Azerbaijan, Georgia, Armenia",
    countries: ["AZ", "GE", "AM"],
    icon: "⛰️"
  },
  "cis": {
    name: "CIS Countries",
    description: "Post-Soviet states",
    countries: ["RU", "BY", "KZ", "KG", "TJ", "TM", "UZ", "MD", "AM", "AZ"],
    icon: "🏛️"
  },
  "major_powers": {
    name: "Major Powers",
    description: "US, China, Russia, EU",
    countries: ["US", "CN", "RU", "GB", "FR", "DE", "JP", "IN"],
    icon: "🌍"
  },
  "middle_east": {
    name: "Middle East",
    description: "Middle Eastern countries",
    countries: ["SA", "AE", "QA", "KW", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "IR", "IL", "PS", "TR"],
    icon: "🕌"
  },
  "custom": {
    name: "Custom Selection",
    description: "Choose your own countries",
    countries: [],
    icon: "✏️"
  }
};

interface CountrySelectorProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  preset?: string;
  onPresetChange?: (preset: string) => void;
  maxCountries?: number;
  placeholder?: string;
}

export function CountrySelector({
  selectedCountries,
  onCountriesChange,
  preset = "azerbaijan_focus",
  onPresetChange,
  maxCountries = 10,
  placeholder = "Select countries..."
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Group countries by region
  const countriesByRegion = useMemo(() => {
    const grouped: Record<string, Array<[string, typeof COUNTRIES[keyof typeof COUNTRIES]]>> = {};
    
    Object.entries(COUNTRIES).forEach(([code, data]) => {
      if (!grouped[data.region]) {
        grouped[data.region] = [];
      }
      grouped[data.region].push([code, data]);
    });
    
    // Sort countries within each region
    Object.keys(grouped).forEach(region => {
      grouped[region].sort((a, b) => a[1].name.localeCompare(b[1].name));
    });
    
    return grouped;
  }, []);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!search) return countriesByRegion;
    
    const searchLower = search.toLowerCase();
    const filtered: typeof countriesByRegion = {};
    
    Object.entries(countriesByRegion).forEach(([region, countries]) => {
      const matchingCountries = countries.filter(([code, data]) =>
        data.name.toLowerCase().includes(searchLower) ||
        code.toLowerCase().includes(searchLower) ||
        region.toLowerCase().includes(searchLower)
      );
      
      if (matchingCountries.length > 0) {
        filtered[region] = matchingCountries;
      }
    });
    
    return filtered;
  }, [search, countriesByRegion]);

  const handlePresetSelect = (presetKey: string) => {
    const presetConfig = PRESETS[presetKey];
    if (presetConfig) {
      onCountriesChange(presetConfig.countries);
      onPresetChange?.(presetKey);
    }
  };

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onCountriesChange(selectedCountries.filter(c => c !== code));
      // If we're modifying a preset, switch to custom
      if (preset !== "custom") {
        onPresetChange?.("custom");
      }
    } else if (selectedCountries.length < maxCountries) {
      onCountriesChange([...selectedCountries, code]);
      // If we're modifying a preset, switch to custom
      if (preset !== "custom") {
        onPresetChange?.("custom");
      }
    }
  };

  const removeCountry = (code: string) => {
    onCountriesChange(selectedCountries.filter(c => c !== code));
    if (preset !== "custom") {
      onPresetChange?.("custom");
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(PRESETS).map(([key, config]) => (
          <Button
            key={key}
            variant={preset === key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetSelect(key)}
            className="text-xs"
          >
            <span className="mr-1">{config.icon}</span>
            {config.name}
          </Button>
        ))}
      </div>

      {/* Selected countries badges */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map(code => (
            <Badge key={code} variant="secondary" className="pl-2 pr-1 py-1">
              {COUNTRIES[code]?.name || code}
              <button
                onClick={() => removeCountry(code)}
                className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Country selector dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {selectedCountries.length === 0
                ? placeholder
                : `${selectedCountries.length} countries selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search countries..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No country found.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              {Object.entries(filteredCountries).map(([region, countries]) => (
                <CommandGroup key={region} heading={region}>
                  {countries.map(([code, data]) => (
                    <CommandItem
                      key={code}
                      value={code}
                      onSelect={() => toggleCountry(code)}
                      disabled={!selectedCountries.includes(code) && selectedCountries.length >= maxCountries}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountries.includes(code) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{data.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Select up to {maxCountries} countries. {selectedCountries.length}/{maxCountries} selected.
      </p>
    </div>
  );
}