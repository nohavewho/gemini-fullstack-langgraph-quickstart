import { useState } from 'react';

interface PressMonitorState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
}

export function usePressMonitorOriginal() {
  const [state, setState] = useState<PressMonitorState>({
    isLoading: false,
    result: null,
    error: null
  });

  const runMonitor = async (mode: string, options?: any) => {
    setState({ isLoading: true, result: null, error: null });

    try {
      const response = await fetch('/api/press-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, options })
      });

      if (!response.ok) {
        throw new Error('Failed to run press monitor');
      }

      const data = await response.json();
      
      if (data.success) {
        setState({ isLoading: false, result: data.result, error: null });
      } else {
        setState({ isLoading: false, result: null, error: data.error || 'Unknown error' });
      }
    } catch (error) {
      setState({ 
        isLoading: false, 
        result: null, 
        error: error instanceof Error ? error.message : 'Failed to run press monitor' 
      });
    }
  };

  return { ...state, runMonitor };
}