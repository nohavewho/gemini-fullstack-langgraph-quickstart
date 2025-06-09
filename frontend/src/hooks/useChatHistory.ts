import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as chatAPI from '../api/chatAPI';

export function useChatHistory() {
  const { dbUser } = useAuth();
  const [sessions, setSessions] = useState<chatAPI.ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<chatAPI.ChatSession | null>(null);
  const [messages, setMessages] = useState<chatAPI.ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      if (!dbUser) return;

      setIsLoading(true);
      try {
        const data = await chatAPI.getSessions(dbUser.auth0Id);
        setSessions(data);
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
        const data = await chatAPI.getMessages(currentSession.id);
        setMessages(data);
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
      const newSession = await chatAPI.createSession({
        userId: dbUser.auth0Id,
        title,
        preset,
        countries,
      });
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  };

  // Add message to current session
  const addMessage = async (type: 'human' | 'ai', content: string, metadata?: any) => {
    if (!currentSession) return null;

    try {
      const newMessage = await chatAPI.addMessage({
        sessionId: currentSession.id,
        type,
        content,
        metadata,
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      return null;
    }
  };

  // Delete session
  const deleteSessionById = async (sessionId: string) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
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
    deleteSession: deleteSessionById,
  };
}