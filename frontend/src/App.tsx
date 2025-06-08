import { useState, useEffect, useRef, useCallback } from "react";
import { ProcessedEvent } from "@/components/ActivityTimeline";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";

interface Message {
  id: string;
  type: "human" | "ai";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processedEventsTimeline, setProcessedEventsTimeline] = useState<ProcessedEvent[]>([]);
  const [historicalActivities, setHistoricalActivities] = useState<Record<string, ProcessedEvent[]>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = useCallback(async (submittedInputValue: string, effort: string, model: string) => {
    if (!submittedInputValue.trim()) return;
    
    setProcessedEventsTimeline([]);
    setIsLoading(true);

    // Add human message
    const humanMessage: Message = {
      id: Date.now().toString(),
      type: "human",
      content: submittedInputValue
    };
    setMessages(prev => [...prev, humanMessage]);

    try {
      // Add initial event
      setProcessedEventsTimeline([{
        title: "Searching...",
        data: "Initializing search..."
      }]);

      // First try streaming endpoint
      try {
        const response = await fetch("http://localhost:2024/api/research/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submittedInputValue,
            effort: effort,
            model: model
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6);
                  // Skip empty data
                  if (!jsonStr || jsonStr.trim() === '') continue;
                  
                  const data = JSON.parse(jsonStr);
                  
                  if (data.type === 'status') {
                    // Format status messages for better UX
                    let formattedTitle = data.message;
                    let formattedData = '';
                    
                    if (data.message.includes('Searching')) {
                      formattedTitle = '🔍 Searching press coverage';
                      const match = data.message.match(/Searching \((\d+)\/(\d+)\): (.+)/);
                      if (match) {
                        formattedData = `Query ${match[1]} of ${match[2]}: "${match[3]}"`;
                      }
                    } else if (data.message.includes('Initializing')) {
                      formattedTitle = '🚀 Initializing Azerbaijan Press Monitor';
                    } else if (data.message.includes('Generating search queries')) {
                      formattedTitle = '🌐 Generating multi-language search queries';
                    } else if (data.message.includes('Collecting articles')) {
                      formattedTitle = '📰 Collecting press articles';
                    } else if (data.message.includes('Analyzing collected')) {
                      formattedTitle = '🧠 Analyzing collected articles';
                    } else if (data.message.includes('Evaluating coverage')) {
                      formattedTitle = '📊 Evaluating press coverage completeness';
                    } else if (data.message.includes('Processing sentiment')) {
                      formattedTitle = '💭 Processing sentiment analysis';
                    } else if (data.message.includes('Generating press digest')) {
                      formattedTitle = '📋 Generating Azerbaijan press digest';
                    }
                    
                    // Update timeline with formatted status
                    setProcessedEventsTimeline(prev => [...prev, {
                      id: Date.now().toString(),
                      title: formattedTitle,
                      label: formattedTitle,
                      data: formattedData,
                      status: 'completed'
                    }]);
                  } else if (data.type === 'result') {
                    const aiMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      type: "ai",
                      content: data.content
                    };
                    
                    // Store historical activities BEFORE clearing
                    const currentTimeline = [...processedEventsTimeline];
                    setHistoricalActivities(prev => ({
                      ...prev,
                      [aiMessage.id]: currentTimeline
                    }));
                    
                    // Clear the timeline for next message
                    setProcessedEventsTimeline([]);
                    
                    // Add the message
                    setMessages(prev => [...prev, aiMessage]);
                  } else if (data.type === 'error') {
                    throw new Error(data.message || 'Unknown error');
                  } else if (data.type === 'done') {
                    console.log('Stream completed');
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, 'Line:', line);
                }
              }
            }
          }
        }
      } catch (streamError) {
        // Fallback to non-streaming endpoint
        console.log('Streaming failed, falling back to regular endpoint');
        const response = await fetch("http://localhost:2024/api/research", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submittedInputValue,
            effort: effort,
            model: model
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: data.result
          };
          setMessages(prev => [...prev, aiMessage]);
          
          // Store historical activities
          setHistoricalActivities(prev => ({
            ...prev,
            [aiMessage.id]: [...processedEventsTimeline]
          }));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [processedEventsTimeline]);

  const handleCancel = useCallback(() => {
    setIsLoading(false);
    window.location.reload();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-100 font-sans antialiased">
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
        <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? "flex" : ""}`}>
          {messages.length === 0 ? (
            <WelcomeScreen
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          ) : (
            <ChatMessagesView
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              liveActivityEvents={processedEventsTimeline}
              historicalActivities={historicalActivities}
            />
          )}
        </div>
      </main>
    </div>
  );
}