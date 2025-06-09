import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Map, Search, Loader2 } from 'lucide-react';
import { usePressMonitorOriginal } from '@/hooks/usePressMonitorOriginal';

const MONITORING_MODES = [
  {
    id: 'neighbors_priority',
    name: 'Neighbors Priority',
    description: 'Turkey, Russia, Iran, Georgia, Armenia',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'central_asia_focus',
    name: 'Central Asia',
    description: 'Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan',
    icon: Map,
    color: 'bg-green-500'
  },
  {
    id: 'global_scan',
    name: 'Global Scan',
    description: 'All languages worldwide',
    icon: Globe,
    color: 'bg-purple-500'
  },
  {
    id: 'europe_monitor',
    name: 'Europe',
    description: 'European media coverage',
    icon: Search,
    color: 'bg-orange-500'
  }
];

interface PressMonitorModeSelectorProps {
  onResultReceived: (result: string) => void;
}

export function PressMonitorModeSelector({ onResultReceived }: PressMonitorModeSelectorProps) {
  const { isLoading, result, error, runMonitor } = usePressMonitorOriginal();
  const [selectedMode, setSelectedMode] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (result) {
      onResultReceived(result);
    }
  }, [result, onResultReceived]);

  const handleModeSelect = async (modeId: string) => {
    setSelectedMode(modeId);
    await runMonitor(modeId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Press Monitoring Mode</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MONITORING_MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card
              key={mode.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedMode === mode.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => !isLoading && handleModeSelect(mode.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${mode.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{mode.name}</h4>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                {selectedMode === mode.id && isLoading && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
          Error: {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Running press monitor analysis...</p>
          <p className="text-sm text-muted-foreground">This may take up to 60 seconds</p>
        </div>
      )}
    </div>
  );
}