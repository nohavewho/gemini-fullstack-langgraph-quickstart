import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, Brain, Send, StopCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated InputFormProps
interface InputFormProps {
  onSubmit: (inputValue: string, effort: string, model: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
}) => {
  const [internalInputValue, setInternalInputValue] = useState("");
  const [effort, setEffort] = useState("medium");
  const [model, setModel] = useState("gemini-2.5-flash-preview-04-17");

  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!internalInputValue.trim()) return;
    onSubmit(internalInputValue, effort, model);
    setInternalInputValue("");
  };

  const handleInternalKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInternalSubmit();
    }
  };

  const isSubmitDisabled = !internalInputValue.trim() || isLoading;

  return (
    <form
      onSubmit={handleInternalSubmit}
      className={`flex flex-col gap-2 p-3 `}
    >
      <div
        className={`flex flex-row items-center justify-between text-white rounded-3xl rounded-bl-sm ${
          hasHistory ? "rounded-br-sm" : ""
        } break-words min-h-[80px] bg-gradient-to-r from-[#003d5c] to-[#005a7a] px-5 py-4 shadow-xl border-2 border-[#ffd700]/50 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/5 via-transparent to-[#ffd700]/5"></div>
        <div className="relative z-10 flex-1 flex items-center gap-3">
        <Textarea
          value={internalInputValue}
          onChange={(e) => setInternalInputValue(e.target.value)}
          onKeyDown={handleInternalKeyDown}
          placeholder="Анализ прессы об Азербайджане в Турции за последние 3 дня"
          className={`w-full text-[#ffd700] placeholder-[#ffd700]/50 resize-none border-0 focus:outline-none focus:ring-0 outline-none focus-visible:ring-0 shadow-none bg-transparent
                        md:text-base min-h-[56px] max-h-[200px] font-medium`}
          rows={1}
        />
        <div className="flex-shrink-0">
          {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[#ef3340] hover:text-[#ffd700] hover:bg-[#ef3340]/20 p-2 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
              onClick={onCancel}
            >
              <StopCircle className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              className={`${
                isSubmitDisabled
                  ? "bg-gray-400 border-gray-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-[#ffd700] to-[#fff59d] hover:from-[#fff59d] hover:to-[#ffd700] text-[#003d5c] border-2 border-[#ffd700] hover:border-[#fff59d]"
              } px-6 py-3 rounded-full transition-all duration-200 text-lg font-bold hover:scale-110 hover:shadow-2xl hover:shadow-[#ffd700]/50 shadow-lg`}
              disabled={isSubmitDisabled}
            >
              Search
              <Send className="h-6 w-6 ml-2" />
            </Button>
          )}
        </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 bg-gradient-to-r from-[#00b5e2] to-[#00af50] border-2 border-[#ffd700] text-white focus:ring-[#ffd700] rounded-xl rounded-t-sm pl-3 max-w-[100%] sm:max-w-[90%] shadow-lg">
            <div className="flex flex-row items-center text-sm">
              <Brain className="h-5 w-5 mr-2 text-[#ffd700]" />
              Effort
            </div>
            <Select value={effort} onValueChange={setEffort}>
              <SelectTrigger className="w-[120px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Effort" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-[#003d5c] to-[#005a7a] border-2 border-[#ffd700] text-[#ffd700] cursor-pointer shadow-xl">
                <SelectItem
                  value="low"
                  className="hover:bg-[#ffd700]/20 focus:bg-[#ffd700]/20 cursor-pointer font-medium"
                >
                  Low
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="hover:bg-[#ffd700]/20 focus:bg-[#ffd700]/20 cursor-pointer font-medium"
                >
                  Medium
                </SelectItem>
                <SelectItem
                  value="high"
                  className="hover:bg-[#ffd700]/20 focus:bg-[#ffd700]/20 cursor-pointer font-medium"
                >
                  High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Model selector hidden but kept in code */}
          <div style={{ display: 'none' }}>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">2.0 Flash</SelectItem>
                <SelectItem value="gemini-2.5-flash-preview-04-17">2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-pro-preview-05-06">2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasHistory && (
          <Button
            className="bg-gradient-to-r from-[#ef3340] to-[#ef3340]/80 border-2 border-[#ffd700] text-white cursor-pointer rounded-xl rounded-t-sm pl-3 pr-4 font-bold hover:from-[#ffd700] hover:to-[#fff59d] hover:text-[#003d5c] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#ffd700]/30"
            variant="default"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={18} className="mr-2" />
            New Search
          </Button>
        )}
      </div>
    </form>
  );
};
