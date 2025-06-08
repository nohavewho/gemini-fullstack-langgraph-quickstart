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
        const response = await fetch("/api/research/stream", {
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
        const response = await fetch("/api/research", {
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
    <div className="flex h-screen bg-gradient-to-br from-[#003d5c] via-[#005a7a] to-[#003d5c] text-[#ffd700] font-sans antialiased relative overflow-hidden">
      {/* Presidential Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00b5e2]/10 via-[#ef3340]/10 to-[#00af50]/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffd700]/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00b5e2]/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#ffd700]/5 via-transparent to-[#ffd700]/5 rounded-full blur-3xl animate-pulse"></div>
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative z-10 h-screen">
        {messages.length === 0 ? (
          <div className="flex-1 flex">
            <WelcomeScreen
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          </div>
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
      </main>
    </div>
  );
}