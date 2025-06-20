import type React from "react";
import type { Message } from "@langchain/langgraph-sdk";
import { Loader2, Copy, CopyCheck, Bot } from "lucide-react";
import { InputForm } from "@/components/InputForm";
import { Button } from "@/components/ui/button";
import { useState, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  ActivityTimeline,
  ProcessedEvent,
} from "@/components/ActivityTimeline"; // Assuming ActivityTimeline is in the same dir or adjust path

// Markdown component props type from former ReportView
type MdComponentProps = {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({ className, children, ...props }: MdComponentProps) => (
    <h1 className={cn("text-2xl font-bold mt-4 mb-2", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: MdComponentProps) => (
    <h2 className={cn("text-xl font-bold mt-3 mb-2", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: MdComponentProps) => (
    <h3 className={cn("text-lg font-bold mt-3 mb-1", className)} {...props}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: MdComponentProps) => (
    <p className={cn("mb-3 leading-7", className)} {...props}>
      {children}
    </p>
  ),
  a: ({ className, children, href, ...props }: MdComponentProps) => (
    <a
      className={cn("text-[#ffd700] hover:text-[#fff59d] underline decoration-[#ffd700]/50 font-medium inline-block mx-1", className)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ className, children, ...props }: MdComponentProps) => (
    <ul className={cn("list-disc pl-6 mb-3", className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: MdComponentProps) => (
    <ol className={cn("list-decimal pl-6 mb-3", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: MdComponentProps) => (
    <li className={cn("mb-1", className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }: MdComponentProps) => (
    <blockquote
      className={cn(
        "border-l-4 border-[#ffd700] pl-4 italic my-3 text-sm bg-gradient-to-r from-[#ffd700]/10 to-transparent py-2 rounded-r-lg",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: MdComponentProps) => (
    <code
      className={cn(
        "bg-gradient-to-r from-[#00b5e2]/20 to-[#00af50]/20 rounded px-2 py-1 font-mono text-xs border border-[#ffd700]/30",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }: MdComponentProps) => (
    <pre
      className={cn(
        "bg-gradient-to-br from-[#003d5c] to-[#005a7a] p-4 rounded-xl overflow-x-auto font-mono text-xs my-3 gold-border shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: MdComponentProps) => (
    <hr className={cn("border-[#ffd700] my-4 opacity-50", className)} {...props} />
  ),
  table: ({ className, children, ...props }: MdComponentProps) => (
    <div className="my-3 overflow-x-auto">
      <table className={cn("border-collapse w-full", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }: MdComponentProps) => (
    <th
      className={cn(
        "border border-[#ffd700] px-3 py-2 text-left font-bold bg-gradient-to-r from-[#00b5e2]/20 to-[#00af50]/20",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: MdComponentProps) => (
    <td
      className={cn("border border-[#ffd700]/50 px-3 py-2", className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  message: Message;
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  message,
  mdComponents,
}) => {
  return (
    <div
      className={`text-white rounded-2xl break-words min-h-7 bg-gradient-to-br from-[#00b5e2] to-[#00af50] max-w-[100%] sm:max-w-[90%] px-6 py-5 rounded-br-lg shadow-2xl border-2 border-[#ffd700] relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/10 to-transparent opacity-50"></div>
      <div className="relative z-10">
      <ReactMarkdown components={mdComponents}>
        {typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
      </div>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  message: Message;
  historicalActivity: ProcessedEvent[] | undefined;
  liveActivity: ProcessedEvent[] | undefined;
  isLastMessage: boolean;
  isOverallLoading: boolean;
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  historicalActivity,
  liveActivity,
  isLastMessage,
  isOverallLoading,
  mdComponents,
  handleCopy,
  copiedMessageId,
}) => {
  // Determine which activity events to show and if it's for a live loading message
  const activityForThisBubble =
    isLastMessage && isOverallLoading ? liveActivity : historicalActivity;
  const isLiveActivityForThisBubble = isLastMessage && isOverallLoading;

  return (
    <div className={`relative break-words flex items-start gap-3 animate-slideIn`}>
      {/* Presidential Bot icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] to-[#fff59d] flex items-center justify-center shadow-2xl border-2 border-[#ffd700] animate-pulse">
        <Bot className="w-6 h-6 text-[#003d5c]" />
      </div>
      
      {/* Presidential Message content */}
      <div className="flex-1 presidential-card rounded-2xl p-6 shadow-2xl max-w-[85%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00b5e2]/5 via-[#ef3340]/5 to-[#00af50]/5"></div>
        <div className="relative z-10">
        {activityForThisBubble && activityForThisBubble.length > 0 && (
          <div className="mb-4 border-b border-[#ffd700]/50 pb-3 text-xs">
            <ActivityTimeline
              processedEvents={activityForThisBubble}
              isLoading={isLiveActivityForThisBubble}
            />
          </div>
        )}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown components={mdComponents}>
            {typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content)}
          </ReactMarkdown>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs text-[#00b5e2] hover:text-[#ffd700] transition-all hover:scale-105 font-semibold"
          onClick={() =>
            handleCopy(
              typeof message.content === "string"
                ? message.content
                : JSON.stringify(message.content),
              message.id!
            )
          }
        >
          {copiedMessageId === message.id ? (
            <><CopyCheck className="w-3 h-3 mr-1" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3 mr-1" /> Copy</>
          )}
        </Button>
        </div>
      </div>
    </div>
  );
};

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (inputValue: string, effort: string, model: string) => void;
  onCancel: () => void;
  liveActivityEvents: ProcessedEvent[];
  historicalActivities: Record<string, ProcessedEvent[]>;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  liveActivityEvents,
  historicalActivities,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-2 max-w-4xl mx-auto pt-4 pb-4">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            return (
              <div key={message.id || `msg-${index}`} className="space-y-3">
                <div
                  className={`flex items-start gap-3 ${
                    message.type === "human" ? "justify-end" : ""
                  }`}
                >
                  {message.type === "human" ? (
                    <HumanMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      message={message}
                      historicalActivity={historicalActivities[message.id!]}
                      liveActivity={liveActivityEvents} // Pass global live events
                      isLastMessage={isLast}
                      isOverallLoading={isLoading} // Pass global loading state
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1].type === "human") && (
              <div className="flex items-start gap-3 mt-3 animate-fadeIn">
                {/* Presidential Bot icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] to-[#fff59d] flex items-center justify-center shadow-2xl border-2 border-[#ffd700] animate-pulse">
                  <Bot className="w-6 h-6 text-[#003d5c]" />
                </div>
                
                {/* Presidential Loading message */}
                <div className="flex-1 presidential-card rounded-2xl p-6 shadow-2xl max-w-[85%] min-h-[100px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00b5e2]/10 via-[#ffd700]/20 to-[#00af50]/10 animate-pulse"></div>
                  <div className="relative z-10">
                  {liveActivityEvents.length > 0 ? (
                    <div className="text-sm">
                      <ActivityTimeline
                        processedEvents={liveActivityEvents}
                        isLoading={true}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-start h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-[#ffd700] mr-4" />
                      <span className="text-[#00b5e2] font-semibold text-lg animate-pulse">Analyzing Azerbaijan press coverage...</span>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
      <InputForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={messages.length > 0}
      />
    </div>
  );
}
