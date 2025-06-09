/**
 * React hook for consuming the Press Monitor streaming API
 */

import { useState, useCallback } from 'react';

export interface PressMonitorState {
  status: 'idle' | 'loading' | 'streaming' | 'complete' | 'error';
  phase: 'search' | 'sentiment' | 'digest' | null;
  message: string;
  progress: number;
  languages: string[];
  languageProgress: Record<string, {
    status: 'pending' | 'processing' | 'complete' | 'error';
    articlesFound: number;
  }>;
  statistics: {
    totalArticles: number;
    positive: number;
    negative: number;
    neutral: number;
    languages: number;
    sources: number;
  } | null;
  digest: string | null;
  articles: any[];
  error: string | null;
  processingTime: string | null;
}

export interface PressMonitorOptions {
  targetCountries: string[];
  sourceCountries?: string[];
  searchMode?: 'about' | 'in' | 'cross_reference';
}

export function usePressMonitor() {
  const [state, setState] = useState<PressMonitorState>({
    status: 'idle',
    phase: null,
    message: '',
    progress: 0,
    languages: [],
    languageProgress: {},
    statistics: null,
    digest: null,
    articles: [],
    error: null,
    processingTime: null,
  });

  const runMonitor = useCallback(async (options: PressMonitorOptions) => {
    setState({
      status: 'loading',
      phase: null,
      message: 'Initializing press monitor...',
      progress: 0,
      languages: [],
      languageProgress: {},
      statistics: null,
      digest: null,
      articles: [],
      error: null,
      processingTime: null,
    });

    try {
      const response = await fetch('/api/press-monitor-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_countries: options.targetCountries,
          source_countries: options.sourceCountries || [],
          search_mode: options.searchMode || 'about',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      setState(prev => ({ ...prev, status: 'streaming' }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamData(data);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  const handleStreamData = useCallback((data: any) => {
    switch (data.type) {
      case 'status':
        setState(prev => ({ ...prev, message: data.message }));
        break;

      case 'phase':
        setState(prev => ({
          ...prev,
          phase: data.phase,
          message: data.message,
          languages: data.languages || prev.languages,
        }));
        break;

      case 'language_start':
        setState(prev => ({
          ...prev,
          languageProgress: {
            ...prev.languageProgress,
            [data.language_code]: {
              status: 'processing',
              articlesFound: 0,
            },
          },
        }));
        break;

      case 'language_complete':
        setState(prev => ({
          ...prev,
          progress: parseInt(data.progress),
          languageProgress: {
            ...prev.languageProgress,
            [data.language_code]: {
              status: 'complete',
              articlesFound: data.articles_found,
            },
          },
        }));
        break;

      case 'language_error':
        setState(prev => ({
          ...prev,
          languageProgress: {
            ...prev.languageProgress,
            [data.language]: {
              status: 'error',
              articlesFound: 0,
            },
          },
        }));
        break;

      case 'sentiment_progress':
        setState(prev => ({
          ...prev,
          progress: parseInt(data.progress),
          message: `Analyzing sentiment: ${data.analyzed}/${data.total} articles`,
        }));
        break;

      case 'statistics':
        setState(prev => ({
          ...prev,
          statistics: {
            totalArticles: data.total_articles,
            positive: data.positive,
            negative: data.negative,
            neutral: data.neutral,
            languages: data.languages,
            sources: data.sources,
          },
        }));
        break;

      case 'complete':
        setState(prev => ({
          ...prev,
          status: 'complete',
          digest: data.digest,
          articles: data.articles,
          processingTime: data.duration,
          message: `Analysis complete in ${data.duration}`,
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          status: 'error',
          error: data.error,
        }));
        break;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      phase: null,
      message: '',
      progress: 0,
      languages: [],
      languageProgress: {},
      statistics: null,
      digest: null,
      articles: [],
      error: null,
      processingTime: null,
    });
  }, []);

  return {
    state,
    runMonitor,
    reset,
  };
}