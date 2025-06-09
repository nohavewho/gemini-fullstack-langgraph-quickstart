import { AzerbaijanPressMonitoringAI } from "@/components/ui/AzerbaijanPressMonitoringAI";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AzerbaijanPressMonitoringAI />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;