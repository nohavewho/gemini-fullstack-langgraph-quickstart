import React from 'react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/contexts/LanguageContext';

interface EmptyChatProps {
  presetGroups: any[];
  countries: any[];
  onPresetSelect: (countries: string[]) => void;
}

export function EmptyChat({ presetGroups, countries, onPresetSelect }: EmptyChatProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h3 className="text-2xl font-semibold mb-4">{t('welcome') || 'Welcome to Press Monitor AI'}</h3>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        {t('empty_chat_message') || 'Select countries and ask questions about press coverage. Choose from preset groups below or create your custom selection.'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {presetGroups.map((group) => (
          <Card
            key={group.id}
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => onPresetSelect(group.countries)}
          >
            <div className="text-4xl mb-3">{group.icon}</div>
            <h4 className="font-semibold mb-2">{group.name}</h4>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}