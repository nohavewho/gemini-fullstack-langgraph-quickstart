import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Globe, Search } from "lucide-react";

interface PressMonitorProps {
  onStartMonitoring: (mode: string, options?: any) => Promise<void>;
}

export const PressMonitor: React.FC<PressMonitorProps> = ({ onStartMonitoring }) => {
  const [mode, setMode] = useState<string>('neighbors_priority');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const monitoringModes = [
    { value: 'neighbors_priority', label: 'Neighbors Priority', description: 'Turkey, Russia, Iran, Georgia, Armenia' },
    { value: 'central_asia_focus', label: 'Central Asia', description: 'Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan' },
    { value: 'southeast_asia_scan', label: 'Southeast Asia', description: 'Thailand, Indonesia, Malaysia, Vietnam, Philippines' },
    { value: 'global_scan', label: 'Global Scan', description: 'All languages worldwide' },
    { value: 'europe_monitor', label: 'Europe', description: 'European media coverage' },
    { value: 'asia_comprehensive', label: 'Asia Comprehensive', description: 'All Asian regions including Middle East' },
    { value: 'custom', label: 'Custom Selection', description: 'Choose specific languages or regions' }
  ];
  
  const languages = [
    // Neighbors
    { code: 'tr', name: 'Turkish', region: 'Neighbors' },
    { code: 'ru', name: 'Russian', region: 'Neighbors' },
    { code: 'fa', name: 'Persian', region: 'Neighbors' },
    { code: 'ka', name: 'Georgian', region: 'Neighbors' },
    { code: 'hy', name: 'Armenian', region: 'Neighbors' },
    { code: 'az', name: 'Azerbaijani', region: 'Neighbors' },
    
    // Central Asia
    { code: 'kk', name: 'Kazakh', region: 'Central Asia' },
    { code: 'uz', name: 'Uzbek', region: 'Central Asia' },
    { code: 'tk', name: 'Turkmen', region: 'Central Asia' },
    { code: 'ky', name: 'Kyrgyz', region: 'Central Asia' },
    { code: 'tg', name: 'Tajik', region: 'Central Asia' },
    
    // Southeast Asia
    { code: 'th', name: 'Thai', region: 'Southeast Asia' },
    { code: 'id', name: 'Indonesian', region: 'Southeast Asia' },
    { code: 'ms', name: 'Malay', region: 'Southeast Asia' },
    { code: 'vi', name: 'Vietnamese', region: 'Southeast Asia' },
    { code: 'tl', name: 'Filipino', region: 'Southeast Asia' },
    
    // Major Languages
    { code: 'en', name: 'English', region: 'Global' },
    { code: 'zh', name: 'Chinese', region: 'East Asia' },
    { code: 'ja', name: 'Japanese', region: 'East Asia' },
    { code: 'ko', name: 'Korean', region: 'East Asia' },
    { code: 'ar', name: 'Arabic', region: 'Middle East' },
    { code: 'he', name: 'Hebrew', region: 'Middle East' },
    { code: 'hi', name: 'Hindi', region: 'South Asia' },
    { code: 'ur', name: 'Urdu', region: 'South Asia' },
    { code: 'bn', name: 'Bengali', region: 'South Asia' },
    
    // Europe
    { code: 'de', name: 'German', region: 'Europe' },
    { code: 'fr', name: 'French', region: 'Europe' },
    { code: 'es', name: 'Spanish', region: 'Europe/Americas' },
    { code: 'pt', name: 'Portuguese', region: 'Europe/Americas' },
    { code: 'it', name: 'Italian', region: 'Europe' },
    { code: 'pl', name: 'Polish', region: 'Europe' },
    { code: 'uk', name: 'Ukrainian', region: 'Europe' },
    { code: 'el', name: 'Greek', region: 'Europe' },
    { code: 'sv', name: 'Swedish', region: 'Europe' },
    { code: 'no', name: 'Norwegian', region: 'Europe' },
    { code: 'fi', name: 'Finnish', region: 'Europe' },
    { code: 'is', name: 'Icelandic', region: 'Europe' },
    
    // Africa
    { code: 'sw', name: 'Swahili', region: 'Africa' },
    { code: 'am', name: 'Amharic', region: 'Africa' },
    { code: 'yo', name: 'Yoruba', region: 'Africa' },
    { code: 'af', name: 'Afrikaans', region: 'Africa' },
  ];
  
  const regions = [
    'Neighbors',
    'Central Asia',
    'Southeast Asia',
    'East Asia',
    'South Asia',
    'Middle East',
    'Europe',
    'Africa',
    'Americas',
    'Global'
  ];
  
  const handleStart = async () => {
    setIsLoading(true);
    
    try {
      const options: any = {};
      
      if (mode === 'custom') {
        if (selectedLanguages.length > 0) {
          options.languages = selectedLanguages;
        } else if (selectedRegions.length > 0) {
          options.regions = selectedRegions;
        }
      }
      
      await onStartMonitoring(mode, options);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group languages by region
  const languagesByRegion = languages.reduce((acc, lang) => {
    if (!acc[lang.region]) acc[lang.region] = [];
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, typeof languages>);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Azerbaijan Press Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Monitoring Mode
            </label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monitoringModes.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    <div>
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom Selection */}
          {mode === 'custom' && (
            <Tabs defaultValue="languages" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="languages">Select Languages</TabsTrigger>
                <TabsTrigger value="regions">Select Regions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="languages" className="space-y-4 mt-4">
                {Object.entries(languagesByRegion).map(([region, langs]) => (
                  <div key={region} className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">{region}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {langs.map(lang => (
                        <label key={lang.code} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            value={lang.code}
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLanguages([...selectedLanguages, lang.code]);
                              } else {
                                setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                              }
                              // Clear regions when selecting languages
                              setSelectedRegions([]);
                            }}
                            className="rounded"
                          />
                          <span>{lang.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="regions" className="space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {regions.map(region => (
                    <label key={region} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        value={region}
                        checked={selectedRegions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRegions([...selectedRegions, region]);
                          } else {
                            setSelectedRegions(selectedRegions.filter(r => r !== region));
                          }
                          // Clear languages when selecting regions
                          setSelectedLanguages([]);
                        }}
                        className="rounded"
                      />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Statistics Preview */}
          {mode !== 'custom' && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Coverage Preview</h4>
              <div className="text-sm text-muted-foreground">
                {mode === 'neighbors_priority' && '6 languages • Focus on immediate neighbors'}
                {mode === 'central_asia_focus' && '5 languages • Central Asian republics'}
                {mode === 'southeast_asia_scan' && '5 languages • ASEAN region coverage'}
                {mode === 'global_scan' && '20+ languages • Worldwide monitoring'}
                {mode === 'europe_monitor' && '15+ languages • European media'}
                {mode === 'asia_comprehensive' && '20+ languages • Full Asian coverage'}
              </div>
            </div>
          )}
          
          {/* Start Button */}
          <Button 
            onClick={handleStart}
            className="w-full"
            disabled={
              isLoading ||
              (mode === 'custom' && selectedLanguages.length === 0 && selectedRegions.length === 0)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Monitoring in progress...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};