"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import {
  Flag,
  User,
  X,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

// Import new components
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Progress } from "@/components/ui/progress";

// Import constants and types
import { LANGUAGES, COUNTRIES, PRESET_GROUPS } from "@/lib/constants";
import { Message } from "@/lib/types";

// Import hooks
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { getMessages } from "@/api/chatAPI";
import { usePressMonitor } from "@/hooks/usePressMonitor";

// Main Component
export function AzerbaijanPressMonitoringAI() {
  const { language, setLanguage, t } = useTranslation();
  const { user, isAuthenticated, loginWithRedirect, logout, dbUser } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [targetCountry, setTargetCountry] = useState<string>("AZ");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "RU", "TR", "DE"]);
  const [date] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [targetCountriesOpen, setTargetCountriesOpen] = useState(false);
  const [pressCountriesOpen, setPressCountriesOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  
  // Local state for input management
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat history management
  const {
    sessions,
    currentSession,
    messages: dbMessages,
    isLoading: historyLoading,
    setCurrentSession,
    createSession,
    addMessage,
    deleteSession
  } = useChatHistory();
  
  // Local messages state
  const [messages, setMessages] = useState<any[]>([]);
  
  // Press monitor hook
  const {
    state: pressMonitorState,
    runMonitor,
    reset: resetPressMonitor,
  } = usePressMonitor();
  
  // Load messages when session changes
  useEffect(() => {
    if (currentSession && dbMessages.length > 0) {
      // Convert database messages to AI SDK format
      const convertedMessages = dbMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.type === 'human' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        parts: [{ type: 'text' as const, text: msg.content }]
      }));
      setMessages(convertedMessages);
    } else {
      setMessages([]);
    }
  }, [currentSession, dbMessages, setMessages]);
  


  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    if (!dbUser) {
      loginWithRedirect();
      return;
    }

    // Create session if needed
    let sessionToUse = currentSession;
    if (!sessionToUse) {
      sessionToUse = await createSession(
        input.substring(0, 50) + '...',
        undefined,
        selectedCountries
      );
    }

    // Prepare the query with country context
    const targetCountryName = COUNTRIES.find(c => c.code === targetCountry)?.name || '';
    
    const pressCountryNames = selectedCountries.map(code => 
      COUNTRIES.find(c => c.code === code)?.name
    ).join(", ");

    // const contextualQuery = `Analyze press coverage about ${targetCountryNames} in ${pressCountryNames} media from ${date?.from ? format(date.from, "yyyy-MM-dd") : ''} to ${date?.to ? format(date.to, "yyyy-MM-dd"): ''}: ${input}`;

    setIsLoading(true);
    const userInput = input;
    setInput(''); // Clear input immediately
    
    try {
      // Save user message to database
      if (sessionToUse) {
        await addMessage('human', userInput, {
          targetCountries: [targetCountry],
          selectedCountries,
          dateRange: date
        });
      }
      // Add user message to local state
      const userMessage = {
        id: Math.random().toString(36).substring(2, 11),
        role: 'user' as const,
        content: userInput,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate AI response - in production this would call your backend
      setTimeout(() => {
        const aiMessage = {
          id: Math.random().toString(36).substring(2, 11),
          role: 'assistant' as const,
          content: `Analyzing press coverage about ${targetCountryName} in ${pressCountryNames} media...\n\nThis is a demo response. Integration with your backend API would provide real analysis here.`,
          createdAt: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (sessionToUse) {
          addMessage('ai', aiMessage.content, {
            targetCountries: [targetCountry],
            selectedCountries,
            dateRange: date
          });
        }
      }, 1500);
      
      // The AI response will be handled by the useChat hook
      // We'll save it in the onResponse callback if needed
      
      // No mock analytics here – real data will come via pressMonitorState
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle running press monitor
  const handleStartAnalysis = async () => {
    // reset previous state
    resetPressMonitor();
    await runMonitor({
      targetCountries: [targetCountry],
      sourceCountries: selectedCountries,
      searchMode: 'about',
      dateRange: date as any,
    });
  };

  const handlePresetSelect = (countryCodes: string[]) => {
    setSelectedCountries(countryCodes);
    setShowPresets(false);
    // Show notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-300';
    toast.textContent = `${t('preset_selected')} - ${countryCodes.length} ${t('countries_selected')}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-bottom-2');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      {/* Chat History Sidebar */}
      <div className={`${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-300`}>
        <ChatHistorySidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={async (session) => {
            setCurrentSession(session);
            setShowMobileSidebar(false);
            // Load messages for this session
            try {
              const loadedMessages = await getMessages(session.id);
              setMessages(loadedMessages.map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                createdAt: new Date(msg.createdAt)
              })));
            } catch (error) {
              console.error('Error loading messages:', error);
            }
          }}
          onNewChat={handleNewChat}
          onDeleteSession={deleteSession}
          isLoading={historyLoading}
          className="h-screen"
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto p-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("title")}</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={currentLanguage} onValueChange={(value) => {
                setCurrentLanguage(value);
                setLanguage(value);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              {/* Auth Button */}
              {isAuthenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Avatar className="w-5 h-5">
                        {user?.picture ? (
                          <img src={user.picture} alt={user.name || 'User'} className="rounded-full" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </Avatar>
                      <span className="hidden sm:inline">{user?.name || user?.email}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        {t('profile')}
                      </Button>
                      <Separator />
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600" 
                        size="sm"
                        onClick={() => logout()}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('logout')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button size="sm" onClick={() => loginWithRedirect()}>
                  {t('login')}
                </Button>
              )}
            </div>
          </div>

          {/* Country Selection - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <Popover open={targetCountriesOpen} onOpenChange={setTargetCountriesOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-left font-normal"
                >
                  <span className="truncate">
                    {targetCountry
                      ? `${COUNTRIES.find(c => c.code === targetCountry)?.flag} ${COUNTRIES.find(c => c.code === targetCountry)?.name}`
                      : t('selectCountries')
                    }
                  </span>
                  <Flag className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1">
                    {COUNTRIES.map((country) => (
                      <Button
                        key={country.code}
                        variant={targetCountry === country.code ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setTargetCountry(country.code);
                          setTargetCountriesOpen(false);
                        }}
                      >
                        <span className="mr-2">{country.flag}</span>
                        {country.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            
            <Popover open={pressCountriesOpen} onOpenChange={setPressCountriesOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-left font-normal"
                >
                  <span className="truncate">
                    {selectedCountries.length > 0 
                      ? `${selectedCountries.map(code => COUNTRIES.find(c => c.code === code)?.flag).join(' ')} ${selectedCountries.length} ${t('pressCountries').toLowerCase()}`
                      : t('selectCountries')
                    }
                  </span>
                  <Flag className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1">
                    {COUNTRIES.map((country) => (
                      <Button
                        key={country.code}
                        variant={selectedCountries.includes(country.code) ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => {
                          if (selectedCountries.includes(country.code)) {
                            setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                          } else {
                            setSelectedCountries([...selectedCountries, country.code]);
                          }
                        }}
                      >
                        <span className="mr-2">{country.flag}</span>
                        {country.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Analysis button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleStartAnalysis}
              disabled={selectedCountries.length === 0 || pressMonitorState.status === 'streaming'}
            >
              {pressMonitorState.status === 'streaming' ? t('analyzing') || 'Analyzing…' : t('start_analysis') || 'Начать анализ'}
            </Button>
          </div>
        </div>
      </div>

        {/* Main Chat Area - Flexible */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl p-4">
            <Card className="flex flex-col shadow-lg border-2 min-h-[calc(100vh-240px)]">
              {/* Chat Messages - Scrollable */}
              <div className="flex-1 overflow-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-2xl font-semibold mb-4">{t('welcome_back')}</h3>
                  <p className="text-muted-foreground mb-8 max-w-2xl text-center">
                    {t('select_preset_or_ask')}
                  </p>
                  
                  {showPresets && (
                    <div className="w-full max-w-4xl">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground">{t('presets')}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowPresets(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {PRESET_GROUPS.map((group) => (
                          <Button
                            key={group.id}
                            variant="outline"
                            className="h-auto p-3 flex flex-col items-center text-center hover:border-primary transition-colors"
                            onClick={() => handlePresetSelect(group.countries)}
                          >
                            <div className="text-2xl mb-1">{group.icon}</div>
                            <span className="text-xs font-medium">{t(group.id)}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!showPresets && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPresets(true)}
                    >
                      {t('presets')}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    // Get the message text content - AI SDK v5 uses different structure
                    let messageContent = '';
                    if ('content' in message && typeof message.content === 'string') {
                      messageContent = message.content;
                    } else if ('text' in message) {
                      messageContent = (message as any).text || '';
                    } else if (Array.isArray((message as any).content)) {
                      // Handle content array (common in AI SDK v5)
                      const textContent = (message as any).content.find((c: any) => c.type === 'text');
                      messageContent = textContent?.text || '';
                    }
                    
                    // Transform AI SDK message format to our Message format
                    const transformedMessage: Message = {
                      id: message.id,
                      content: messageContent,
                      sender: {
                        name: message.role === 'user' ? 'User' : 'Press Monitor AI',
                        isAI: message.role !== 'user'
                      },
                      timestamp: new Date().toLocaleTimeString(),
                      metadata: message.role !== 'user' ? {
                        sources: ["Reuters", "BBC", "CNN", "Al Jazeera", "Trend News"],
                        reasoning: [
                          "Searching international news databases",
                          "Filtering for target country content", 
                          "Analyzing sentiment and context",
                          "Categorizing by topic and relevance"
                        ],
                        searchQuery: messageContent
                      } : undefined
                    };
                    return <ChatMessage key={message.id} message={transformedMessage} />;
                  })}
                  
                  {isLoading && (
                    <ChatMessage 
                      message={{
                        id: "typing",
                        content: "",
                        sender: { name: "Press Monitor AI", isAI: true },
                        timestamp: "",
                        isTyping: true
                      }} 
                    />
                  )}

                  {/* Real-time Press Monitor Progress */}
                  {pressMonitorState.status !== 'idle' && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Press Analysis Progress</h4>
                      <p className="text-xs text-muted-foreground">{pressMonitorState.message}</p>

                      {pressMonitorState.status === 'streaming' && (
                        <Progress value={pressMonitorState.progress} className="w-full" />
                      )}

                      {Object.keys(pressMonitorState.languageProgress).length > 0 && (
                        <div className="text-xs space-y-1">
                          {Object.entries(pressMonitorState.languageProgress).map(([lang, prog]) => (
                            <div key={lang} className="flex justify-between">
                              <span>{lang}</span>
                              <span>{prog.articlesFound}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {pressMonitorState.statistics && (
                        <div className="text-xs space-y-1">
                          <div>Total: {pressMonitorState.statistics.totalArticles}</div>
                          <div>Positive: {pressMonitorState.statistics.positive}</div>
                          <div>Negative: {pressMonitorState.statistics.negative}</div>
                          <div>Neutral: {pressMonitorState.statistics.neutral}</div>
                        </div>
                      )}

                      {pressMonitorState.digest && (
                        <div className="whitespace-pre-wrap text-sm border-t pt-2">{pressMonitorState.digest}</div>
                      )}

                      {pressMonitorState.error && (
                        <div className="text-red-600 text-sm">Error: {pressMonitorState.error}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0">
              <ChatInput
                value={input}
                onChange={(value) => setInput(value)}
                onSubmit={handleSendMessage}
                onVoiceInput={handleVoiceInput}
                isTyping={isLoading}
                isRecording={isRecording}
                placeholder={t('chat_placeholder') || 'Type your question...'}
                sendLabel={t('send') || 'Send'}
                recordingLabel={t('recording') || 'Recording...'}
                stopRecordingLabel={t('stop_recording') || 'Stop Recording'}
              />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  return <AzerbaijanPressMonitoringAI />;
} 