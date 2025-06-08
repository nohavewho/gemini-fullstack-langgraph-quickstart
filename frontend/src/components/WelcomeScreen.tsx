import { InputForm } from "./InputForm";

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
  const presetQueries = [
    { 
      text: "Анализ прессы об Азербайджане за сегодня",
      icon: "📰",
      description: "Свежие новости и упоминания"
    },
    { 
      text: "Мониторинг прессы в соседних странах", 
      icon: "🌍",
      description: "Турция, Россия, Иран, Грузия"
    },
    { 
      text: "Анализ турецких СМИ об Азербайджане за неделю",
      icon: "🇹🇷",
      description: "Подробный обзор турецкой прессы"
    },
    { 
      text: "Оценка имиджа Азербайджана в мировой прессе",
      icon: "📊",
      description: "Анализ тональности и трендов"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 flex-1 w-full max-w-4xl mx-auto gap-4">
      {/* Azerbaijan Flag Header */}
      <div className="w-full mb-6">
        <div className="h-2 bg-gradient-to-r from-[#00b5e2] via-[#ef3340] to-[#00af50] rounded-full shadow-lg"></div>
      </div>
      
      <div className="relative">
        {/* Crescent and Star Symbol */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-6xl">☪️⭐</div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#00b5e2] via-[#ef3340] to-[#00af50] bg-clip-text text-transparent mb-3 pt-10">
          Azerbaijan Press Monitor
        </h1>
        <p className="text-xl md:text-2xl text-neutral-300 font-medium">
          Prezident Administrasiyası üçün Mətbuat Monitorinqi
        </p>
        <p className="text-lg text-neutral-400 mt-2">
          Global Media Analysis System
        </p>
      </div>
      
      {/* Preset Query Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
        {presetQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => handleSubmit(query.text, "medium", "gemini-2.5-flash-preview-04-17")}
            className="group p-5 bg-gradient-to-br from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 rounded-xl text-left transition-all duration-300 border border-neutral-600 hover:border-[#00b5e2] shadow-lg hover:shadow-xl hover:shadow-[#00b5e2]/20 transform hover:-translate-y-1"
            disabled={isLoading}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl p-2 bg-gradient-to-br from-[#00b5e2]/20 to-[#00af50]/20 rounded-lg border border-[#00b5e2]/30 group-hover:border-[#00b5e2]/50">
                {query.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-100 group-hover:text-white transition-colors text-lg">
                  {query.text}
                </div>
                <div className="text-sm text-neutral-400 mt-1 group-hover:text-neutral-300">
                  {query.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="relative w-full mt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-neutral-800 px-4 text-neutral-500">или введите свой запрос</span>
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
      {/* Footer with Azerbaijan colors */}
      <div className="w-full mt-8">
        <div className="h-1 bg-gradient-to-r from-[#00b5e2] via-[#ef3340] to-[#00af50] rounded-full shadow-lg mb-4"></div>
        <p className="text-xs text-neutral-400 font-medium">
          🏛️ Azərbaycan Respublikası Prezidentinin Administrasiyası
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Powered by Google Gemini AI · 66 Languages · Real-time Analysis · 24/7 Monitoring
        </p>
      </div>
    </div>
  );
};
