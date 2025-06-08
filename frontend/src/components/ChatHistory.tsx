import React from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Trash2, Calendar, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
  onSelectSession?: (sessionId: string) => void;
  onClose?: () => void;
}

export function ChatHistory({ onSelectSession, onClose }: ChatHistoryProps) {
  const { sessions, currentSession, deleteSession, isLoading } = useChatHistory();
  const { t } = useTranslation();

  const handleSessionClick = (sessionId: string) => {
    onSelectSession?.(sessionId);
    onClose?.();
  };

  const getPresetIcon = (preset: string | null) => {
    const icons = {
      'azerbaijan_focus': '🏛️',
      'european_press': '🇪🇺',
      'usa_media': '🇺🇸',
      'arabic_world': '🕌',
      'energy_sector': '⚡',
      'global_media': '🌍',
      'asian_markets': '🏮',
      'custom_analysis': '✏️'
    };
    return icons[preset] || '💬';
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-[#003d5c] border-2 border-[#ffd700]/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#ffd700]/20 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#ffd700]/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#003d5c] border-2 border-[#ffd700]/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#ffd700]/20 bg-gradient-to-r from-[#003d5c] to-[#005a7a]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#ffd700] flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat History
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#ffd700] hover:bg-[#ffd700]/20"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-[#ffd700]/70">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-sm mt-2">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${currentSession?.id === session.id
                      ? 'bg-[#ffd700]/20 border-[#ffd700] ring-2 ring-[#ffd700]/50'
                      : 'bg-[#003d5c]/50 border-[#ffd700]/30 hover:bg-[#ffd700]/10'
                    }
                  `}
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getPresetIcon(session.preset)}
                        </span>
                        <h3 className="font-semibold text-[#ffd700] truncate">
                          {session.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#ffd700]/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </div>
                        
                        {session.countries && Array.isArray(session.countries) && session.countries.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {session.countries.length} countries
                          </div>
                        )}
                      </div>
                      
                      {session.preset && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-[#ffd700]/20 text-[#ffd700] text-xs rounded">
                            {session.preset.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="text-[#ef3340] hover:bg-[#ef3340]/20 opacity-70 hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}