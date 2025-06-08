"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Mic,
  ArrowUp,
  Plus,
  FileText,
  Code,
  BookOpen,
  PenTool,
  BrainCircuit,
  Sparkles,
  Globe,
  Paperclip,
  Send,
  MessageSquare,
  History,
  Settings,
  MoreHorizontal,
  Check,
  CheckCheck,
  SmilePlus,
  Languages,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  Share2,
  Eye,
  Clock,
  User,
  Bot,
  Zap,
  Target,
  BarChart3,
  Map,
  Flag,
  Newspaper,
  X,
  ChevronDown,
  MicIcon,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Simplified components for missing shadcn components
const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-px bg-border", className)} />
);

const Avatar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center justify-center rounded-full", className)}>
    {children}
  </div>
);

const Checkbox = ({ 
  checked, 
  onCheckedChange, 
  id 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="rounded border border-input"
  />
);

const Popover = ({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <div className="relative">{children}</div>
);

const PopoverTrigger = ({ 
  children, 
  asChild 
}: { 
  children: React.ReactNode;
  asChild?: boolean;
}) => <>{children}</>;

const PopoverContent = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("absolute z-50 bg-popover border rounded-md shadow-md", className)}>
    {children}
  </div>
);

const Command = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-background">{children}</div>
);

const CommandInput = (props: any) => <input {...props} className="border rounded px-2 py-1" />;
const CommandEmpty = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const CommandGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const CommandItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

// Animated Text Hook
function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    const parts = text.split(delimiter);
    const duration = delimiter === "" ? 8 : delimiter === " " ? 4 : 2;
    
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}

// Auto Resize Textarea Hook
function useAutoResizeTextarea({ minHeight = 48, maxHeight = 200 }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  return { textareaRef, adjustHeight };
}

// Types
interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
    isAI: boolean;
  };
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isTyping?: boolean;
  metadata?: {
    sources?: string[];
    reasoning?: string[];
    searchQuery?: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  language: string;
  messageCount: number;
}

