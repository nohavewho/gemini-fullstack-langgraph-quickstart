import { InputForm } from "./InputForm";
import { CountryPresetCards } from "./CountryPresetCards";
import { useState } from "react";

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    model: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
}) => {
  const [selectedPreset, setSelectedPreset] = useState("azerbaijan_focus");
  
  const handlePresetSelect = (presetId: string, countries: string[]) => {
    setSelectedPreset(presetId);
    // Generate query based on preset
    const presetQueries = {
      azerbaijan_focus: "Анализ прессы об Азербайджане в соседних странах",
      european_press: "Анализ европейской прессы об Азербайджане",
      usa_media: "Анализ американских СМИ об Азербайджане", 
      arabic_world: "Анализ арабской прессы об Азербайджане",
      energy_sector: "Азербайджан в энергетических СМИ",
      global_media: "Азербайджан в мировой прессе",
      asian_markets: "Азербайджан в азиатских СМИ",
      custom_analysis: ""
    };
    
    if (presetId !== "custom_analysis") {
      handleSubmit(presetQueries[presetId], "medium", "gemini-2.5-flash-preview-04-17");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-4 flex-1 w-full max-w-5xl mx-auto gap-2">
      {/* Luxurious Presidential Header with proper spacing */}
      <div className="w-full mb-2">
        <div className="h-2 presidential-gradient rounded-full shadow-2xl animate-pulse"></div>
        <div className="h-1 gold-shimmer rounded-full mt-1 shadow-xl"></div>
      </div>
      
      <div className="relative mb-2">
        {/* Presidential Emblem */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ffd700] via-[#fff59d] to-[#ffd700] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-2xl">⭐</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gold-gradient mb-2 pt-6 drop-shadow-2xl tracking-wider">
          AZƏRBAYCAN
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-royal-gradient mb-2">
          Prezident Mətbuat Monitorinqi
        </h2>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-0.5 w-12 gold-shimmer rounded-full"></div>
          <p className="text-lg md:text-xl font-bold text-[#ffd700] tracking-wide">
            Presidential Press Monitor
          </p>
          <div className="h-0.5 w-12 gold-shimmer rounded-full"></div>
        </div>
        <p className="text-sm text-[#00b5e2] font-semibold mt-1">
          Global Media Intelligence System
        </p>
      </div>
      
      {/* Country Preset Cards */}
      <CountryPresetCards 
        selectedPreset={selectedPreset}
        onPresetSelect={handlePresetSelect}
      />
      
      <div className="relative w-full mt-8 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-0.5 presidential-gradient opacity-50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gradient-to-r from-[#00b5e2] to-[#00af50] px-6 py-2 text-white font-bold rounded-full shadow-xl text-lg">CUSTOM COMMAND</span>
        </div>
      </div>
      
      <div className="w-full">
        <InputForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onCancel}
          hasHistory={false}
        />
      </div>
      {/* Presidential Footer - more compact */}
      <div className="w-full mt-2">
        <div className="h-1 gold-shimmer rounded-full shadow-2xl mb-1"></div>
        <div className="h-2 presidential-gradient rounded-full shadow-2xl mb-2"></div>
        <div className="bg-gradient-to-r from-[#00b5e2]/20 via-[#ffd700]/30 to-[#00af50]/20 rounded-xl p-2 gold-border">
          <p className="text-sm font-bold text-[#ffd700] mb-1">
            🏛️ AZƏRBAYCAN RESPUBLİKASI PREZİDENTİNİN ADMİNİSTRASİYASI
          </p>
          <div className="flex justify-center gap-4 text-sm font-semibold flex-wrap">
            <span className="text-[#00b5e2]">Advanced AI Technology</span>
            <span className="text-[#ffd700]">·</span>
            <span className="text-[#ef3340]">66 Languages</span>
            <span className="text-[#ffd700]">·</span>
            <span className="text-[#00af50]">Real-time Analysis</span>
            <span className="text-[#ffd700]">·</span>
            <span className="text-[#00b5e2]">24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};
