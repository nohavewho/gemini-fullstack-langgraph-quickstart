import { useChat as useAIChat } from '@ai-sdk/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useState } from 'react';

export function useChat() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    messages,
    error,
    reload,
    stop,
    sendMessage,
    setMessages
  } = useAIChat({
    id: 'main-chat',
    messages: []
  });

  // Wrapper functions to maintain compatibility
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent, options?: any) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const messageText = input;
    setInput(''); // Clear input immediately

    try {
      await sendMessage({
        text: messageText,
        metadata: {
          language,
          userId: user?.sub,
          ...options?.body
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Append function for compatibility
  const append = async (message: { role: string; content: string }) => {
    await sendMessage({
      text: message.content,
      metadata: {
        role: message.role,
        language,
        userId: user?.sub
      }
    });
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages,
    sendMessage,
  };
}