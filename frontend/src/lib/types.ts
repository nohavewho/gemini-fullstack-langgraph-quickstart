export interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    isAI: boolean;
  };
  timestamp: string;
  metadata?: {
    sources?: string[];
    reasoning?: string[];
    searchQuery?: string;
  };
  isTyping?: boolean;
}

export interface AnalysisResult {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  coverage: Array<{
    country: string;
    articles: number;
  }>;
  timeline: Array<{
    date: string;
    mentions: number;
  }>;
  topics: Array<{
    topic: string;
    percentage: number;
  }>;
}