interface PresetQuery {
  id: string;
  title: string;
  query: string;
  category: string;
  icon: React.ReactNode;
  languages: string[];
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface AnalysisResult {
  sentiment: { positive: number; negative: number; neutral: number };
  coverage: { country: string; articles: number }[];
  timeline: { date: string; mentions: number }[];
  topics: { topic: string; percentage: number }[];
}

// Language Configuration
const LANGUAGES = {
  en: { name: "English", flag: "🇺🇸" },
  az: { name: "Azərbaycan", flag: "🇦🇿" },
  ru: { name: "Русский", flag: "🇷🇺" },
  tr: { name: "Türkçe", flag: "🇹🇷" }
};

// Countries Configuration
const COUNTRIES: Country[] = [
  { code: "az", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "tr", name: "Turkey", flag: "🇹🇷" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ir", name: "Iran", flag: "🇮🇷" },
  { code: "ge", name: "Georgia", flag: "🇬🇪" },
  { code: "am", name: "Armenia", flag: "🇦🇲" },
  { code: "kz", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "uz", name: "Uzbekistan", flag: "🇺🇿" }
];

// Preset Queries
const PRESET_QUERIES: PresetQuery[] = [
  {
    id: "1",
    title: "Economy",
    query: "Economic partnerships and trade relations",
    category: "economy",
    icon: <TrendingUp className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  },
  {
    id: "2",
    title: "Energy",
    query: "Energy sector and oil & gas developments",
    category: "energy",
    icon: <Zap className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  },
  {
    id: "3",
    title: "Diplomacy",
    query: "Diplomatic relations and foreign policy",
    category: "diplomacy",
    icon: <Globe className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  },
  {
    id: "4",
    title: "Culture",
    query: "Cultural events and international exchanges",
    category: "culture",
    icon: <Sparkles className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  },
  {
    id: "5",
    title: "Tech",
    query: "Technology and digital transformation",
    category: "technology",
    icon: <Code className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  },
  {
    id: "6",
    title: "Security",
    query: "Regional security and stability",
    category: "security",
    icon: <Target className="w-3 h-3" />,
    languages: ["en", "az", "ru", "tr"]
  }
];

// Sample Chat History
const SAMPLE_CHAT_HISTORY: ChatSession[] = [
  {
    id: "1",
    title: "Economic partnerships analysis",
    timestamp: "2024-01-15T10:30:00Z",
    language: "en",
    messageCount: 12
  },
  {
    id: "2",
    title: "Enerji sektörü gelişmeleri",
    timestamp: "2024-01-14T15:45:00Z",
    language: "tr",
    messageCount: 8
  },
  {
    id: "3",
    title: "Дипломатические отношения",
    timestamp: "2024-01-13T09:20:00Z",
    language: "ru",
    messageCount: 15
  }
];

// Main Component
export function AzerbaijanPressMonitoringAI() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(SAMPLE_CHAT_HISTORY);
  const [activeTab, setActiveTab] = useState("chat");
  const [showReasoningProcess, setShowReasoningProcess] = useState(false);
  const [targetCountries, setTargetCountries] = useState<string[]>(["az"]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["us", "ru", "tr", "de"]);
  const [targetCountriesOpen, setTargetCountriesOpen] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 120
  });

  // Translations
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: "Azerbaijan Press Monitoring AI",
        subtitle: "Monitor global press coverage about Azerbaijan",
        placeholder: "Ask about Azerbaijan's presence in international media...",
        search: "Search",
        deepResearch: "Deep Research",
        reasoning: "Reasoning",
        presets: "Quick Presets",
        history: "Chat History",
        settings: "Settings",
        send: "Send",
        typing: "AI is analyzing...",
        noHistory: "No chat history yet",
        startNewChat: "Start a new conversation",
        economy: "Economy",
        energy: "Energy",
        diplomacy: "Diplomacy",
        culture: "Culture",
        technology: "Technology",
        security: "Security",
        targetCountry: "Target Country",
        pressCountries: "Press Countries",
        selectCountries: "Select countries to monitor press",
        recording: "Recording...",
        stopRecording: "Stop recording"
      },
      az: {
        title: "Azərbaycan Mətbuat Monitorinqi AI",
        subtitle: "Azərbaycan haqqında qlobal mətbuat əhatəsini izləyin",
        placeholder: "Azərbaycanın beynəlxalq mediada əksi haqqında soruşun...",
        search: "Axtarış",
        deepResearch: "Dərin Tədqiqat",
        reasoning: "Mülahizə",
        presets: "Sürətli Şablonlar",
        history: "Söhbət Tarixçəsi",
        settings: "Parametrlər",
        send: "Göndər",
        typing: "AI təhlil edir...",
        noHistory: "Hələ söhbət tarixçəsi yoxdur",
        startNewChat: "Yeni söhbət başladın",
        economy: "İqtisadiyyat",
        energy: "Enerji",
        diplomacy: "Diplomatiya",
        culture: "Mədəniyyət",
        technology: "Texnologiya",
        security: "Təhlükəsizlik",
        targetCountry: "Hədəf Ölkə",
        pressCountries: "Mətbuat Ölkələri",
        selectCountries: "İzləmək üçün ölkələri seçin",
        recording: "Qeyd edilir...",
        stopRecording: "Qeydi dayandır"
      },
      ru: {
        title: "ИИ мониторинга прессы Азербайджана",
        subtitle: "Отслеживайте освещение Азербайджана в мировой прессе",
        placeholder: "Спросите об освещении Азербайджана в международных СМИ...",
        search: "Поиск",
        deepResearch: "Глубокое исследование",
        reasoning: "Рассуждение",
        presets: "Быстрые шаблоны",
        history: "История чатов",
        settings: "Настройки",
        send: "Отправить",
        typing: "ИИ анализирует...",
        noHistory: "Пока нет истории чатов",
        startNewChat: "Начать новый разговор",
        economy: "Экономика",
        energy: "Энергетика",
        diplomacy: "Дипломатия",
        culture: "Культура",
        technology: "Технологии",
        security: "Безопасность",
        targetCountry: "Целевая страна",
        pressCountries: "Страны прессы",
        selectCountries: "Выберите страны для мониторинга",
        recording: "Запись...",
        stopRecording: "Остановить запись"
      },
      tr: {
        title: "Azerbaycan Basın Takip AI",
        subtitle: "Azerbaycan'ın küresel basındaki yer alışını izleyin",
        placeholder: "Azerbaycan'ın uluslararası medyadaki yansıması hakkında sorun...",
        search: "Arama",
        deepResearch: "Derin Araştırma",
        reasoning: "Akıl Yürütme",
        presets: "Hızlı Şablonlar",
        history: "Sohbet Geçmişi",
        settings: "Ayarlar",
        send: "Gönder",
        typing: "AI analiz ediyor...",
        noHistory: "Henüz sohbet geçmişi yok",
        startNewChat: "Yeni sohbet başlat",
        economy: "Ekonomi",
        energy: "Enerji",
        diplomacy: "Diplomasi",
        culture: "Kültür",
        technology: "Teknoloji",
        security: "Güvenlik",
        targetCountry: "Hedef Ülke",
        pressCountries: "Basın Ülkeleri",
        selectCountries: "İzlenecek ülkeleri seçin",
        recording: "Kayıt ediliyor...",
        stopRecording: "Kaydı durdur"
      }
    };
    return translations[currentLanguage]?.[key] || key;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: { name: "User", isAI: false },
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    adjustHeight(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      // Generate mock analysis results
      const mockResults: AnalysisResult = {
        sentiment: { positive: 65, negative: 20, neutral: 15 },
        coverage: [
          { country: "United States", articles: 45 },
          { country: "Russia", articles: 38 },
          { country: "Turkey", articles: 32 },
          { country: "Germany", articles: 28 }
        ],
        timeline: [
          { date: "2024-01-10", mentions: 12 },
          { date: "2024-01-11", mentions: 18 },
          { date: "2024-01-12", mentions: 25 },
          { date: "2024-01-13", mentions: 22 },
          { date: "2024-01-14", mentions: 30 }
        ],
        topics: [
          { topic: "Energy", percentage: 35 },
          { topic: "Economy", percentage: 25 },
          { topic: "Diplomacy", percentage: 20 },
          { topic: "Culture", percentage: 20 }
        ]
      };

      const targetCountryNames = targetCountries.map(code => 
        COUNTRIES.find(c => c.code === code)?.name
      ).join(", ");

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I've analyzed press coverage about ${targetCountryNames} across ${selectedCountries.length} countries. Found ${mockResults.coverage.reduce((sum, c) => sum + c.articles, 0)} relevant articles with ${mockResults.sentiment.positive}% positive sentiment.`,
        sender: { name: "Press Monitor AI", isAI: true },
        timestamp: new Date().toLocaleTimeString(),
        metadata: {
          sources: ["Reuters", "BBC", "CNN", "Al Jazeera", "Trend News"],
          reasoning: [
            "Searching international news databases",
            "Filtering for target country content", 
            "Analyzing sentiment and context",
            "Categorizing by topic and relevance"
          ],
          searchQuery: inputValue
        }
      };
      setMessages(prev => [...prev, aiResponse]);
      setAnalysisResults(mockResults);
      setIsTyping(false);
    }, 2000);
  };

  const handlePresetSelect = (preset: PresetQuery) => {
    setInputValue(preset.query);
    setSelectedPreset(preset.id);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTargetCountryToggle = (countryCode: string) => {
    setTargetCountries(prev => 
      prev.includes(countryCode) 
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode) 
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
    } else {
      setIsRecording(true);
      // Start recording logic here
    }
  };

  const filteredPresets = PRESET_QUERIES.filter(preset => 
    preset.languages.includes(currentLanguage)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t("title")}</h1>
              <p className="text-muted-foreground text-sm lg:text-base">{t("subtitle")}</p>
            </div>
          </div>
          
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
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
        </div>

        {/* Country Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{t("targetCountry")}</label>
            <Popover open={targetCountriesOpen} onOpenChange={setTargetCountriesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-between">
                  {targetCountries.length === 1 
                    ? COUNTRIES.find(c => c.code === targetCountries[0])?.name
                    : `${targetCountries.length} countries selected`
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {COUNTRIES.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`target-${country.code}`}
                        checked={targetCountries.includes(country.code)}
                        onCheckedChange={() => handleTargetCountryToggle(country.code)}
                      />
                      <label htmlFor={`target-${country.code}`} className="text-sm flex items-center gap-2 cursor-pointer">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{t("pressCountries")}</label>
            <Popover open={countriesOpen} onOpenChange={setCountriesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-between">
                  {selectedCountries.length} press countries selected
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {COUNTRIES.filter(c => !targetCountries.includes(c.code)).map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={country.code}
                        checked={selectedCountries.includes(country.code)}
                        onCheckedChange={() => handleCountryToggle(country.code)}
                      />
                      <label htmlFor={country.code} className="text-sm flex items-center gap-2 cursor-pointer">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("presets")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredPresets.map((preset) => (
              <Button
                key={preset.id}
                variant={selectedPreset === preset.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.icon}
                <span className="text-sm font-medium">{preset.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="h-[60vh] lg:h-[70vh] flex flex-col shadow-lg border-2">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Newspaper className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold mb-3">{t("startNewChat")}</h3>
                <p className="text-muted-foreground text-base lg:text-lg max-w-lg">
                  Ask me anything about press coverage and media analysis
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.sender.isAI ? "justify-start" : "justify-end"
                    )}
                  >
                    {message.sender.isAI && (
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-green-600">
                        <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] lg:max-w-[70%] rounded-xl p-3 lg:p-4",
                      message.sender.isAI 
                        ? "bg-muted" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      <div className="text-sm lg:text-base">
                        {message.isTyping ? (
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 h-1.5 bg-current rounded-full"
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-xs">{t("typing")}</span>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                      
                      {message.metadata && (
                        <div className="mt-2 space-y-1">
                          {message.metadata.sources && (
                            <div>
                              <div className="text-xs font-medium mb-1">Sources:</div>
                              <div className="flex flex-wrap gap-1">
                                {message.metadata.sources.slice(0, 3).map((source, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp}
                      </div>
                    </div>
                    
                    {!message.sender.isAI && (
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                        <User className="w-4 h-4 lg:w-5 lg:h-5" />
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-green-600">
                      <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </Avatar>
                    <div className="bg-muted rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{t("typing")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResults && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sentiment Chart */}
                      <Card className="p-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <PieChart className="w-3 h-3" />
                          Sentiment
                        </h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Positive</span>
                            <span>{analysisResults.sentiment.positive}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${analysisResults.sentiment.positive}%` }}
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Coverage Chart */}
                      <Card className="p-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Coverage
                        </h4>
                        <div className="space-y-1">
                          {analysisResults.coverage.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="truncate">{item.country}</span>
                              <span>{item.articles}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    {/* Timeline */}
                    <Card className="p-3">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <LineChart className="w-3 h-3" />
                        Timeline
                      </h4>
                      <div className="flex justify-between items-end h-16">
                        {analysisResults.timeline.map((point, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div 
                              className="bg-blue-500 w-2 rounded-t"
                              style={{ height: `${(point.mentions / 30) * 100}%` }}
                            />
                            <span className="text-xs mt-1">{point.date.slice(-2)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 lg:p-6">
            <div className="flex gap-3 lg:gap-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t("placeholder")}
                  className="min-h-[48px] lg:min-h-[56px] resize-none pr-24 text-sm lg:text-base border-2 focus:border-primary"
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleVoiceInput}
                  >
                    <MicIcon className={cn("w-4 h-4", isRecording && "text-red-500")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl"
                size="icon"
              >
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </div>
            
            {isRecording && (
              <div className="text-sm text-red-500 flex items-center gap-2 mt-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                {t("recording")}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Demo() {
  return <AzerbaijanPressMonitoringAI />;
}