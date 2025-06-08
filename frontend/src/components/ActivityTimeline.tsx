import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Activity,
  Info,
  Search,
  TextSearch,
  Brain,
  Pen,
  ChevronDown,
  ChevronUp,
  Globe,
  Languages,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface ProcessedEvent {
  title: string;
  data: any;
  label?: string;
  id?: string;
  status?: string;
}

interface ActivityTimelineProps {
  processedEvents: ProcessedEvent[];
  isLoading: boolean;
}

export function ActivityTimeline({
  processedEvents,
  isLoading,
}: ActivityTimelineProps) {
  const [isTimelineCollapsed, setIsTimelineCollapsed] =
    useState<boolean>(false);
  const getEventIcon = (title: string | undefined, index: number) => {
    if (index === 0 && isLoading && processedEvents.length === 0) {
      return <Loader2 className="h-4 w-4 text-[#ffd700] animate-spin" />;
    }
    
    // Handle undefined or null title
    if (!title) {
      return <Activity className="h-4 w-4 text-[#00b5e2]" />;
    }
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("generating")) {
      return <TextSearch className="h-4 w-4 text-neutral-400" />;
    } else if (lowerTitle.includes("thinking")) {
      return <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />;
    } else if (lowerTitle.includes("reflection")) {
      return <Brain className="h-4 w-4 text-neutral-400" />;
    } else if (lowerTitle.includes("research")) {
      return <Search className="h-4 w-4 text-neutral-400" />;
    } else if (lowerTitle.includes("finalizing")) {
      return <Pen className="h-4 w-4 text-neutral-400" />;
    } else if (lowerTitle.includes("press monitoring")) {
      return <Globe className="h-4 w-4 text-blue-400" />;
    } else if (lowerTitle.includes("language search")) {
      return <Languages className="h-4 w-4 text-green-400" />;
    } else if (lowerTitle.includes("sentiment analysis")) {
      return <TrendingUp className="h-4 w-4 text-orange-400" />;
    } else if (lowerTitle.includes("digest generation")) {
      return <FileText className="h-4 w-4 text-purple-400" />;
    } else if (lowerTitle.includes("searching")) {
      return <Search className="h-4 w-4 text-[#00b5e2] animate-pulse" />;
    } else if (lowerTitle.includes("analyzing")) {
      return <Brain className="h-4 w-4 text-[#ffd700] animate-pulse" />;
    } else if (lowerTitle.includes("initializing")) {
      return <Loader2 className="h-4 w-4 text-[#ffd700] animate-spin" />;
    } else if (lowerTitle.includes("collecting")) {
      return <FileText className="h-4 w-4 text-[#00af50] animate-pulse" />;
    } else if (lowerTitle.includes("processing")) {
      return <TrendingUp className="h-4 w-4 text-[#ef3340] animate-pulse" />;
    }
    return <Activity className="h-4 w-4 text-[#00b5e2]" />;
  };

  useEffect(() => {
    if (!isLoading && processedEvents.length !== 0) {
      setIsTimelineCollapsed(true);
    }
  }, [isLoading, processedEvents]);

  return (
    <Card className="border-2 border-[#ffd700]/50 rounded-xl bg-gradient-to-br from-[#003d5c]/90 via-[#005a7a]/80 to-[#003d5c]/90 max-h-96 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-[#ffd700]/30 hover:shadow-2xl">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center justify-between">
          <div
            className="flex items-center justify-start text-sm w-full cursor-pointer gap-2 text-[#ffd700] hover:text-[#fff59d] transition-colors font-bold"
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-[#ffd700] rounded-full animate-pulse shadow-lg shadow-[#ffd700]/50"></div>
              İcra Prosesi | Processing Status
            </div>
            {isTimelineCollapsed ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {!isTimelineCollapsed && (
        <ScrollArea className="max-h-96 overflow-y-auto">
          <CardContent>
            {isLoading && processedEvents.length === 0 && (
              <div className="relative pl-8 pb-4">
                <div className="absolute left-3 top-3.5 h-full w-0.5 bg-[#ffd700]/30" />
                <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#fff59d] flex items-center justify-center ring-4 ring-[#003d5c]/50 shadow-lg">
                  <Loader2 className="h-3 w-3 text-[#003d5c] animate-spin" />
                </div>
                <div>
                  <p className="text-sm text-[#00b5e2] font-bold">
                    Searching...
                  </p>
                </div>
              </div>
            )}
            {processedEvents.length > 0 ? (
              <div className="space-y-0">
                {processedEvents.map((eventItem, index) => (
                  <div key={index} className="relative pl-8 pb-4">
                    {index < processedEvents.length - 1 ||
                    (isLoading && index === processedEvents.length - 1) ? (
                      <div className="absolute left-3 top-3.5 h-full w-0.5 bg-[#ffd700]/30" />
                    ) : null}
                    <div className="absolute left-0.5 top-2 h-6 w-6 rounded-full bg-gradient-to-br from-[#00b5e2] to-[#00af50] flex items-center justify-center ring-4 ring-[#ffd700]/20 shadow-lg">
                      {getEventIcon(eventItem.label || eventItem.title, index)}
                    </div>
                    <div>
                      <p className="text-sm text-[#ffd700] font-bold mb-0.5">
                        {eventItem.label || eventItem.title}
                      </p>
                      <p className="text-xs text-[#00b5e2] leading-relaxed font-medium">
                        {typeof eventItem.data === "string"
                          ? eventItem.data
                          : Array.isArray(eventItem.data)
                          ? (eventItem.data as string[]).join(", ")
                          : JSON.stringify(eventItem.data)}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && processedEvents.length > 0 && (
                  <div className="relative pl-8 pb-4">
                    <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#fff59d] flex items-center justify-center ring-4 ring-[#003d5c]/50 shadow-lg">
                      <Loader2 className="h-3 w-3 text-[#003d5c] animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-[#00b5e2] font-bold">
                        Searching...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : !isLoading ? ( // Only show "No activity" if not loading and no events
              <div className="flex flex-col items-center justify-center h-full text-[#ffd700]/50 pt-10">
                <Info className="h-6 w-6 mb-3" />
                <p className="text-sm font-medium">No activity to display.</p>
                <p className="text-xs text-[#00b5e2]/50 mt-1">
                  Timeline will update during processing.
                </p>
              </div>
            ) : null}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
}
