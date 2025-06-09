import React from 'react';
import { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { User, Bot } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.sender.isAI;

  if (message.isTyping) {
    return (
      <div className={`flex gap-3 ${isAI ? '' : 'justify-end'}`}>
        <div className={`flex gap-3 max-w-[80%] ${isAI ? '' : 'flex-row-reverse'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-blue-600' : 'bg-gray-600'}`}>
            {isAI ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
          </div>
          <Card className="p-4">
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'justify-end'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isAI ? '' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-blue-600' : 'bg-gray-600'}`}>
          {isAI ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
        </div>
        <Card className="p-4">
          <div className="font-semibold mb-1">{message.sender.name}</div>
          {isAI ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
          {message.metadata?.sources && (
            <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
              <div className="font-medium mb-1">Sources:</div>
              <div className="flex flex-wrap gap-2">
                {message.metadata.sources.map((source: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-secondary rounded text-xs">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}