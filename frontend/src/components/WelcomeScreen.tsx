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
      
      {/* Presidential Command Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 w-full max-w-3xl">
        {presetQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => handleSubmit(query.text, "medium", "gemini-2.5-flash-preview-04-17")}
            className="group p-4 presidential-card rounded-2xl text-left transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex items-start gap-5 relative z-10">
              <div className="text-4xl p-3 bg-gradient-to-br from-[#ffd700] to-[#fff59d] rounded-xl shadow-xl group-hover:shadow-2xl group-hover:shadow-[#ffd700]/40 transition-all">
                {query.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#00b5e2] group-hover:text-[#ffd700] transition-colors text-xl">
                  {query.text}
                </div>
                <div className="text-sm text-[#00af50] mt-2 font-medium">
                  {query.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
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
