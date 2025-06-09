"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  User,
  X,
  Menu,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

// Import new components
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { AnalyticsPanel } from "@/components/chat/AnalyticsPanel";

// Import constants and types
import { LANGUAGES, COUNTRIES, PRESET_GROUPS } from "@/lib/constants";
import { Message as LocalMessage, AnalysisResult } from "@/lib/types";

// Import hooks
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { getMessages } from "@/api/chatAPI";

// Main Component
export function AzerbaijanPressMonitoringAI() {
  const { language, setLanguage, t } = useTranslation();
  const { user, isAuthenticated, loginWithRedirect, logout, dbUser } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [targetCountry, setTargetCountry] = useState<string>("AZ");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "RU", "TR", "DE"]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [date] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [targetCountriesOpen, setTargetCountriesOpen] = useState(false);
  const [pressCountriesOpen, setPressCountriesOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [effortLevel, setEffortLevel] = useState<number>(3);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash-exp');
  const [showSettings, setShowSettings] = useState(false);
  
  // Model options with descriptions
  const modelOptions = [
    { 
      value: 'gemini-2.0-flash-exp', 
      label: 'Gemini 2.0 Flash', 
      description: 'Fastest model, best for quick insights'
    },
    { 
      value: 'gemini-1.5-pro', 
      label: 'Gemini 1.5 Pro', 
      description: 'Balanced performance and quality'
    },
    { 
      value: 'gemini-1.5-flash', 
      label: 'Gemini 1.5 Flash', 
      description: 'Quick responses with good accuracy'
    }
  ];
  
  // Effort level configuration
  const effortLabels = ['Quick', 'Basic', 'Standard', 'Comprehensive', 'Exhaustive'];
  const effortDescriptions = [
    'Quick scan of recent highlights',
    'Basic analysis of main topics',
    'Standard coverage analysis',
    'Comprehensive media review',
    'Exhaustive deep analysis'
  ];
  
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
  
  // Local messages state - using SDK message format
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
  }>>([]);
  
  // Load messages when session changes
  useEffect(() => {
    if (currentSession && dbMessages.length > 0) {
      // Convert database messages to AI SDK format
      const convertedMessages = dbMessages.map((msg) => ({
        id: msg.id,
        role: msg.type === 'human' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        createdAt: new Date(msg.createdAt)
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

    // Contextual query would use date formatting here if needed

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
      
      // Call real Press Monitor API with original format
      try {
        // Determine mode based on selected countries
        let mode = 'neighbors_priority';
        const countrySet = new Set(selectedCountries);
        
        if (countrySet.has('TR') && countrySet.has('RU') && countrySet.has('IR')) {
          mode = 'neighbors_priority';
        } else if (countrySet.has('KZ') && countrySet.has('UZ')) {
          mode = 'central_asia_focus';
        } else if (countrySet.has('DE') && countrySet.has('FR')) {
          mode = 'europe_monitor';
        } else if (selectedCountries.length > 6) {
          mode = 'global_scan';
        } else if (selectedCountries.length > 0) {
          mode = 'custom';
        }

        const response = await fetch('/api/press-monitor-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: mode,
            options: mode === 'custom' ? {
              languages: selectedCountries.map(code => {
                const countryToLang = {
                  'US': 'en', 'UK': 'en', 'TR': 'tr', 'RU': 'ru', 'IR': 'fa',
                  'GE': 'ka', 'AM': 'hy', 'KZ': 'kk', 'UZ': 'uz', 'TM': 'tk',
                  'KG': 'ky', 'TJ': 'tg', 'DE': 'de', 'FR': 'fr', 'CN': 'zh',
                  'JP': 'ja', 'KR': 'ko', 'SA': 'ar', 'ES': 'es', 'PT': 'pt',
                  'IT': 'it', 'TH': 'th', 'ID': 'id', 'MY': 'ms', 'VN': 'vi',
                  'PH': 'tl'
                };
                return countryToLang[code] || 'en';
              })
            } : {}
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get analysis');
        }

        // Get the response
        const data = await response.json();
        
        if (data.success) {
          // Create AI message with result
          const aiMessage = {
            id: Math.random().toString(36).substring(2, 11),
            role: 'assistant' as const,
            content: data.result || 'Press monitoring completed.',
            createdAt: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          
          // Save to session
          if (sessionToUse) {
            await addMessage('ai', aiMessage.content, {
              targetCountries: [targetCountry],
              selectedCountries,
              dateRange: date
            });
          }
        } else {
          throw new Error(data.error || 'Failed to get press monitor results');
        }
      } catch (error) {
        console.error('Error calling LangGraph:', error);
        const errorMessage = {
          id: Math.random().toString(36).substring(2, 11),
          role: 'assistant' as const,
          content: 'Sorry, I encountered an error analyzing the press coverage. Please try again.',
          createdAt: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
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
    setAnalysisResults(null);
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
                role: msg.type === 'human' ? 'user' as const : 'assistant' as const,
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
            
              {/* Settings Button with indicator */}
              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Settings className="h-5 w-5" />
                    {(effortLevel !== 3 || selectedModel !== 'gemini-2.0-flash-exp') && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <TooltipProvider>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Analysis Settings</h4>
                        <p className="text-xs text-muted-foreground">Customize how AI analyzes press coverage</p>
                        <Separator />
                      </div>
                      
                      {/* Effort Level Control */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium cursor-help">Effort Level</label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Controls the depth and thoroughness of analysis</p>
                            </TooltipContent>
                          </Tooltip>
                          <Badge variant="secondary" className="font-medium">
                            {effortLabels[effortLevel - 1]}
                          </Badge>
                        </div>
                        <Slider
                          value={[effortLevel]}
                          onValueChange={(values) => setEffortLevel(values[0])}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {effortDescriptions[effortLevel - 1]}
                        </p>
                      </div>
                      
                      {/* Model Selection */}
                      <div className="space-y-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label className="text-sm font-medium cursor-help">AI Model</label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose the AI model based on speed vs quality trade-off</p>
                          </TooltipContent>
                        </Tooltip>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {modelOptions.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{model.label}</span>
                                  <span className="text-xs text-muted-foreground">{model.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Higher effort = More thorough analysis</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setEffortLevel(3);
                            setSelectedModel('gemini-2.0-flash-exp');
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </TooltipProvider>
                </PopoverContent>
              </Popover>
              
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
                      messageContent = (message as typeof messages[0] & {text?: string}).text || '';
                    } else if (Array.isArray((message as typeof messages[0] & {content?: Array<{type: string; text?: string}>}).content)) {
                      // Handle content array (common in AI SDK v5)
                      const textContent = ((message as typeof messages[0] & {content?: Array<{type: string; text?: string}>}).content || []).find(c => c.type === 'text');
                      messageContent = textContent?.text || '';
                    }
                    
                    // Transform AI SDK message format to our Message format
                    const transformedMessage: LocalMessage = {
                      id: message.id,
                      content: messageContent,
                      sender: {
                        name: message.role === 'user' ? 'User' : 'Press Monitor AI',
                        isAI: message.role !== 'user'
                      },
                      timestamp: new Date().toLocaleTimeString(),
                      metadata: undefined
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

                  {/* Analysis Results */}
                  {analysisResults && (
                    <AnalyticsPanel results={analysisResults} />
                  )}
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0">
              {/* Settings indicator */}
              {(effortLevel !== 3 || selectedModel !== 'gemini-2.0-flash-exp') && (
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    <span>Using custom settings:</span>
                    {effortLevel !== 3 && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        Effort: {effortLabels[effortLevel - 1]}
                      </Badge>
                    )}
                    {selectedModel !== 'gemini-2.0-flash-exp' && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        {modelOptions.find(m => m.value === selectedModel)?.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
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