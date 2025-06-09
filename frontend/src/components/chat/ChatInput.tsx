import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onVoiceInput?: () => void;
  isTyping?: boolean;
  isRecording?: boolean;
  placeholder?: string;
  sendLabel?: string;
  recordingLabel?: string;
  stopRecordingLabel?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  isTyping,
  isRecording,
  placeholder = 'Type your message...',
  sendLabel = 'Send',
  recordingLabel = 'Recording...',
  stopRecordingLabel = 'Stop Recording'
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 p-4 border-t">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-h-[60px] max-h-[200px] resize-none"
        disabled={isTyping || isRecording}
      />
      {onVoiceInput && (
        <Button
          type="button"
          variant={isRecording ? "destructive" : "secondary"}
          size="icon"
          onClick={onVoiceInput}
          disabled={isTyping}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
      <Button
        type="submit"
        disabled={!value.trim() || isTyping || isRecording}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}