import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Calendar,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/LanguageContext';
import { ChatSession } from '@/api/chatAPI';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatHistorySidebar({
  sessions,
  currentSession,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  isLoading,
  className
}: ChatHistorySidebarProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    const date = new Date(session.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = t('today') || 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = t('yesterday') || 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      dateKey = t('last_7_days') || 'Last 7 days';
    } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      dateKey = t('last_30_days') || 'Last 30 days';
    } else {
      dateKey = format(date, 'MMMM yyyy');
    }
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    
    return acc;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div
      className={cn(
        "h-full bg-background border-r flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">{t('chat_history') || 'Chat History'}</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && (t('new_chat') || 'New Chat')}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_chats') || 'Search chats...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('loading') || 'Loading...'}
            </div>
          ) : Object.entries(groupedSessions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('no_chats') || 'No chats yet'}
            </div>
          ) : (
            Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
              <div key={dateGroup} className="mb-4">
                {!isCollapsed && (
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                    {dateGroup}
                  </div>
                )}
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    className="relative"
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <Button
                      variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 mb-1 group",
                        isCollapsed && "px-2"
                      )}
                      onClick={() => onSessionSelect(session)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">
                          {session.title}
                        </span>
                      )}
                    </Button>
                    
                    {/* Delete button */}
                    {!isCollapsed && hoveredSession === session.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Session count */}
      {!isCollapsed && sessions.length > 0 && (
        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          {sessions.length} {sessions.length === 1 ? t('chat') || 'chat' : t('chats') || 'chats'}
        </div>
      )}
    </div>
  );
}