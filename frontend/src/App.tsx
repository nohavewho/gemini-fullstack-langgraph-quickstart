import { Routes, Route } from 'react-router-dom';
import { AzerbaijanPressMonitoringAI } from "@/components/ui/AzerbaijanPressMonitoringAI";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Callback from "@/pages/Callback";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route path="/*" element={<AzerbaijanPressMonitoringAI />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;