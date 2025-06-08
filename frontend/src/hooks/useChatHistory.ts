import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../lib/schema';
import { useAuth } from '../contexts/AuthContext';

export function useChatHistory() {
  const { dbUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      if (!dbUser) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/chat/sessions?userId=${dbUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [dbUser]);

  // Load messages for current session
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentSession) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${currentSession.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentSession]);

  // Create new chat session
  const createSession = async (title: string, preset?: string, countries?: string[]) => {
    if (!dbUser) return null;

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dbUser.id,
          title,
          preset,
          countries,
        }),
      });

      if (response.ok) {
        const newSession = await response.json();
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
    return null;
  };

  // Add message to current session
  const addMessage = async (type: 'human' | 'ai', content: string, metadata?: any) => {
    if (!currentSession) return null;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          type,
          content,
          metadata,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
    } catch (error) {
      console.error('Failed to add message:', error);
    }
    return null;
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    setCurrentSession,
    createSession,
    addMessage,
    deleteSession,
  };
}