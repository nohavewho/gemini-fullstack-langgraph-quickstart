import React, { useState } from 'react';
import { Button } from './ui/button';

// Simple presets for testing
const PRESETS = {
  "azerbaijan_focus": {
    name: "🇦🇿 Azerbaijan Focus",
    countries: ["AZ"]
  },
  "caucasus": {
    name: "⛰️ Caucasus Region", 
    countries: ["AZ", "GE", "AM"]
  },
  "major_powers": {
    name: "🌍 Major Powers",
    countries: ["US", "CN", "RU", "GB", "FR", "DE"]
  },
  "custom": {
    name: "✏️ Custom",
    countries: []
  }
};

const COUNTRIES = {
  "AZ": "Azerbaijan",
  "GE": "Georgia", 
  "AM": "Armenia",
  "US": "United States",
  "CN": "China",
  "RU": "Russia",
  "GB": "United Kingdom", 
  "FR": "France",
  "DE": "Germany",
  "TR": "Turkey",
  "IR": "Iran"
};

interface SimpleCountrySelectorProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  preset?: string;
  onPresetChange?: (preset: string) => void;
}

export function SimpleCountrySelector({
  selectedCountries,
  onCountriesChange,
  preset = "azerbaijan_focus", 
  onPresetChange
}: SimpleCountrySelectorProps) {
  const [showCountries, setShowCountries] = useState(false);

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
    } else {
      onCountriesChange([...selectedCountries, code]);
    }
    onPresetChange?.("custom");
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[#ffd700]">Select Countries:</div>
      
      {/* Preset buttons */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(PRESETS).map(([key, config]) => (
          <Button
            key={key}
            variant={preset === key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetSelect(key)}
            className={`text-xs ${preset === key 
              ? 'bg-[#ffd700] text-[#003d5c] hover:bg-[#ffd700]/90' 
              : 'border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/20'
            }`}
          >
            {config.name}
          </Button>
        ))}
      </div>

      {/* Selected countries */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map(code => (
            <div 
              key={code}
              className="flex items-center gap-2 bg-[#ffd700]/20 border border-[#ffd700]/50 rounded px-3 py-1 text-sm text-[#ffd700]"
            >
              {COUNTRIES[code] || code}
              <button
                onClick={() => toggleCountry(code)}
                className="text-[#ffd700] hover:text-white ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Country list toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCountries(!showCountries)}
        className="border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/20"
      >
        {showCountries ? 'Hide' : 'Show'} Country List
      </Button>

      {/* Country selection */}
      {showCountries && (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <button
              key={code}
              onClick={() => toggleCountry(code)}
              className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedCountries.includes(code)
                  ? 'bg-[#ffd700]/30 text-[#ffd700] border border-[#ffd700]'
                  : 'bg-[#003d5c]/50 text-[#ffd700]/70 border border-[#ffd700]/30 hover:bg-[#ffd700]/10'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}